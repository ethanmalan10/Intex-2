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
}

public record UpdateUserRequest(string Email, string? FirstName, string? LastName, string? Role);
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
