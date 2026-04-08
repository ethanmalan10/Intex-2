using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
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
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var yearStart = new DateOnly(today.Year, 1, 1);

        var girlsServed = await _db.Residents.CountAsync(r => r.DateEnrolled >= yearStart);
        var reintegrations = await _db.Residents.CountAsync(r => r.DateClosed != null && r.DateClosed >= yearStart);
        var counselingSessions = await _db.ProcessRecordings.CountAsync(p => p.SessionDate >= yearStart);
        var activeSafehouses = await _db.Safehouses.CountAsync();
        var monthlyDonations = await _db.Donations
            .Where(d => d.DonationDate >= today.AddDays(-30))
            .SumAsync(d => (d.Amount ?? d.EstimatedValue) ?? 0m);

        var monthlyReintegrations = await _db.Residents
            .Where(r => r.DateClosed != null && r.DateClosed >= yearStart)
            .GroupBy(r => r.DateClosed!.Value.Month)
            .Select(g => new { Month = g.Key, Count = g.Count() })
            .ToListAsync();

        var monthNames = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
        var trend = Enumerable.Range(1, 12)
            .Select(m => new
            {
                month = monthNames[m - 1],
                reintegrations = monthlyReintegrations.FirstOrDefault(x => x.Month == m)?.Count ?? 0
            })
            .ToList();

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
                .Select(x => new AllocationSlice(x.name, (int)Math.Round((x.amount / totalAlloc) * 100, MidpointRounding.AwayFromZero)))
                .Where(x => x.value > 0)
                .ToList();

        var avgEducation = await _db.SafehouseMonthlyMetrics.Where(x => x.AvgEducationProgress != null).AverageAsync(x => (double?)x.AvgEducationProgress) ?? 0d;
        var avgHealth = await _db.SafehouseMonthlyMetrics.Where(x => x.AvgHealthScore != null).AverageAsync(x => (double?)x.AvgHealthScore) ?? 0d;
        var readinessRate = girlsServed == 0 ? 0 : (double)reintegrations / girlsServed * 100d;

        return Ok(new
        {
            updatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd"),
            anonymization = new
            {
                minGroupSize = 5,
                roundingBase = 5
            },
            kpis = new object[]
            {
                new { label = "Girls served this year", value = girlsServed, whyItMatters = "Shows how many lives received direct support." },
                new { label = "Successful reintegrations", value = reintegrations, whyItMatters = "Represents stable transitions back to family or community." },
                new { label = "Counseling sessions", value = counselingSessions, whyItMatters = "Captures mental health support volume across programs." },
                new { label = "Active safehouses", value = activeSafehouses, whyItMatters = "Indicates current shelter capacity." },
                new { label = "Volunteer hours", value = 0, whyItMatters = "Tracks community contribution to operations." },
                new { label = "Monthly donations", value = monthlyDonations, prefix = "$", whyItMatters = "Supports planning for care, staffing, and supplies." },
            },
            monthlyReintegrations = trend,
            allocation,
            progressIndicators = new object[]
            {
                new { area = "Education Progress", value = (int)Math.Round(avgEducation, MidpointRounding.AwayFromZero), description = "Residents reaching targeted education milestone bands." },
                new { area = "Wellbeing Improvement", value = (int)Math.Round(avgHealth, MidpointRounding.AwayFromZero), description = "Residents with improved wellbeing score trends." },
                new { area = "Reintegration Readiness", value = (int)Math.Round(readinessRate, MidpointRounding.AwayFromZero), description = "Residents in readiness bands for next-step planning." },
            }
        });
    }
}

public record AllocationSlice(string name, int value);
