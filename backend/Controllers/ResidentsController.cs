using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Authorize(Roles = "Admin,donor,staff")]
[Route("api/residents")]
public class ResidentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ResidentsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int? safehouseId,
        [FromQuery] string? caseCategory)
    {
        var q = _db.Residents.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(r => r.CaseStatus == status);

        if (safehouseId.HasValue)
            q = q.Where(r => r.SafehouseId == safehouseId.Value);

        if (!string.IsNullOrWhiteSpace(caseCategory))
            q = q.Where(r => r.CaseCategory == caseCategory);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            q = q.Where(r =>
                r.CaseControlNo.ToLower().Contains(s) ||
                r.InternalCode.ToLower().Contains(s) ||
                (r.AssignedSocialWorker != null && r.AssignedSocialWorker.ToLower().Contains(s)) ||
                (r.ReferralSource != null && r.ReferralSource.ToLower().Contains(s)) ||
                r.CaseCategory.ToLower().Contains(s));
        }

        var residents = await q
            .OrderByDescending(r => r.DateOfAdmission)
            .Select(r => ToDto(r))
            .ToListAsync();

        return Ok(residents);
    }

    [HttpGet("{residentId:int}")]
    public async Task<IActionResult> GetById(int residentId)
    {
        var resident = await _db.Residents.FirstOrDefaultAsync(r => r.ResidentId == residentId);
        return resident == null ? NotFound() : Ok(ToDto(resident));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ResidentUpsertRequest body)
    {
        var entity = ToEntity(body);
        entity.CreatedAt = DateTime.UtcNow;
        _db.Residents.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { residentId = entity.ResidentId }, ToDto(entity));
    }

    [HttpPut("{residentId:int}")]
    public async Task<IActionResult> Update(int residentId, [FromBody] ResidentUpsertRequest body)
    {
        var existing = await _db.Residents.FirstOrDefaultAsync(r => r.ResidentId == residentId);
        if (existing == null) return NotFound();

        Apply(existing, body);
        await _db.SaveChangesAsync();
        return Ok(ToDto(existing));
    }

    private static ResidentDto ToDto(Resident r) => new(
        r.ResidentId, r.CaseControlNo, r.InternalCode, r.SafehouseId, r.CaseStatus, r.Sex,
        r.DateOfBirth, r.BirthStatus, r.PlaceOfBirth, r.Religion, r.CaseCategory,
        r.SubCatOrphaned, r.SubCatTrafficked, r.SubCatChildLabor, r.SubCatPhysicalAbuse,
        r.SubCatSexualAbuse, r.SubCatOsaec, r.SubCatCicl, r.SubCatAtRisk, r.SubCatStreetChild,
        r.SubCatChildWithHiv, r.IsPwd, r.PwdType, r.HasSpecialNeeds, r.SpecialNeedsDiagnosis,
        r.FamilyIs4ps, r.FamilySoloParent, r.FamilyIndigenous, r.FamilyParentPwd, r.FamilyInformalSettler,
        r.DateOfAdmission, r.AgeUponAdmission, r.PresentAge, r.LengthOfStay, r.ReferralSource,
        r.ReferringAgencyPerson, r.DateColbRegistered, r.DateColbObtained, r.AssignedSocialWorker,
        r.InitialCaseAssessment, r.DateCaseStudyPrepared, r.ReintegrationType, r.ReintegrationStatus,
        r.InitialRiskLevel, r.CurrentRiskLevel, r.DateEnrolled, r.DateClosed, r.CreatedAt
    );

    private static Resident ToEntity(ResidentUpsertRequest b)
    {
        var entity = new Resident();
        Apply(entity, b);
        return entity;
    }

    private static void Apply(Resident r, ResidentUpsertRequest b)
    {
        r.CaseControlNo = b.CaseControlNo;
        r.InternalCode = b.InternalCode;
        r.SafehouseId = b.SafehouseId;
        r.CaseStatus = b.CaseStatus;
        r.Sex = b.Sex;
        r.DateOfBirth = b.DateOfBirth;
        r.BirthStatus = b.BirthStatus;
        r.PlaceOfBirth = b.PlaceOfBirth;
        r.Religion = b.Religion;
        r.CaseCategory = b.CaseCategory;
        r.SubCatOrphaned = b.SubCatOrphaned;
        r.SubCatTrafficked = b.SubCatTrafficked;
        r.SubCatChildLabor = b.SubCatChildLabor;
        r.SubCatPhysicalAbuse = b.SubCatPhysicalAbuse;
        r.SubCatSexualAbuse = b.SubCatSexualAbuse;
        r.SubCatOsaec = b.SubCatOsaec;
        r.SubCatCicl = b.SubCatCicl;
        r.SubCatAtRisk = b.SubCatAtRisk;
        r.SubCatStreetChild = b.SubCatStreetChild;
        r.SubCatChildWithHiv = b.SubCatChildWithHiv;
        r.IsPwd = b.IsPwd;
        r.PwdType = b.PwdType;
        r.HasSpecialNeeds = b.HasSpecialNeeds;
        r.SpecialNeedsDiagnosis = b.SpecialNeedsDiagnosis;
        r.FamilyIs4ps = b.FamilyIs4ps;
        r.FamilySoloParent = b.FamilySoloParent;
        r.FamilyIndigenous = b.FamilyIndigenous;
        r.FamilyParentPwd = b.FamilyParentPwd;
        r.FamilyInformalSettler = b.FamilyInformalSettler;
        r.DateOfAdmission = b.DateOfAdmission;
        r.AgeUponAdmission = b.AgeUponAdmission;
        r.PresentAge = b.PresentAge;
        r.LengthOfStay = b.LengthOfStay;
        r.ReferralSource = b.ReferralSource;
        r.ReferringAgencyPerson = b.ReferringAgencyPerson;
        r.DateColbRegistered = b.DateColbRegistered;
        r.DateColbObtained = b.DateColbObtained;
        r.AssignedSocialWorker = b.AssignedSocialWorker;
        r.InitialCaseAssessment = b.InitialCaseAssessment;
        r.DateCaseStudyPrepared = b.DateCaseStudyPrepared;
        r.ReintegrationType = b.ReintegrationType;
        r.ReintegrationStatus = b.ReintegrationStatus;
        r.InitialRiskLevel = b.InitialRiskLevel;
        r.CurrentRiskLevel = b.CurrentRiskLevel;
        r.DateEnrolled = b.DateEnrolled;
        r.DateClosed = b.DateClosed;
    }
}

