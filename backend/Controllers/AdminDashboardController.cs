using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controllers;

[ApiController]
[Route("api/admin-dashboard")]
public class AdminDashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminDashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var thirtyDaysAgo = today.AddDays(-30);
        var fourteenDaysOut = today.AddDays(14);
        var oneYearAgo = today.AddDays(-365);

        var activeResidents = await _db.Residents
            .CountAsync(r => r.DateClosed == null && r.CaseStatus.ToLower() != "closed");

        var recentDonations = await _db.Donations
            .Where(d => d.DonationDate >= thirtyDaysAgo)
            .ToListAsync();

        var donationsLast30Count = recentDonations.Count;
        var donationsLast30Amount = recentDonations.Sum(d => d.Amount ?? d.EstimatedValue ?? 0m);

        var upcomingCaseConferences = await _db.InterventionPlans
            .CountAsync(p => p.CaseConferenceDate != null
                && p.CaseConferenceDate >= today
                && p.CaseConferenceDate <= fourteenDaysOut);

        var processLast30 = await _db.ProcessRecordings
            .Where(p => p.SessionDate >= thirtyDaysAgo)
            .ToListAsync();

        var progressRateLast30 = processLast30.Count == 0
            ? 0
            : Math.Round(processLast30.Count(p => p.ProgressNoted) * 100.0 / processLast30.Count, 1);

        var activeSupporters = await _db.Supporters
            .Where(s => s.Status.ToLower() == "active")
            .Select(s => new { s.SupporterId, s.DisplayName })
            .ToListAsync();

        var activeIds = activeSupporters.Select(s => s.SupporterId).ToHashSet();
        var supporterDonations = await _db.Donations
            .Where(d => activeIds.Contains(d.SupporterId))
            .ToListAsync();

        var supporterRows = activeSupporters.Select(s =>
        {
            var allDon = supporterDonations.Where(d => d.SupporterId == s.SupporterId).ToList();
            var don365 = allDon.Where(d => d.DonationDate >= oneYearAgo).ToList();

            var lastDonation = allDon.OrderByDescending(d => d.DonationDate).FirstOrDefault();
            var recencyDays = lastDonation == null
                ? 730
                : (today.ToDateTime(TimeOnly.MinValue) - lastDonation.DonationDate.ToDateTime(TimeOnly.MinValue)).Days;

            var freq365 = don365.Count;
            var channelCount = don365
                .Select(d => string.IsNullOrWhiteSpace(d.ChannelSource) ? "Unknown" : d.ChannelSource.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Count();
            var recurringShare = freq365 == 0 ? 0 : don365.Count(d => d.IsRecurring) / (double)freq365;

            return new SupporterRiskRow
            {
                SupporterId = s.SupporterId,
                DisplayName = string.IsNullOrWhiteSpace(s.DisplayName) ? $"Supporter {s.SupporterId}" : s.DisplayName,
                RecencyDays = recencyDays,
                Frequency365 = freq365,
                ChannelCount365 = channelCount,
                RecurringShare365 = recurringShare
            };
        }).ToList();

        double SafeNormalize(double value, double min, double max)
            => max <= min ? 0.0 : (value - min) / (max - min);

        var minRecency = supporterRows.Min(r => (double)r.RecencyDays);
        var maxRecency = supporterRows.Max(r => (double)r.RecencyDays);
        var minFreq = supporterRows.Min(r => (double)r.Frequency365);
        var maxFreq = supporterRows.Max(r => (double)r.Frequency365);
        var minChannels = supporterRows.Min(r => (double)r.ChannelCount365);
        var maxChannels = supporterRows.Max(r => (double)r.ChannelCount365);

        foreach (var row in supporterRows)
        {
            var recencyNorm = SafeNormalize(row.RecencyDays, minRecency, maxRecency);
            var freqNorm = SafeNormalize(row.Frequency365, minFreq, maxFreq);
            var channelNorm = SafeNormalize(row.ChannelCount365, minChannels, maxChannels);
            var recurringNorm = Math.Clamp(row.RecurringShare365, 0.0, 1.0);

            var linear = 1.8 * recencyNorm - 1.2 * freqNorm - 0.8 * channelNorm - 0.6 * recurringNorm;
            var risk = 1.0 / (1.0 + Math.Exp(-linear));
            row.RiskScore = Math.Round(risk, 4);
            row.RiskBand = risk >= 0.66 ? "High" : risk >= 0.4 ? "Medium" : "Low";
        }

        var highRiskCount = supporterRows.Count(r => r.RiskBand == "High");
        var mediumRiskCount = supporterRows.Count(r => r.RiskBand == "Medium");
        var lowRiskCount = supporterRows.Count(r => r.RiskBand == "Low");

        var topAtRisk = supporterRows
            .OrderByDescending(r => r.RiskScore)
            .Take(10)
            .ToList();

        return Ok(new
        {
            generatedAtUtc = DateTime.UtcNow,
            commandCenter = new
            {
                activeResidents,
                donationsLast30Count,
                donationsLast30Amount,
                upcomingCaseConferences14d = upcomingCaseConferences,
                progressNotedRate30d = progressRateLast30
            },
            inactiveSupporterRisk = new
            {
                activeSupporters = activeSupporters.Count,
                highRiskCount,
                mediumRiskCount,
                lowRiskCount,
                topAtRisk
            }
        });
    }

    private sealed class SupporterRiskRow
    {
        public int SupporterId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public int RecencyDays { get; set; }
        public int Frequency365 { get; set; }
        public int ChannelCount365 { get; set; }
        public double RecurringShare365 { get; set; }
        public double RiskScore { get; set; }
        public string RiskBand { get; set; } = "Low";
    }
}
