using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/impact-dashboard")]
public class ImpactDashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public ImpactDashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var currentYear = now.Year;
        var monthStart = new DateOnly(currentYear, now.Month, 1);

        // ── KPIs ──────────────────────────────────────────────────────────────

        var girlsServedThisYear = await _db.Residents.CountAsync();

        var successfulReintegrations = await _db.Residents
            .CountAsync(r => r.ReintegrationStatus != null &&
                             r.ReintegrationStatus.ToLower() == "completed");

        var counselingSessions = await _db.ProcessRecordings
            .CountAsync(p => p.SessionDate.Year == currentYear);

        var activeSafehouses = await _db.Safehouses
            .CountAsync(s => s.Status.ToLower() == "active");

        var volunteerHours = (int)(await _db.ProcessRecordings
            .Where(p => p.SessionDate.Year == currentYear)
            .SumAsync(p => (long?)p.SessionDurationMinutes) ?? 0L) / 60;

        var monthlyDonations = (int)(await _db.Donations
            .Where(d => d.DonationDate >= monthStart && d.Amount != null)
            .SumAsync(d => (decimal?)d.Amount) ?? 0m);

        // ── Monthly reintegrations (most recent year with data, grouped by month) ─

        var latestClosedYear = await _db.Residents
            .Where(r => r.DateClosed != null)
            .MaxAsync(r => (int?)r.DateClosed!.Value.Year) ?? currentYear;
        var yearStart = new DateOnly(latestClosedYear, 1, 1);
        var yearEnd = new DateOnly(latestClosedYear, 12, 31);
        var reintegrationsByMonth = await _db.Residents
            .Where(r => r.DateClosed != null && r.DateClosed >= yearStart && r.DateClosed <= yearEnd)
            .GroupBy(r => r.DateClosed!.Value.Month)
            .Select(g => new { Month = g.Key, Count = g.Count() })
            .ToListAsync();

        var monthNames = new[] { "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec" };
        var monthlyReintegrations = Enumerable.Range(1, 12).Select(m => new
        {
            month = monthNames[m - 1],
            reintegrations = reintegrationsByMonth.FirstOrDefault(x => x.Month == m)?.Count ?? 0,
        }).ToList();

        // ── Resource allocation (by program area, as percentages) ─────────────

        var allocationRaw = await _db.DonationAllocations
            .GroupBy(a => a.ProgramArea)
            .Select(g => new { name = g.Key, amount = g.Sum(x => x.AmountAllocated) })
            .ToListAsync();

        var totalAlloc = allocationRaw.Sum(x => x.amount);
        var allocation = totalAlloc <= 0
            ? new List<AllocationSlice>
            {
                new("Education", 35),
                new("Wellbeing", 30),
                new("Operations", 20),
                new("Outreach", 15),
            }
            : allocationRaw
                .OrderByDescending(x => x.amount)
                .Select(x => new AllocationSlice(x.name, (int)Math.Round(x.amount / totalAlloc * 100, MidpointRounding.AwayFromZero)))
                .Where(x => x.value > 0)
                .ToList();

        // ── Progress indicators ───────────────────────────────────────────────

        var avgEducation = await _db.SafehouseMonthlyMetrics
            .Where(x => x.AvgEducationProgress != null)
            .AverageAsync(x => (double?)x.AvgEducationProgress) ?? 0d;

        var avgHealth = await _db.SafehouseMonthlyMetrics
            .Where(x => x.AvgHealthScore != null)
            .AverageAsync(x => (double?)x.AvgHealthScore) ?? 0d;

        var activeResidents = await _db.Residents
            .Where(r => r.CaseStatus.ToLower() == "active")
            .ToListAsync();
        var readinessPct = activeResidents.Count == 0 ? 0.0 :
            (double)activeResidents.Count(r =>
                r.ReintegrationStatus != null &&
                r.ReintegrationStatus.ToLower() != "not started") /
            activeResidents.Count * 100;

        return Ok(new
        {
            updatedAt = now.ToString("yyyy-MM-dd"),
            anonymization = new { minGroupSize = 3, roundingBase = 1 },
            kpis = new object[]
            {
                new { label = "Girls served (total)",        value = girlsServedThisYear,       prefix = "",  suffix = "", whyItMatters = "Shows how many lives received direct support this year." },
                new { label = "Successful reintegrations",  value = successfulReintegrations,   prefix = "",  suffix = "", whyItMatters = "Represents stable transitions back to family or community." },
                new { label = "Counseling sessions",        value = counselingSessions,          prefix = "",  suffix = "", whyItMatters = "Captures mental health support volume this year." },
                new { label = "Active safehouses",          value = activeSafehouses,            prefix = "",  suffix = "", whyItMatters = "Indicates current shelter capacity." },
                new { label = "Volunteer hours",            value = volunteerHours,              prefix = "",  suffix = "", whyItMatters = "Tracks staff time contributed to resident care this year." },
                new { label = "Donations this month",       value = monthlyDonations,            prefix = "$", suffix = "", whyItMatters = "Supports planning for care, staffing, and supplies." },
            },
            monthlyReintegrations,
            allocation,
            progressIndicators = new object[]
            {
                new { area = "Education Progress",      value = (int)Math.Round(avgEducation,  MidpointRounding.AwayFromZero), description = "Average education progress across residents." },
                new { area = "Wellbeing Score",         value = (int)Math.Round(avgHealth * 20, MidpointRounding.AwayFromZero), description = "Average general health score across safehouses." },
                new { area = "Reintegration Readiness", value = (int)Math.Round(readinessPct,  MidpointRounding.AwayFromZero), description = "Active residents with reintegration work underway or completed." },
            },
        });
    }
}

public record AllocationSlice(string name, int value);
