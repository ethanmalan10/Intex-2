using System.Security.Claims;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/donations")]
public class DonationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public DonationsController(AppDbContext db)
    {
        _db = db;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDonationRequest request)
    {
        if (request.Amount <= 0)
            return BadRequest(new { message = "Donation amount must be greater than zero." });

        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(userEmail))
            return Unauthorized();

        var supporter = await _db.Supporters.FirstOrDefaultAsync(s => s.Email == userEmail);
        if (supporter == null)
        {
            supporter = new Supporter
            {
                SupporterType = "Individual",
                DisplayName = string.IsNullOrWhiteSpace(request.DisplayName) ? userEmail : request.DisplayName,
                FirstName = request.FirstName,
                LastName = request.LastName,
                RelationshipType = "Donor",
                Country = "Brazil",
                Email = userEmail,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                FirstDonationDate = DateOnly.FromDateTime(DateTime.UtcNow.Date),
                AcquisitionChannel = "Website"
            };
            _db.Supporters.Add(supporter);
            await _db.SaveChangesAsync();
        }

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
}

public record CreateDonationRequest(decimal Amount, string? Notes, string? FirstName, string? LastName, string? DisplayName);
