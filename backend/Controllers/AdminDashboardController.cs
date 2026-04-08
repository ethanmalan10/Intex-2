using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers;

[ApiController]
[Authorize(Roles = "Admin,donor,staff")]
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
        var topFiveHighRiskNames = supporterRows
            .Where(r => r.RiskBand == "High")
            .OrderByDescending(r => r.RiskScore)
            .Take(5)
            .Select(r => r.DisplayName)
            .ToList();

        var allResidents = await _db.Residents.ToListAsync();
        var allProcess = await _db.ProcessRecordings.ToListAsync();
        var allPlans = await _db.InterventionPlans.ToListAsync();
        var allIncidents = await _db.IncidentReports.ToListAsync();
        var allPosts = await _db.SocialMediaPosts.ToListAsync();
        var allDonations = await _db.Donations.ToListAsync();
        var allSupporters = await _db.Supporters.ToListAsync();

        var counselingRows = allResidents
            .Where(r => r.DateEnrolled != default)
            .Select(r =>
            {
                var featEnd = r.DateEnrolled.AddDays(90);
                var targetEnd = featEnd.AddDays(365);
                var sessions90 = allProcess
                    .Where(p => p.ResidentId == r.ResidentId && p.SessionDate >= r.DateEnrolled && p.SessionDate <= featEnd)
                    .ToList();
                return new
                {
                    r.ResidentId,
                    SessionCount90 = sessions90.Count,
                    Minutes90 = sessions90.Sum(s => s.SessionDurationMinutes),
                    Ready365 = r.DateClosed != null && r.DateClosed > featEnd && r.DateClosed <= targetEnd
                };
            })
            .ToList();

        var countCut = counselingRows.Count == 0 ? 0 : counselingRows.Select(x => x.SessionCount90).OrderBy(v => v).ElementAt((int)Math.Floor((counselingRows.Count - 1) * 0.67));
        var minuteCut = counselingRows.Count == 0 ? 0 : counselingRows.Select(x => x.Minutes90).OrderBy(v => v).ElementAt((int)Math.Floor((counselingRows.Count - 1) * 0.67));
        var highIntensity = counselingRows.Where(x => x.SessionCount90 >= countCut && x.Minutes90 >= minuteCut).ToList();
        var lowIntensity = counselingRows.Except(highIntensity).ToList();
        var highReadyRate = highIntensity.Count == 0 ? 0 : Math.Round(highIntensity.Count(x => x.Ready365) * 100.0 / highIntensity.Count, 1);
        var lowReadyRate = lowIntensity.Count == 0 ? 0 : Math.Round(lowIntensity.Count(x => x.Ready365) * 100.0 / lowIntensity.Count, 1);

        var firstDonationBySupporter = allDonations
            .GroupBy(d => d.SupporterId)
            .ToDictionary(g => g.Key, g => g.Min(x => x.DonationDate));
        var donorWindows = firstDonationBySupporter
            .Select(kv =>
            {
                var anchor = kv.Value;
                var featEnd = anchor.AddDays(60);
                var targetStart = featEnd.AddDays(1);
                var targetEnd = featEnd.AddDays(240);
                var futureCount = allDonations.Count(d => d.SupporterId == kv.Key && d.DonationDate >= targetStart && d.DonationDate <= targetEnd);
                return new { SupporterId = kv.Key, DonatedAgain = futureCount > 0 };
            })
            .ToList();
        var recurrenceRate = donorWindows.Count == 0 ? 0 : Math.Round(donorWindows.Count(x => x.DonatedAgain) * 100.0 / donorWindows.Count, 1);
        var activeSupporterById = activeSupporters.ToDictionary(s => s.SupporterId, s => string.IsNullOrWhiteSpace(s.DisplayName) ? $"Supporter {s.SupporterId}" : s.DisplayName);
        var donorLikelihoodRows = activeSupporters.Select(s =>
        {
            var don = supporterDonations.Where(d => d.SupporterId == s.SupporterId).ToList();
            var don365 = don.Where(d => d.DonationDate >= oneYearAgo).ToList();
            var lastDonation = don.OrderByDescending(d => d.DonationDate).FirstOrDefault();
            var recencyDays = lastDonation == null
                ? 730
                : (today.ToDateTime(TimeOnly.MinValue) - lastDonation.DonationDate.ToDateTime(TimeOnly.MinValue)).Days;
            var freq365 = don365.Count;
            var recurringShare = freq365 == 0 ? 0 : don365.Count(d => d.IsRecurring) / (double)freq365;
            var rawScore = (1.4 * Math.Min(freq365 / 12.0, 1.0)) + (0.9 * recurringShare) - (1.3 * Math.Min(recencyDays / 365.0, 1.0));
            // Convert weighted index to 0-1 likelihood for consistent percent display in UI.
            var likelihood = 1.0 / (1.0 + Math.Exp(-rawScore));
            return new { s.SupporterId, Score = likelihood };
        }).ToList();
        var topFiveLikelyDonorNames = donorLikelihoodRows
            .OrderByDescending(r => r.Score)
            .Take(5)
            .Select(r => activeSupporterById[r.SupporterId])
            .ToList();

        var readinessEligible = allResidents.Where(r => r.DateEnrolled != default).ToList();
        var readinessRows = readinessEligible.Select(r =>
        {
            var targetEnd = r.DateEnrolled.AddDays(365);
            var ready = r.DateClosed != null && r.DateClosed <= targetEnd;
            var daysToClose = r.DateClosed == null ? (int?)null : (r.DateClosed.Value.DayNumber - r.DateEnrolled.DayNumber);
            return new { ready, daysToClose };
        }).ToList();
        var readinessRate = readinessRows.Count == 0 ? 0 : Math.Round(readinessRows.Count(x => x.ready) * 100.0 / readinessRows.Count, 1);
        var medianDaysToClose = readinessRows.Where(x => x.daysToClose != null).Select(x => x.daysToClose!.Value).OrderBy(v => v).DefaultIfEmpty(0).ElementAt(readinessRows.Count(x => x.daysToClose != null) / 2);
        var topFiveLikelyReadyRows = readinessEligible
            .Select(r =>
            {
                var recentSessions = allProcess.Where(p => p.ResidentId == r.ResidentId && p.SessionDate >= today.AddDays(-90)).ToList();
                var progressRate = recentSessions.Count == 0 ? 0 : recentSessions.Count(s => s.ProgressNoted) / (double)recentSessions.Count;
                var concernRate = recentSessions.Count == 0 ? 0 : recentSessions.Count(s => s.ConcernsFlagged) / (double)recentSessions.Count;
                var baseScore = 0.9 * progressRate - 0.8 * concernRate;
                if (r.DateClosed != null) baseScore += 0.5;
                var name = string.IsNullOrWhiteSpace(r.InternalCode) ? $"Resident {r.ResidentId}" : r.InternalCode;
                return new { name, score = Math.Round(baseScore, 4) };
            })
            .OrderByDescending(x => x.score)
            .Take(5)
            .ToList();
        var topFiveLikelyReadyNames = topFiveLikelyReadyRows.Select(x => x.name).ToList();

        var concernResidents = allProcess
            .Where(p => p.SessionDate >= today.AddDays(-90) && p.ConcernsFlagged)
            .Select(p => p.ResidentId)
            .Distinct()
            .ToHashSet();
        var severeIncidentResidents = allIncidents
            .Where(i => string.Equals(i.Severity, "High", StringComparison.OrdinalIgnoreCase) || string.Equals(i.Severity, "Critical", StringComparison.OrdinalIgnoreCase))
            .Select(i => i.ResidentId)
            .Distinct()
            .ToHashSet();
        var riskEscalatedResidents = concernResidents.Union(severeIncidentResidents).Count();
        var topFiveEscalationRows = allResidents
            .Select(r =>
            {
                var recentSessions = allProcess.Where(p => p.ResidentId == r.ResidentId && p.SessionDate >= today.AddDays(-90)).ToList();
                var concernCount = recentSessions.Count(s => s.ConcernsFlagged);
                var severeCount = allIncidents.Count(i => i.ResidentId == r.ResidentId && (string.Equals(i.Severity, "High", StringComparison.OrdinalIgnoreCase) || string.Equals(i.Severity, "Critical", StringComparison.OrdinalIgnoreCase)));
                var score = (2.0 * severeCount) + concernCount;
                var name = string.IsNullOrWhiteSpace(r.InternalCode) ? $"Resident {r.ResidentId}" : r.InternalCode;
                return new { name, score };
            })
            .Where(x => x.score > 0)
            .OrderByDescending(x => x.score)
            .Take(5)
            .ToList();
        var topFiveEscalationNames = topFiveEscalationRows.Select(x => x.name).ToList();

        var donatedWithPost = allDonations.Where(d => d.ReferralPostId != null).ToList();
        var avgDonationFromSocial = donatedWithPost.Count == 0 ? 0m : Math.Round(donatedWithPost.Average(d => d.Amount ?? d.EstimatedValue ?? 0m), 2);
        var referredDonationsByPlatform = (from d in donatedWithPost
                                           join p in allPosts on d.ReferralPostId equals p.PostId
                                           group d by (string.IsNullOrWhiteSpace(p.Platform) ? "Unknown" : p.Platform.Trim()) into g
                                           orderby g.Count() descending
                                           select new
                                           {
                                               Platform = g.Key,
                                               Count = g.Count()
                                           }).ToList();
        var topPlatform = referredDonationsByPlatform.FirstOrDefault();
        var topPlatformLabel = topPlatform == null ? "N/A" : $"{topPlatform.Platform} ({topPlatform.Count} referred donations)";

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
            },
            donorRecurrenceForecast = new
            {
                topLikelyToDonateAgain = topFiveLikelyDonorNames
            },
            reintegrationReadiness = new
            {
                topLikelyReadyResidents = topFiveLikelyReadyNames
            },
            residentRiskEscalation = new
            {
                topEscalationResidents = topFiveEscalationNames
            },
            pipelineVisuals = new
            {
                inactiveSupporterRisk = new
                {
                    riskBandCounts = new[]
                    {
                        new { label = "High", value = highRiskCount },
                        new { label = "Medium", value = mediumRiskCount },
                        new { label = "Low", value = lowRiskCount },
                    }
                },
                counselingIntensityReadinessEffect = new
                {
                    readinessRateComparison = new[]
                    {
                        new { label = "High Intensity", value = highReadyRate },
                        new { label = "Low Intensity", value = lowReadyRate },
                    }
                },
                donorRecurrenceForecast = new
                {
                    topLikelyDonorScores = donorLikelihoodRows
                        .OrderByDescending(r => r.Score)
                        .Take(5)
                        .Select(r => new
                        {
                            name = activeSupporterById[r.SupporterId],
                            score = Math.Round(r.Score, 4)
                        })
                        .ToList()
                },
                reintegrationReadiness = new
                {
                    readinessOverview = new[]
                    {
                        new { label = "Ready <=365d", value = readinessRate },
                        new { label = "Not Ready <=365d", value = Math.Round(100 - readinessRate, 1) },
                    },
                    topLikelyReadyScores = topFiveLikelyReadyRows
                },
                residentRiskEscalation = new
                {
                    escalationSignalCounts = new[]
                    {
                        new { label = "Concerns Flagged", value = concernResidents.Count },
                        new { label = "Severe Incidents", value = severeIncidentResidents.Count },
                        new { label = "Union Flagged", value = riskEscalatedResidents },
                    },
                    topEscalationScores = topFiveEscalationRows
                },
                socialContentDonationImpact = new
                {
                    donationImpactSummary = referredDonationsByPlatform
                        .Select(x => new { label = x.Platform, value = (double)x.Count })
                        .ToList()
                }
            },
            pipelineResults = new[]
            {
                new
                {
                    name = "inactive_supporter_risk",
                    businessProblem = "Which active supporters are at risk of going silent so staff can intervene before donor lapse?",
                    runStatus = "Live from database",
                    results = new[]
                    {
                        $"Active supporters scored: {activeSupporters.Count}",
                        $"High risk: {highRiskCount}, Medium risk: {mediumRiskCount}, Low risk: {lowRiskCount}",
                        $"Top risk score: {(topAtRisk.FirstOrDefault()?.RiskScore ?? 0):0.000}",
                        $"Most at-risk supporters: {(topFiveHighRiskNames.Count == 0 ? "None" : string.Join(", ", topFiveHighRiskNames))}"
                    }
                },
                new
                {
                    name = "counseling-intensity-readiness-effect",
                    businessProblem = "How does counseling count/intensity relate to readiness so case effort can be prioritized?",
                    runStatus = "Live summary from resident/process data",
                    results = new[]
                    {
                        $"Residents evaluated: {counselingRows.Count}",
                        $"High-intensity residents: {highIntensity.Count} (cutoffs count>={countCut}, minutes>={minuteCut})",
                        $"Readiness rate high vs low intensity: {highReadyRate:0.0}% vs {lowReadyRate:0.0}%"
                    }
                },
                new
                {
                    name = "donor-recurrence-forecast",
                    businessProblem = "Which donors are likely to donate again soon so outreach timing can be optimized?",
                    runStatus = "Live summary from supporter/donation history",
                    results = new[]
                    {
                        $"Supporters with usable window: {donorWindows.Count}",
                        $"Observed donate-again rate (day 61-240): {recurrenceRate:0.0}%",
                        $"Recent donations (30d): {donationsLast30Count}",
                        $"Top 5 likely to donate again: {(topFiveLikelyDonorNames.Count == 0 ? "None" : string.Join(", ", topFiveLikelyDonorNames))}"
                    }
                },
                new
                {
                    name = "reintegration-readiness",
                    businessProblem = "Which residents are likely ready for reintegration to support case conference decisions?",
                    runStatus = "Live summary from resident timelines",
                    results = new[]
                    {
                        $"Residents evaluated: {readinessRows.Count}",
                        $"Closed within 365 days of enrollment: {readinessRate:0.0}%",
                        $"Median days-to-close among closed cases: {medianDaysToClose}",
                        $"Top 5 likely-ready residents: {(topFiveLikelyReadyNames.Count == 0 ? "None" : string.Join(", ", topFiveLikelyReadyNames))}"
                    }
                },
                new
                {
                    name = "resident-risk-escalation",
                    businessProblem = "Which resident cases are escalating so preventive interventions happen earlier?",
                    runStatus = "Live summary from concerns/incidents",
                    results = new[]
                    {
                        $"Residents with concerns flagged in last 90d: {concernResidents.Count}",
                        $"Residents with severe incidents: {severeIncidentResidents.Count}",
                        $"Total residents flagged by escalation signals: {riskEscalatedResidents}",
                        $"Top 5 residents by escalation signal: {(topFiveEscalationNames.Count == 0 ? "None" : string.Join(", ", topFiveEscalationNames))}"
                    }
                },
                new
                {
                    name = "social-content-donation-impact",
                    businessProblem = "Which social content is associated with stronger donation outcomes?",
                    runStatus = "Live summary from social posts + donation referrals",
                    results = new[]
                    {
                        $"Donations with social referral post id: {donatedWithPost.Count}",
                        $"Average donation from social referrals: {avgDonationFromSocial:0.00}",
                        $"Top platform by referred donations: {topPlatformLabel}"
                    }
                }
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
