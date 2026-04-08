using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace backend.Controllers;

[ApiController]
[Authorize(Roles = "Admin,staff")]
[Route("api/home-visitations")]
public class HomeVisitationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public HomeVisitationsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int residentId)
    {
        var rows = await _db.HomeVisitations
            .Where(v => v.ResidentId == residentId)
            .OrderByDescending(v => v.VisitDate)
            .Select(v => new HomeVisitationDto(
                v.VisitationId,
                v.ResidentId,
                v.VisitDate,
                v.SocialWorker,
                v.VisitType,
                v.Observations,
                v.FamilyCooperationLevel,
                v.SafetyConcernsNoted,
                v.FollowUpNotes
            ))
            .ToListAsync();

        return Ok(rows);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] HomeVisitationCreateRequest body)
    {
        if (!await _db.Residents.AnyAsync(r => r.ResidentId == body.ResidentId))
            return BadRequest(new { message = "ResidentId not found." });

        var entity = new HomeVisitation
        {
            ResidentId = body.ResidentId,
            VisitDate = body.VisitDate,
            SocialWorker = body.SocialWorker,
            VisitType = body.VisitType,
            Observations = body.Observations,
            FamilyCooperationLevel = body.FamilyCooperationLevel,
            SafetyConcernsNoted = body.SafetyConcerns,
            FollowUpNeeded = !string.IsNullOrWhiteSpace(body.FollowUpActions),
            FollowUpNotes = body.FollowUpActions,
            VisitOutcome = body.VisitOutcome ?? "Pending review"
        };

        _db.HomeVisitations.Add(entity);
        await _db.SaveChangesAsync();

        return Ok(new HomeVisitationDto(
            entity.VisitationId,
            entity.ResidentId,
            entity.VisitDate,
            entity.SocialWorker,
            entity.VisitType,
            entity.Observations,
            entity.FamilyCooperationLevel,
            entity.SafetyConcernsNoted,
            entity.FollowUpNotes
        ));
    }
}

[ApiController]
[Authorize(Roles = "Admin,staff")]
[Route("api/case-conferences")]
public class CaseConferencesController : ControllerBase
{
    private readonly AppDbContext _db;

    public CaseConferencesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int residentId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);

        var rows = await _db.InterventionPlans
            .Where(p => p.ResidentId == residentId && p.CaseConferenceDate != null)
            .OrderByDescending(p => p.CaseConferenceDate)
            .Select(p => new CaseConferenceDto(
                p.PlanId,
                p.ResidentId,
                p.CaseConferenceDate!.Value,
                p.PlanCategory,
                p.CaseConferenceDate >= today ? "Upcoming" : "Completed",
                p.PlanDescription
            ))
            .ToListAsync();

        return Ok(rows);
    }
}

public record HomeVisitationCreateRequest(
    [property: Range(1, int.MaxValue)] int ResidentId,
    DateOnly VisitDate,
    [property: Required] string SocialWorker,
    [property: Required] string VisitType,
    [property: Required] string Observations,
    [property: Required] string FamilyCooperationLevel,
    bool SafetyConcerns,
    [property: Required] string FollowUpActions,
    string? VisitOutcome
);

public record HomeVisitationDto(
    int Id,
    int ResidentId,
    DateOnly VisitDate,
    string SocialWorker,
    string VisitType,
    string? Observations,
    string FamilyCooperationLevel,
    bool SafetyConcerns,
    string? FollowUpActions
);

public record CaseConferenceDto(
    int Id,
    int ResidentId,
    DateOnly ConferenceDate,
    string Topic,
    string Status,
    string? Notes
);
