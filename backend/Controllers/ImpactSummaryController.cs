using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/impact/summary")]
public class ImpactSummaryController : ControllerBase
{
    private readonly AppDbContext _db;

    public ImpactSummaryController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var monthStart = new DateOnly(now.Year, now.Month, 1);

        var activeResidents = await _db.Residents
            .CountAsync(r => r.CaseStatus.ToLower() == "active");

        var totalReintegrations = await _db.Residents
            .CountAsync(r => r.ReintegrationStatus != null &&
                             r.ReintegrationStatus.ToLower() == "completed");

        var activeSafehouses = await _db.Safehouses
            .CountAsync(s => s.Status.ToLower() == "active");

        var counselingSessionsThisMonth = await _db.ProcessRecordings
            .CountAsync(p => p.SessionDate >= monthStart);

        var donationsThisMonth = await _db.Donations
            .Where(d => d.DonationDate >= monthStart && d.Amount != null)
            .SumAsync(d => (decimal?)d.Amount) ?? 0m;

        var volunteerHoursThisMonth = await _db.ProcessRecordings
            .Where(p => p.SessionDate >= monthStart)
            .SumAsync(p => (long?)p.SessionDurationMinutes) ?? 0L;
        volunteerHoursThisMonth /= 60;

        return Ok(new
        {
            activeResidents,
            totalReintegrations,
            activeSafehouses,
            counselingSessionsThisMonth,
            donationsThisMonth = (int)donationsThisMonth,
            volunteerHoursThisMonth = (int)volunteerHoursThisMonth,
        });
    }
}
