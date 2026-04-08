using System.Security.Claims;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace backend.Controllers;

[ApiController]
[Route("api/donations")]
public class DonationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<DonationsController> _logger;

    public DonationsController(
        AppDbContext db,
        UserManager<ApplicationUser> userManager,
        IWebHostEnvironment environment,
        ILogger<DonationsController> logger)
    {
        _db = db;
        _userManager = userManager;
        _environment = environment;
        _logger = logger;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDonationRequest request)
    {
        try
        {
            if (request.Amount <= 0)
                return BadRequest(new { message = "Donation amount must be greater than zero." });

            var userEmail = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrWhiteSpace(userEmail))
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    var identityUser = await _userManager.FindByIdAsync(userId);
                    userEmail = identityUser?.Email;
                }
            }
            if (string.IsNullOrWhiteSpace(userEmail))
                return Unauthorized(new { message = "Authenticated user email is required for donation records." });

            var normalizedEmail = userEmail.Trim();
            var normalizedEmailLower = normalizedEmail.ToLowerInvariant();
            var supporter = await _db.Supporters.AsNoTracking().FirstOrDefaultAsync(
                s => s.Email != null && s.Email.Trim() == normalizedEmail);
            if (supporter == null)
            {
                supporter = await _db.Supporters.AsNoTracking().FirstOrDefaultAsync(
                    s => s.Email != null && EF.Functions.ILike(s.Email.Trim(), normalizedEmail));
            }
            if (supporter != null)
            {
                _logger.LogInformation("Donation: existing supporter found for email {Email}. SupporterId={SupporterId}", normalizedEmail, supporter.SupporterId);
            }
            if (supporter == null)
            {
                _logger.LogInformation("Donation: no supporter found for email {Email}; creating new supporter.", normalizedEmail);
                supporter = new Supporter
                {
                    SupporterType = "Individual",
                    DisplayName = string.IsNullOrWhiteSpace(request.DisplayName) ? userEmail : request.DisplayName,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    RelationshipType = "Donor",
                    Country = "Brazil",
                    Email = normalizedEmail,
                    Status = "active",
                    CreatedAt = DateTime.UtcNow,
                    FirstDonationDate = DateOnly.FromDateTime(DateTime.UtcNow.Date),
                    AcquisitionChannel = "Website"
                };
                _db.Supporters.Add(supporter);
                try
                {
                    await _db.SaveChangesAsync();
                }
                catch (DbUpdateException ex) when (IsSupporterPrimaryKeyConflict(ex))
                {
                    _logger.LogWarning(ex, "Donation: supporter insert hit PK conflict; resyncing supporter id sequence.");
                    _db.Entry(supporter).State = EntityState.Detached;
                    await SyncSupporterSequenceAsync();
                    _db.Supporters.Add(supporter);
                    await _db.SaveChangesAsync();
                }
                catch (DbUpdateException ex)
                {
                    // If another matching supporter already exists, reuse it instead of failing.
                    _logger.LogWarning(ex, "Donation: supporter insert failed; attempting existing supporter recovery.");
                    _db.Entry(supporter).State = EntityState.Detached;
                    supporter = await _db.Supporters.AsNoTracking().FirstOrDefaultAsync(
                        s => s.Email != null && s.Email.Trim().ToLower() == normalizedEmailLower);
                    if (supporter == null)
                    {
                        _logger.LogError("Donation: supporter creation failed and no existing supporter could be resolved for email {Email}.", normalizedEmail);
                        throw;
                    }
                }

                _logger.LogInformation("Donation: created new supporter for email {Email}. SupporterId={SupporterId}", normalizedEmail, supporter.SupporterId);
            }

            _logger.LogInformation("Donation: creating donation using SupporterId={SupporterId}", supporter.SupporterId);
            var donation = new Donation
            {
                SupporterId = supporter.SupporterId,
                DonationType = "Monetary",
                DonationDate = DateOnly.FromDateTime(DateTime.UtcNow.Date),
                IsRecurring = false,
                CampaignName = "Website Donation",
                ChannelSource = "Direct",
                CurrencyCode = "USD",
                Amount = request.Amount,
                EstimatedValue = request.Amount,
                ImpactUnit = "dollars",
                Notes = request.Notes
            };

            _db.Donations.Add(donation);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                donation.DonationId,
                donation.Amount,
                donation.DonationDate,
                supporter.SupporterId
            });
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Donation database write failed for authenticated user.");
            if (_environment.IsDevelopment())
            {
                return StatusCode(500, new { message = "Donation database write failed.", detail = ex.InnerException?.Message ?? ex.Message });
            }
            return StatusCode(500, new { message = "Donation could not be saved right now. Please try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Donation request failed unexpectedly.");
            if (_environment.IsDevelopment())
            {
                return StatusCode(500, new { message = "Unexpected donation error.", detail = ex.Message });
            }
            return StatusCode(500, new { message = "Donation could not be processed right now. Please try again." });
        }
    }

    private static bool IsSupporterPrimaryKeyConflict(DbUpdateException ex)
    {
        return ex.InnerException is PostgresException pg
            && pg.SqlState == PostgresErrorCodes.UniqueViolation
            && string.Equals(pg.ConstraintName, "PK_Supporters", StringComparison.OrdinalIgnoreCase);
    }

    private async Task SyncSupporterSequenceAsync()
    {
        // Keep PostgreSQL identity sequence aligned with current max supporter_id.
        await _db.Database.ExecuteSqlRawAsync(
            "SELECT setval(pg_get_serial_sequence('\"Supporters\"','SupporterId'), COALESCE((SELECT MAX(\"SupporterId\") FROM \"Supporters\"), 1));");
    }
}

public record CreateDonationRequest(decimal Amount, string? Notes, string? FirstName, string? LastName, string? DisplayName);
