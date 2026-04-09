using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/landing")]
public class LandingController : ControllerBase
{
    private readonly AppDbContext _db;

    public LandingController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var yearStart = new DateOnly(today.Year, 1, 1);

        var girlsCurrentlyInCare = await _db.Residents
            .CountAsync(r => r.DateClosed == null && r.CaseStatus.ToLower() != "closed");

        var successfulReintegrationsToDate = await _db.Residents
            .CountAsync(r => r.ReintegrationStatus != null &&
                             r.ReintegrationStatus.ToLower() == "completed");

        var activeSafehouses = await _db.Safehouses
            .CountAsync(s => s.Status.ToLower() == "active");

        var monthStart = new DateOnly(today.Year, today.Month, 1);
        var counselingSessionsThisMonth = await _db.ProcessRecordings
            .CountAsync(p => p.SessionDate >= monthStart);

        var monthlyDonations = await _db.Donations
            .Where(d => d.DonationDate >= today.AddDays(-30))
            .SumAsync(d => (d.Amount ?? d.EstimatedValue) ?? 0m);

        var latestClosedYear = await _db.Residents
            .Where(r => r.DateClosed != null)
            .MaxAsync(r => (int?)r.DateClosed!.Value.Year) ?? today.Year;
        var latestYearStart = new DateOnly(latestClosedYear, 1, 1);
        var latestYearEnd = new DateOnly(latestClosedYear, 12, 31);
        var monthlyReintegrations = await _db.Residents
            .Where(r => r.DateClosed != null && r.DateClosed >= latestYearStart && r.DateClosed <= latestYearEnd)
            .GroupBy(r => r.DateClosed!.Value.Month)
            .Select(g => new { month = g.Key, reintegrations = g.Count() })
            .ToListAsync();

        var monthNames = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
        var monthlyTrend = Enumerable.Range(1, 12)
            .Select(m => new
            {
                month = monthNames[m - 1],
                reintegrations = monthlyReintegrations.FirstOrDefault(x => x.month == m)?.reintegrations ?? 0
            })
            .ToList();

        var allocationRaw = await _db.DonationAllocations
            .GroupBy(a => a.ProgramArea)
            .Select(g => new { name = g.Key, amount = g.Sum(x => x.AmountAllocated) })
            .ToListAsync();
        var totalAlloc = allocationRaw.Sum(x => x.amount);
        var donationBreakdown = totalAlloc <= 0
            ? new[]
            {
                new { name = "Education", value = 35 },
                new { name = "Wellbeing", value = 30 },
                new { name = "Operations", value = 20 },
                new { name = "Outreach", value = 15 },
            }
            : allocationRaw
                .OrderByDescending(x => x.amount)
                .Select(x => new { x.name, value = (int)Math.Round((x.amount / totalAlloc) * 100, MidpointRounding.AwayFromZero) })
                .Where(x => x.value > 0)
                .ToArray();

        return Ok(new
        {
            hero = new
            {
                girlsCurrentlyInCare,
                successfulReintegrationsToDate,
                activeSafehouses
            },
            impact = new
            {
                girlsCurrentlyInCare,
                successfulReintegrations = successfulReintegrationsToDate,
                activeSafehouses,
                counselingSessionsThisMonth,
                volunteerHoursThisMonth = (int)(await _db.ProcessRecordings
                    .Where(p => p.SessionDate >= monthStart)
                    .SumAsync(p => (long?)p.SessionDurationMinutes) ?? 0L) / 60,
                monthlyDonations,
                monthlyReintegrations = monthlyTrend,
                donationBreakdown
            }
        });
    }
}