public record ResidentUpsertRequest(
    string CaseControlNo,
    string InternalCode,
    int SafehouseId,
    string CaseStatus,
    string Sex,
    DateOnly DateOfBirth,
    string? BirthStatus,
    string? PlaceOfBirth,
    string? Religion,
    string CaseCategory,
    bool SubCatOrphaned,
    bool SubCatTrafficked,
    bool SubCatChildLabor,
    bool SubCatPhysicalAbuse,
    bool SubCatSexualAbuse,
    bool SubCatOsaec,
    bool SubCatCicl,
    bool SubCatAtRisk,
    bool SubCatStreetChild,
    bool SubCatChildWithHiv,
    bool IsPwd,
    string? PwdType,
    bool HasSpecialNeeds,
    string? SpecialNeedsDiagnosis,
    bool FamilyIs4ps,
    bool FamilySoloParent,
    bool FamilyIndigenous,
    bool FamilyParentPwd,
    bool FamilyInformalSettler,
    DateOnly DateOfAdmission,
    string? AgeUponAdmission,
    string? PresentAge,
    string? LengthOfStay,
    string? ReferralSource,
    string? ReferringAgencyPerson,
    DateOnly? DateColbRegistered,
    DateOnly? DateColbObtained,
    string? AssignedSocialWorker,
    string? InitialCaseAssessment,
    DateOnly? DateCaseStudyPrepared,
    string? ReintegrationType,
    string? ReintegrationStatus,
    string InitialRiskLevel,
    string CurrentRiskLevel,
    DateOnly DateEnrolled,
    DateOnly? DateClosed
);

public record ResidentDto(
    int ResidentId,
    string CaseControlNo,
    string InternalCode,
    int SafehouseId,
    string CaseStatus,
    string Sex,
    DateOnly DateOfBirth,
    string? BirthStatus,
    string? PlaceOfBirth,
    string? Religion,
    string CaseCategory,
    bool SubCatOrphaned,
    bool SubCatTrafficked,
    bool SubCatChildLabor,
    bool SubCatPhysicalAbuse,
    bool SubCatSexualAbuse,
    bool SubCatOsaec,
    bool SubCatCicl,
    bool SubCatAtRisk,
    bool SubCatStreetChild,
    bool SubCatChildWithHiv,
    bool IsPwd,
    string? PwdType,
    bool HasSpecialNeeds,
    string? SpecialNeedsDiagnosis,
    bool FamilyIs4ps,
    bool FamilySoloParent,
    bool FamilyIndigenous,
    bool FamilyParentPwd,
    bool FamilyInformalSettler,
    DateOnly DateOfAdmission,
    string? AgeUponAdmission,
    string? PresentAge,
    string? LengthOfStay,
    string? ReferralSource,
    string? ReferringAgencyPerson,
    DateOnly? DateColbRegistered,
    DateOnly? DateColbObtained,
    string? AssignedSocialWorker,
    string? InitialCaseAssessment,
    DateOnly? DateCaseStudyPrepared,
    string? ReintegrationType,
    string? ReintegrationStatus,
    string InitialRiskLevel,
    string CurrentRiskLevel,
    DateOnly DateEnrolled,
    DateOnly? DateClosed,
    DateTime CreatedAt
);
