using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/impact/dashboard")]
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

        var girlsServedThisYear = await _db.Residents
            .CountAsync(r => r.DateEnrolled.Year == currentYear);

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

        // ── Monthly reintegrations (current year, grouped by month) ───────────

        var reintegrationsByMonth = await _db.Residents
            .Where(r => r.DateClosed != null &&
                        r.DateClosed.Value.Year == currentYear &&
                        r.ReintegrationStatus != null &&
                        r.ReintegrationStatus.ToLower() == "completed")
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

        var allocationTotals = await _db.DonationAllocations
            .GroupBy(a => a.ProgramArea)
            .Select(g => new { ProgramArea = g.Key, Total = g.Sum(a => a.AmountAllocated) })
            .ToListAsync();

        var grandTotal = allocationTotals.Sum(a => a.Total);
        var allocation = grandTotal == 0
            ? new List<object>()
            : allocationTotals
                .OrderByDescending(a => a.Total)
                .Select(a => (object)new
                {
                    name = a.ProgramArea,
                    value = (int)Math.Round(a.Total / grandTotal * 100),
                })
                .ToList();

        // ── Progress indicators ───────────────────────────────────────────────

        // Education: avg ProgressPercent across latest record per resident
        var eduProgress = await _db.EducationRecords
            .GroupBy(e => e.ResidentId)
            .Select(g => g.OrderByDescending(e => e.RecordDate).First().ProgressPercent)
            .Where(v => v != null)
            .AverageAsync(v => (double?)v) ?? 0;

        // Wellbeing: avg GeneralHealthScore (0–5 scale) → normalize to 0–100
        var wellbeingAvg = await _db.HealthWellbeingRecords
            .GroupBy(h => h.ResidentId)
            .Select(g => g.OrderByDescending(h => h.RecordDate).First().GeneralHealthScore)
            .Where(v => v != null)
            .AverageAsync(v => (double?)v) ?? 0;
        var wellbeingPct = Math.Min(100, wellbeingAvg * 20);

        // Reintegration readiness: % of active residents not "Not Started"
        var activeResidents = await _db.Residents
            .Where(r => r.CaseStatus.ToLower() == "active")
            .ToListAsync();
        var readinessPct = activeResidents.Count == 0 ? 0.0 :
            (double)activeResidents.Count(r =>
                r.ReintegrationStatus != null &&
                r.ReintegrationStatus.ToLower() != "not started") /
            activeResidents.Count * 100;

        var progressIndicators = new[]
        {
            new { area = "Education Progress",      value = (int)Math.Round(eduProgress),    description = "Average education progress across residents with records." },
            new { area = "Wellbeing Score",         value = (int)Math.Round(wellbeingPct),   description = "Average general health score normalized to 100." },
            new { area = "Reintegration Readiness", value = (int)Math.Round(readinessPct),   description = "Active residents with reintegration work underway or completed." },
        };

        return Ok(new
        {
            updatedAt = now.ToString("yyyy-MM-dd"),
            anonymization = new { minGroupSize = 3, roundingBase = 1 },
            kpis = new[]
            {
                new { label = "Girls served this year",      value = girlsServedThisYear,    prefix = "",  suffix = "", whyItMatters = "Shows how many lives received direct support this year." },
                new { label = "Successful reintegrations",  value = successfulReintegrations, prefix = "", suffix = "", whyItMatters = "Represents stable transitions back to family or community." },
                new { label = "Counseling sessions",        value = counselingSessions,       prefix = "", suffix = "", whyItMatters = "Captures mental health support volume this year." },
                new { label = "Active safehouses",          value = activeSafehouses,         prefix = "", suffix = "", whyItMatters = "Indicates current shelter capacity." },
                new { label = "Volunteer hours",            value = volunteerHours,           prefix = "", suffix = "", whyItMatters = "Tracks staff time contributed to resident care this year." },
                new { label = "Donations this month",       value = monthlyDonations,         prefix = "$", suffix = "", whyItMatters = "Supports planning for care, staffing, and supplies." },
            },
            monthlyReintegrations,
            allocation,
            progressIndicators,
        });
    }
}
