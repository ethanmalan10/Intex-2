using System.ComponentModel.DataAnnotations;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Authorize(Roles = "Admin,staff")]
[Route("api/donors-contributions")]
public class DonorsContributionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public DonorsContributionsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("supporters")]
    public async Task<IActionResult> GetSupporters(
        [FromQuery] string? status,
        [FromQuery] string? supporterType,
        [FromQuery] string? search)
    {
        var q = _db.Supporters.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(s => s.Status.ToLower() == status.Trim().ToLower());

        if (!string.IsNullOrWhiteSpace(supporterType))
            q = q.Where(s => s.SupporterType.ToLower() == supporterType.Trim().ToLower());

        if (!string.IsNullOrWhiteSpace(search))
        {
            var needle = search.Trim().ToLower();
            q = q.Where(s =>
                s.DisplayName.ToLower().Contains(needle) ||
                (s.Email != null && s.Email.ToLower().Contains(needle)) ||
                (s.OrganizationName != null && s.OrganizationName.ToLower().Contains(needle)));
        }

        var supporters = await q
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new SupporterDto(
                s.SupporterId,
                s.SupporterType,
                s.DisplayName,
                s.OrganizationName,
                s.FirstName,
                s.LastName,
                s.RelationshipType,
                s.Region,
                s.Country,
                s.Email,
                s.Phone,
                s.Status,
                s.CreatedAt,
                s.FirstDonationDate,
                s.AcquisitionChannel
            ))
            .ToListAsync();

        return Ok(supporters);
    }

    [HttpGet("donations")]
    public async Task<IActionResult> GetDonations(
        [FromQuery] int? supporterId,
        [FromQuery] string? donationType,
        [FromQuery] DateOnly? startDate,
        [FromQuery] DateOnly? endDate)
    {
        var q = _db.Donations.AsQueryable();

        if (supporterId.HasValue)
            q = q.Where(d => d.SupporterId == supporterId.Value);

        if (!string.IsNullOrWhiteSpace(donationType))
            q = q.Where(d => d.DonationType.ToLower() == donationType.Trim().ToLower());

        if (startDate.HasValue)
            q = q.Where(d => d.DonationDate >= startDate.Value);

        if (endDate.HasValue)
            q = q.Where(d => d.DonationDate <= endDate.Value);

        var donations = await q
            .OrderByDescending(d => d.DonationDate)
            .Select(d => new DonationDto(
                d.DonationId,
                d.SupporterId,
                d.DonationType,
                d.DonationDate,
                d.IsRecurring,
                d.CampaignName,
                d.ChannelSource,
                d.CurrencyCode,
                d.Amount,
                d.EstimatedValue,
                d.ImpactUnit,
                d.Notes,
                d.ReferralPostId
            ))
            .ToListAsync();

        return Ok(donations);
    }

    [HttpGet("allocations")]
    public async Task<IActionResult> GetAllocations(
        [FromQuery] int? safehouseId,
        [FromQuery] string? programArea)
    {
        var q = _db.DonationAllocations.AsQueryable();

        if (safehouseId.HasValue)
            q = q.Where(a => a.SafehouseId == safehouseId.Value);

        if (!string.IsNullOrWhiteSpace(programArea))
            q = q.Where(a => a.ProgramArea.ToLower() == programArea.Trim().ToLower());

        var allocations = await q
            .OrderByDescending(a => a.AllocationDate)
            .Select(a => new DonationAllocationDto(
                a.AllocationId,
                a.DonationId,
                a.SafehouseId,
                a.ProgramArea,
                a.AmountAllocated,
                a.AllocationDate,
                a.AllocationNotes
            ))
            .ToListAsync();

        return Ok(allocations);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("supporters")]
    public async Task<IActionResult> CreateSupporter([FromBody] SupporterUpsertRequest body)
    {
        var validation = ValidateSupporter(body);
        if (validation != null) return BadRequest(new { message = validation });

        var entity = new Supporter
        {
            SupporterType = body.SupporterType.Trim(),
            DisplayName = body.DisplayName.Trim(),
            OrganizationName = body.OrganizationName?.Trim(),
            FirstName = body.FirstName?.Trim(),
            LastName = body.LastName?.Trim(),
            RelationshipType = body.RelationshipType?.Trim() ?? "Donor",
            Region = body.Region?.Trim(),
            Country = string.IsNullOrWhiteSpace(body.Country) ? "Brazil" : body.Country.Trim(),
            Email = body.Email.Trim(),
            Phone = body.Phone?.Trim(),
            Status = body.Status.Trim(),
            CreatedAt = DateTime.UtcNow,
            FirstDonationDate = body.FirstDonationDate,
            AcquisitionChannel = body.AcquisitionChannel?.Trim(),
        };

        _db.Supporters.Add(entity);
        await _db.SaveChangesAsync();

        return Ok(new { entity.SupporterId });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("supporters/{id:int}")]
    public async Task<IActionResult> UpdateSupporter(int id, [FromBody] SupporterUpsertRequest body)
    {
        var validation = ValidateSupporter(body);
        if (validation != null) return BadRequest(new { message = validation });

        var existing = await _db.Supporters.FirstOrDefaultAsync(s => s.SupporterId == id);
        if (existing == null) return NotFound();

        existing.SupporterType = body.SupporterType.Trim();
        existing.DisplayName = body.DisplayName.Trim();
        existing.OrganizationName = body.OrganizationName?.Trim();
        existing.FirstName = body.FirstName?.Trim();
        existing.LastName = body.LastName?.Trim();
        existing.RelationshipType = body.RelationshipType?.Trim() ?? existing.RelationshipType;
        existing.Region = body.Region?.Trim();
        existing.Country = string.IsNullOrWhiteSpace(body.Country) ? existing.Country : body.Country.Trim();
        existing.Email = body.Email.Trim();
        existing.Phone = body.Phone?.Trim();
        existing.Status = body.Status.Trim();
        existing.FirstDonationDate = body.FirstDonationDate;
        existing.AcquisitionChannel = body.AcquisitionChannel?.Trim();

        await _db.SaveChangesAsync();
        return Ok(new { message = "Supporter updated." });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("donations")]
    public async Task<IActionResult> CreateDonation([FromBody] DonationUpsertRequest body)
    {
        var validation = await ValidateDonation(body);
        if (validation != null) return BadRequest(new { message = validation });

        var entity = new Donation
        {
            SupporterId = body.SupporterId,
            DonationType = body.DonationType.Trim(),
            DonationDate = body.DonationDate,
            IsRecurring = body.IsRecurring,
            CampaignName = body.CampaignName?.Trim(),
            ChannelSource = string.IsNullOrWhiteSpace(body.ChannelSource) ? "Direct" : body.ChannelSource.Trim(),
            CurrencyCode = body.CurrencyCode?.Trim() ?? "USD",
            Amount = body.Amount,
            EstimatedValue = body.EstimatedValue,
            ImpactUnit = body.ImpactUnit?.Trim(),
            Notes = body.Notes?.Trim(),
            ReferralPostId = body.ReferralPostId
        };

        _db.Donations.Add(entity);
        await _db.SaveChangesAsync();

        return Ok(new { entity.DonationId });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("donations/{id:int}")]
    public async Task<IActionResult> UpdateDonation(int id, [FromBody] DonationUpsertRequest body)
    {
        var validation = await ValidateDonation(body);
        if (validation != null) return BadRequest(new { message = validation });

        var existing = await _db.Donations.FirstOrDefaultAsync(d => d.DonationId == id);
        if (existing == null) return NotFound();

        existing.SupporterId = body.SupporterId;
        existing.DonationType = body.DonationType.Trim();
        existing.DonationDate = body.DonationDate;
        existing.IsRecurring = body.IsRecurring;
        existing.CampaignName = body.CampaignName?.Trim();
        existing.ChannelSource = string.IsNullOrWhiteSpace(body.ChannelSource) ? existing.ChannelSource : body.ChannelSource.Trim();
        existing.CurrencyCode = body.CurrencyCode?.Trim() ?? existing.CurrencyCode;
        existing.Amount = body.Amount;
        existing.EstimatedValue = body.EstimatedValue;
        existing.ImpactUnit = body.ImpactUnit?.Trim();
        existing.Notes = body.Notes?.Trim();
        existing.ReferralPostId = body.ReferralPostId;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Donation updated." });
    }

    private string? ValidateSupporter(SupporterUpsertRequest body)
    {
        if (string.IsNullOrWhiteSpace(body.DisplayName)) return "DisplayName is required.";
        if (string.IsNullOrWhiteSpace(body.SupporterType)) return "SupporterType is required.";
        if (string.IsNullOrWhiteSpace(body.Status)) return "Status is required.";
        if (string.IsNullOrWhiteSpace(body.Email)) return "Email is required.";
        if (!new EmailAddressAttribute().IsValid(body.Email)) return "Email is invalid.";
        return null;
    }

    private async Task<string?> ValidateDonation(DonationUpsertRequest body)
    {
        if (body.SupporterId <= 0) return "SupporterId is required.";
        if (string.IsNullOrWhiteSpace(body.DonationType)) return "DonationType is required.";
        if (body.Amount == null && body.EstimatedValue == null) return "Amount or EstimatedValue is required.";
        var supporterExists = await _db.Supporters.AnyAsync(s => s.SupporterId == body.SupporterId);
        if (!supporterExists) return "SupporterId not found.";
        return null;
    }
}

