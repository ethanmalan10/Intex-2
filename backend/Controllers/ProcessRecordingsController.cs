using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace backend.Controllers;

[ApiController]
[Authorize(Roles = "Admin,staff")]
[Route("api/process-recordings")]
public class ProcessRecordingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProcessRecordingsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int residentId)
    {
        var rows = await _db.ProcessRecordings
            .Where(p => p.ResidentId == residentId)
            .OrderByDescending(p => p.SessionDate)
            .Select(p => new ProcessRecordingDto(
                p.RecordingId,
                p.ResidentId,
                p.SessionDate,
                p.SocialWorker,
                p.SessionType,
                p.EmotionalStateObserved,
                p.SessionNarrative,
                p.InterventionsApplied,
                p.FollowUpActions))
            .ToListAsync();

        return Ok(rows);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProcessRecordingCreateRequest body)
    {
        if (!await _db.Residents.AnyAsync(r => r.ResidentId == body.ResidentId))
            return BadRequest(new { message = "ResidentId not found." });

        var entity = new ProcessRecording
        {
            ResidentId = body.ResidentId,
            SessionDate = body.SessionDate,
            SocialWorker = body.SocialWorker,
            SessionType = body.SessionType,
            SessionDurationMinutes = body.SessionDurationMinutes ?? 60,
            EmotionalStateObserved = body.EmotionalState,
            EmotionalStateEnd = body.EmotionalStateEnd ?? body.EmotionalState,
            SessionNarrative = body.Summary,
            InterventionsApplied = body.Interventions,
            FollowUpActions = body.FollowUpActions,
            ProgressNoted = body.ProgressNoted ?? false,
            ConcernsFlagged = body.ConcernsFlagged ?? false,
            ReferralMade = body.ReferralMade ?? false,
        };

        _db.ProcessRecordings.Add(entity);
        await _db.SaveChangesAsync();

        return Ok(new ProcessRecordingDto(
            entity.RecordingId,
            entity.ResidentId,
            entity.SessionDate,
            entity.SocialWorker,
            entity.SessionType,
            entity.EmotionalStateObserved,
            entity.SessionNarrative,
            entity.InterventionsApplied,
            entity.FollowUpActions));
    }
}

public record ProcessRecordingCreateRequest(
    [property: Range(1, int.MaxValue)] int ResidentId,
    DateOnly SessionDate,
    [property: Required] string SocialWorker,
    [property: Required] string SessionType,
    [property: Required] string EmotionalState,
    [property: Required] string Summary,
    [property: Required] string Interventions,
    [property: Required] string FollowUpActions,
    int? SessionDurationMinutes,
    string? EmotionalStateEnd,
    bool? ProgressNoted,
    bool? ConcernsFlagged,
    bool? ReferralMade
);

public record ProcessRecordingDto(
    int Id,
    int ResidentId,
    DateOnly SessionDate,
    string SocialWorker,
    string SessionType,
    string EmotionalState,
    string? Summary,
    string? Interventions,
    string? FollowUpActions
);
