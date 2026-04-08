using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public class AdminUsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _db;

    public AdminUsersController(UserManager<ApplicationUser> userManager, AppDbContext db)
    {
        _userManager = userManager;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string sort = "newest",
        [FromQuery] string? role = null,
        [FromQuery] string? q = null,
        [FromQuery] string? donationFilter = null)
    {
        var users = await _userManager.Users.ToListAsync();
        var supporterByEmail = await _db.Supporters.ToDictionaryAsync(s => s.Email, s => s);
        var donationTotals = await _db.Donations
            .GroupBy(d => d.SupporterId)
            .Select(g => new { SupporterId = g.Key, Total = g.Sum(x => x.Amount ?? x.EstimatedValue ?? 0m) })
            .ToDictionaryAsync(x => x.SupporterId, x => x.Total);

        var rows = new List<AdminUserRow>();
        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);
            supporterByEmail.TryGetValue(u.Email ?? string.Empty, out var supporter);
            var total = supporter != null && donationTotals.TryGetValue(supporter.SupporterId, out var value) ? value : 0m;

            rows.Add(new AdminUserRow(
                u.Id,
                u.Email ?? string.Empty,
                u.FirstName,
                u.LastName,
                roles.ToList(),
                roles.FirstOrDefault() ?? "none",
                total,
                supporter?.CreatedAt,
                supporter?.SupporterId,
                supporter?.Status
            ));
        }

        var query = rows.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(r => string.Equals(r.PrimaryRole, role, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(q))
        {
            var search = q.Trim().ToLowerInvariant();
            query = query.Where(r =>
                r.Email.ToLowerInvariant().Contains(search) ||
                (r.FirstName ?? string.Empty).ToLowerInvariant().Contains(search) ||
                (r.LastName ?? string.Empty).ToLowerInvariant().Contains(search));
        }

        if (string.Equals(donationFilter, "with", StringComparison.OrdinalIgnoreCase))
            query = query.Where(r => r.TotalDonations > 0);
        if (string.Equals(donationFilter, "without", StringComparison.OrdinalIgnoreCase))
            query = query.Where(r => r.TotalDonations <= 0);

        query = sort.ToLowerInvariant() switch
        {
            "oldest" => query.OrderBy(r => r.CreatedAt ?? DateTime.MinValue),
            "donation-high" => query.OrderByDescending(r => r.TotalDonations),
            "donation-low" => query.OrderBy(r => r.TotalDonations),
            _ => query.OrderByDescending(r => r.CreatedAt ?? DateTime.MinValue)
        };

        return Ok(query.ToList());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        var roles = await _userManager.GetRolesAsync(user);
        var supporter = await _db.Supporters.FirstOrDefaultAsync(s => s.Email == user.Email);
        var donations = supporter == null
            ? new List<object>()
            : await _db.Donations
                .Where(d => d.SupporterId == supporter.SupporterId)
                .OrderByDescending(d => d.DonationDate)
                .Take(10)
                .Select(d => new { d.DonationId, d.DonationDate, d.Amount, d.DonationType, d.CampaignName })
                .ToListAsync<object>();

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            Roles = roles,
            Supporter = supporter == null ? null : new { supporter.SupporterId, supporter.Status, supporter.CreatedAt, supporter.FirstDonationDate },
            RecentDonations = donations
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        user.UserName = request.Email;
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded) return BadRequest(updateResult.Errors);

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            if (currentRoles.Count > 0) await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, request.Role);
        }

        return Ok(new { message = "User updated." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);
        return Ok(new { message = "User deleted." });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Role))
        {
            return BadRequest(new { message = "Full name, email, password, and role are required." });
        }

        var email = request.Email.Trim();
        var role = request.Role.Trim().ToLowerInvariant();
        if (role is not ("admin" or "staff" or "donor"))
        {
            return BadRequest(new { message = "Role must be admin, staff, or donor." });
        }

        if (await _userManager.FindByEmailAsync(email) is not null)
        {
            return Conflict(new { message = "A user with this email already exists." });
        }

        var fullName = request.FullName.Trim();
        var split = fullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        var firstName = split.Length > 0 ? split[0] : fullName;
        var lastName = split.Length > 1 ? split[1] : string.Empty;

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "Failed to create user.",
                errors = createResult.Errors.Select(e => e.Description)
            });
        }

        var roleResult = await _userManager.AddToRoleAsync(user, role);
        if (!roleResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "User created but role assignment failed.",
                errors = roleResult.Errors.Select(e => e.Description)
            });
        }

        // Keep donor reporting consistent by creating a linked Supporter row for donor users.
        var emailLower = email.ToLowerInvariant();
        if (role == "donor" && !await _db.Supporters.AnyAsync(s => s.Email != null && s.Email.Trim().ToLower() == emailLower))
        {
            _db.Supporters.Add(new Supporter
            {
                SupporterType = "MonetaryDonor",
                DisplayName = fullName,
                FirstName = firstName,
                LastName = string.IsNullOrWhiteSpace(lastName) ? null : lastName,
                RelationshipType = "Donor",
                Country = "Brazil",
                Email = email,
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                AcquisitionChannel = "AdminCreated"
            });
            await _db.SaveChangesAsync();
        }

        return Ok(new { message = "User created successfully." });
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var donations = await _db.Donations.ToListAsync();
        var donationsOverTime = donations
            .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new TimePoint(
                $"{g.Key.Year}-{g.Key.Month:D2}",
                g.Sum(x => x.Amount ?? x.EstimatedValue ?? 0m),
                g.Count()))
            .ToList();

        var users = await _userManager.Users.ToListAsync();
        var supporterByEmail = await _db.Supporters.ToDictionaryAsync(s => s.Email, s => s);
        var donorUsers = new List<ApplicationUser>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Any(r => string.Equals(r, "donor", StringComparison.OrdinalIgnoreCase)))
            {
                donorUsers.Add(user);
            }
        }

        var donorsAddedOverTime = donorUsers
            .Select(u =>
            {
                supporterByEmail.TryGetValue(u.Email ?? string.Empty, out var supporter);
                return supporter?.CreatedAt;
            })
            .Where(d => d.HasValue)
            .Select(d => d!.Value)
            .GroupBy(d => new { d.Year, d.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new DonorPoint($"{g.Key.Year}-{g.Key.Month:D2}", g.Count()))
            .ToList();

        return Ok(new
        {
            donationsOverTime,
            donorsAddedOverTime
        });
    }
}

public record UpdateUserRequest(string Email, string? FirstName, string? LastName, string? Role);
public record CreateUserRequest(string FullName, string Email, string Password, string Role);
public record AdminUserRow(
    string Id,
    string Email,
    string? FirstName,
    string? LastName,
    List<string> Roles,
    string PrimaryRole,
    decimal TotalDonations,
    DateTime? CreatedAt,
    int? SupporterId,
    string? SupporterStatus
);
public record TimePoint(string Period, decimal TotalAmount, int DonationCount);
public record DonorPoint(string Period, int DonorCount);