public record SupporterUpsertRequest(
    [property: Required] string SupporterType,
    [property: Required] string DisplayName,
    string? OrganizationName,
    string? FirstName,
    string? LastName,
    string? RelationshipType,
    string? Region,
    string? Country,
    [property: Required, EmailAddress] string Email,
    string? Phone,
    [property: Required] string Status,
    DateOnly? FirstDonationDate,
    string? AcquisitionChannel
);

public record DonationUpsertRequest(
    [property: Range(1, int.MaxValue)] int SupporterId,
    [property: Required] string DonationType,
    DateOnly DonationDate,
    bool IsRecurring,
    string? CampaignName,
    string? ChannelSource,
    string? CurrencyCode,
    decimal? Amount,
    decimal? EstimatedValue,
    string? ImpactUnit,
    string? Notes,
    int? ReferralPostId
);

public record SupporterDto(
    int SupporterId,
    string SupporterType,
    string DisplayName,
    string? OrganizationName,
    string? FirstName,
    string? LastName,
    string RelationshipType,
    string? Region,
    string Country,
    string Email,
    string? Phone,
    string Status,
    DateTime CreatedAt,
    DateOnly? FirstDonationDate,
    string? AcquisitionChannel
);

public record DonationDto(
    int DonationId,
    int SupporterId,
    string DonationType,
    DateOnly DonationDate,
    bool IsRecurring,
    string? CampaignName,
    string ChannelSource,
    string? CurrencyCode,
    decimal? Amount,
    decimal? EstimatedValue,
    string? ImpactUnit,
    string? Notes,
    int? ReferralPostId
);

public record DonationAllocationDto(
    int AllocationId,
    int DonationId,
    int SafehouseId,
    string ProgramArea,
    decimal AmountAllocated,
    DateOnly AllocationDate,
    string? AllocationNotes
);
