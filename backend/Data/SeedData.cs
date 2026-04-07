using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;
using backend.Models;

namespace backend.Data;

public static class SeedData
{
    private static readonly CsvConfiguration CsvConfig = new(CultureInfo.InvariantCulture)
    {
        HeaderValidated = null,
        MissingFieldFound = null,
    };

    private static string CsvPath(string filename) =>
        Path.Combine(AppContext.BaseDirectory, "csv", filename);

    private static string? Nullify(string? s) =>
        string.IsNullOrWhiteSpace(s) ? null : s;

    private static bool ParseBool(string? s) =>
        s?.Trim().Equals("True", StringComparison.OrdinalIgnoreCase) == true;

    private static DateOnly ParseDate(string? s) =>
        DateOnly.ParseExact(s ?? "", "yyyy-MM-dd", CultureInfo.InvariantCulture);

    private static DateOnly? ParseDateNullable(string? s) =>
        string.IsNullOrWhiteSpace(s) ? null : DateOnly.ParseExact(s.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture);

    private static DateTime ParseDateTime(string? s)
    {
        var dt = DateTime.Parse(s ?? "", CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind);
        return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
    }

    private static DateTime? ParseDateTimeNullable(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        var dt = DateTime.Parse(s, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind);
        return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
    }

    private static int? ParseIntNullable(string s)
{
    if (string.IsNullOrWhiteSpace(s)) return null;
    if (decimal.TryParse(s, out var d)) return (int)d;
    return null;
}

    private static decimal? ParseDecimalNullable(string? s) =>
        string.IsNullOrWhiteSpace(s) ? null : decimal.Parse(s.Trim(), CultureInfo.InvariantCulture);

    public static async Task SeedAll(AppDbContext context)
    {
        await SeedSafehouses(context);
        await SeedPartners(context);
        await SeedPartnerAssignments(context);
        await SeedSupporters(context);
        await SeedSocialMediaPosts(context);
        await SeedDonations(context);
        await SeedInKindDonationItems(context);
        await SeedDonationAllocations(context);
        await SeedResidents(context);
        await SeedProcessRecordings(context);
        await SeedHomeVisitations(context);
        await SeedEducationRecords(context);
        await SeedHealthWellbeingRecords(context);
        await SeedInterventionPlans(context);
        await SeedIncidentReports(context);
        await SeedSafehouseMonthlyMetrics(context);
        await SeedPublicImpactSnapshots(context);
    }

    private static async Task SeedSafehouses(AppDbContext context)
    {
        if (context.Safehouses.Any()) return;
        using var reader = new StreamReader(CsvPath("safehouses.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new Safehouse
        {
            SafehouseId = int.Parse(r.safehouse_id),
            SafehouseCode = r.safehouse_code,
            Name = r.name,
            Region = r.region,
            City = r.city,
            Province = r.province,
            Country = r.country,
            OpenDate = ParseDate(r.open_date),
            Status = r.status,
            CapacityGirls = int.Parse(r.capacity_girls),
            CapacityStaff = int.Parse(r.capacity_staff),
            CurrentOccupancy = int.Parse(r.current_occupancy),
            Notes = Nullify(r.notes),
        }).ToList();
        context.Safehouses.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedPartners(AppDbContext context)
    {
        if (context.Partners.Any()) return;
        using var reader = new StreamReader(CsvPath("partners.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new Partner
        {
            PartnerId = int.Parse(r.partner_id),
            PartnerName = r.partner_name,
            PartnerType = r.partner_type,
            RoleType = r.role_type,
            ContactName = r.contact_name,
            Email = r.email,
            Phone = r.phone,
            Region = r.region,
            Status = r.status,
            StartDate = ParseDate(r.start_date),
            EndDate = ParseDateNullable(r.end_date),
            Notes = Nullify(r.notes),
        }).ToList();
        context.Partners.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedPartnerAssignments(AppDbContext context)
    {
        if (context.PartnerAssignments.Any()) return;
        using var reader = new StreamReader(CsvPath("partner_assignments.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new PartnerAssignment
        {
            AssignmentId = int.Parse(r.assignment_id),
            PartnerId = int.Parse(r.partner_id),
            SafehouseId = ParseIntNullable(r.safehouse_id),
            ProgramArea = r.program_area,
            AssignmentStart = ParseDate(r.assignment_start),
            AssignmentEnd = ParseDateNullable(r.assignment_end),
            ResponsibilityNotes = Nullify(r.responsibility_notes),
            IsPrimary = ParseBool(r.is_primary),
            Status = r.status,
        }).ToList();
        context.PartnerAssignments.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedSupporters(AppDbContext context)
    {
        if (context.Supporters.Any()) return;
        using var reader = new StreamReader(CsvPath("supporters.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new Supporter
        {
            SupporterId = int.Parse(r.supporter_id),
            SupporterType = r.supporter_type,
            DisplayName = r.display_name,
            OrganizationName = Nullify(r.organization_name),
            FirstName = Nullify(r.first_name),
            LastName = Nullify(r.last_name),
            RelationshipType = r.relationship_type,
            Region = Nullify(r.region),
            Country = r.country,
            Email = r.email,
            Phone = Nullify(r.phone),
            Status = r.status,
            CreatedAt = ParseDateTime(r.created_at),
            FirstDonationDate = ParseDateNullable(r.first_donation_date),
            AcquisitionChannel = Nullify(r.acquisition_channel),
        }).ToList();
        context.Supporters.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedSocialMediaPosts(AppDbContext context)
    {
        if (context.SocialMediaPosts.Any()) return;
        using var reader = new StreamReader(CsvPath("social_media_posts.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new SocialMediaPost
        {
            PostId = int.Parse(r.post_id),
            Platform = r.platform,
            PlatformPostId = Nullify(r.platform_post_id),
            PostUrl = Nullify(r.post_url),
            CreatedAt = ParseDateTime(r.created_at),
            DayOfWeek = Nullify(r.day_of_week),
            PostHour = ParseIntNullable(r.post_hour),
            PostType = Nullify(r.post_type),
            MediaType = Nullify(r.media_type),
            Caption = Nullify(r.caption),
            Hashtags = Nullify(r.hashtags),
            NumHashtags = int.Parse(r.num_hashtags),
            MentionsCount = int.Parse(r.mentions_count),
            HasCallToAction = ParseBool(r.has_call_to_action),
            CallToActionType = Nullify(r.call_to_action_type),
            ContentTopic = Nullify(r.content_topic),
            SentimentTone = Nullify(r.sentiment_tone),
            CaptionLength = int.Parse(r.caption_length),
            FeaturesResidentStory = ParseBool(r.features_resident_story),
            CampaignName = Nullify(r.campaign_name),
            IsBoosted = ParseBool(r.is_boosted),
            BoostBudgetPhp = ParseDecimalNullable(r.boost_budget_php),
            Impressions = ParseIntNullable(r.impressions),
            Reach = ParseIntNullable(r.reach),
            Likes = ParseIntNullable(r.likes),
            Comments = ParseIntNullable(r.comments),
            Shares = ParseIntNullable(r.shares),
            Saves = ParseIntNullable(r.saves),
            ClickThroughs = ParseIntNullable(r.click_throughs),
            VideoViews = ParseIntNullable(r.video_views),
            EngagementRate = ParseDecimalNullable(r.engagement_rate),
            ProfileVisits = ParseIntNullable(r.profile_visits),
            DonationReferrals = ParseIntNullable(r.donation_referrals),
            EstimatedDonationValuePhp = ParseDecimalNullable(r.estimated_donation_value_php),
            FollowerCountAtPost = ParseIntNullable(r.follower_count_at_post),
            WatchTimeSeconds = ParseIntNullable(r.watch_time_seconds),
            AvgViewDurationSeconds = ParseIntNullable(r.avg_view_duration_seconds),
            SubscriberCountAtPost = ParseIntNullable(r.subscriber_count_at_post),
            Forwards = ParseDecimalNullable(r.forwards),
        }).ToList();
        context.SocialMediaPosts.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedDonations(AppDbContext context)
    {
        if (context.Donations.Any()) return;
        using var reader = new StreamReader(CsvPath("donations.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new Donation
        {
            DonationId = int.Parse(r.donation_id),
            SupporterId = int.Parse(r.supporter_id),
            DonationType = r.donation_type,
            DonationDate = ParseDate(r.donation_date),
            IsRecurring = ParseBool(r.is_recurring),
            CampaignName = Nullify(r.campaign_name),
            ChannelSource = r.channel_source,
            CurrencyCode = Nullify(r.currency_code),
            Amount = ParseDecimalNullable(r.amount),
            EstimatedValue = ParseDecimalNullable(r.estimated_value),
            ImpactUnit = Nullify(r.impact_unit),
            Notes = Nullify(r.notes),
            ReferralPostId = ParseIntNullable(r.referral_post_id),
        }).ToList();
        context.Donations.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedInKindDonationItems(AppDbContext context)
    {
        if (context.InKindDonationItems.Any()) return;
        using var reader = new StreamReader(CsvPath("in_kind_donation_items.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new InKindDonationItem
        {
            ItemId = int.Parse(r.item_id),
            DonationId = int.Parse(r.donation_id),
            ItemName = r.item_name,
            ItemCategory = r.item_category,
            Quantity = int.Parse(r.quantity),
            UnitOfMeasure = r.unit_of_measure,
            EstimatedUnitValue = decimal.Parse(r.estimated_unit_value, CultureInfo.InvariantCulture),
            IntendedUse = r.intended_use,
            ReceivedCondition = r.received_condition,
        }).ToList();
        context.InKindDonationItems.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedDonationAllocations(AppDbContext context)
    {
        if (context.DonationAllocations.Any()) return;
        using var reader = new StreamReader(CsvPath("donation_allocations.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new DonationAllocation
        {
            AllocationId = int.Parse(r.allocation_id),
            DonationId = int.Parse(r.donation_id),
            SafehouseId = int.Parse(r.safehouse_id),
            ProgramArea = r.program_area,
            AmountAllocated = decimal.Parse(r.amount_allocated, CultureInfo.InvariantCulture),
            AllocationDate = ParseDate(r.allocation_date),
            AllocationNotes = Nullify(r.allocation_notes),
        }).ToList();
        context.DonationAllocations.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedResidents(AppDbContext context)
    {
        if (context.Residents.Any()) return;
        using var reader = new StreamReader(CsvPath("residents.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new Resident
        {
            ResidentId = int.Parse(r.resident_id),
            CaseControlNo = r.case_control_no,
            InternalCode = r.internal_code,
            SafehouseId = int.Parse(r.safehouse_id),
            CaseStatus = r.case_status,
            Sex = r.sex,
            DateOfBirth = ParseDate(r.date_of_birth),
            BirthStatus = Nullify(r.birth_status),
            PlaceOfBirth = Nullify(r.place_of_birth),
            Religion = Nullify(r.religion),
            CaseCategory = r.case_category,
            SubCatOrphaned = ParseBool(r.sub_cat_orphaned),
            SubCatTrafficked = ParseBool(r.sub_cat_trafficked),
            SubCatChildLabor = ParseBool(r.sub_cat_child_labor),
            SubCatPhysicalAbuse = ParseBool(r.sub_cat_physical_abuse),
            SubCatSexualAbuse = ParseBool(r.sub_cat_sexual_abuse),
            SubCatOsaec = ParseBool(r.sub_cat_osaec),
            SubCatCicl = ParseBool(r.sub_cat_cicl),
            SubCatAtRisk = ParseBool(r.sub_cat_at_risk),
            SubCatStreetChild = ParseBool(r.sub_cat_street_child),
            SubCatChildWithHiv = ParseBool(r.sub_cat_child_with_hiv),
            IsPwd = ParseBool(r.is_pwd),
            PwdType = Nullify(r.pwd_type),
            HasSpecialNeeds = ParseBool(r.has_special_needs),
            SpecialNeedsDiagnosis = Nullify(r.special_needs_diagnosis),
            FamilyIs4ps = ParseBool(r.family_is_4ps),
            FamilySoloParent = ParseBool(r.family_solo_parent),
            FamilyIndigenous = ParseBool(r.family_indigenous),
            FamilyParentPwd = ParseBool(r.family_parent_pwd),
            FamilyInformalSettler = ParseBool(r.family_informal_settler),
            DateOfAdmission = ParseDate(r.date_of_admission),
            AgeUponAdmission = Nullify(r.age_upon_admission),
            PresentAge = Nullify(r.present_age),
            LengthOfStay = Nullify(r.length_of_stay),
            ReferralSource = Nullify(r.referral_source),
            ReferringAgencyPerson = Nullify(r.referring_agency_person),
            DateColbRegistered = ParseDateNullable(r.date_colb_registered),
            DateColbObtained = ParseDateNullable(r.date_colb_obtained),
            AssignedSocialWorker = Nullify(r.assigned_social_worker),
            InitialCaseAssessment = Nullify(r.initial_case_assessment),
            DateCaseStudyPrepared = ParseDateNullable(r.date_case_study_prepared),
            ReintegrationType = Nullify(r.reintegration_type),
            ReintegrationStatus = Nullify(r.reintegration_status),
            InitialRiskLevel = r.initial_risk_level,
            CurrentRiskLevel = r.current_risk_level,
            DateEnrolled = ParseDate(r.date_enrolled),
            DateClosed = ParseDateNullable(r.date_closed),
            CreatedAt = ParseDateTime(r.created_at),
            NotesRestricted = Nullify(r.notes_restricted),
        }).ToList();
        context.Residents.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedProcessRecordings(AppDbContext context)
    {
        if (context.ProcessRecordings.Any()) return;
        using var reader = new StreamReader(CsvPath("process_recordings.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new ProcessRecording
        {
            RecordingId = int.Parse(r.recording_id),
            ResidentId = int.Parse(r.resident_id),
            SessionDate = ParseDate(r.session_date),
            SocialWorker = r.social_worker,
            SessionType = r.session_type,
            SessionDurationMinutes = int.Parse(r.session_duration_minutes),
            EmotionalStateObserved = r.emotional_state_observed,
            EmotionalStateEnd = r.emotional_state_end,
            SessionNarrative = Nullify(r.session_narrative),
            InterventionsApplied = Nullify(r.interventions_applied),
            FollowUpActions = Nullify(r.follow_up_actions),
            ProgressNoted = ParseBool(r.progress_noted),
            ConcernsFlagged = ParseBool(r.concerns_flagged),
            ReferralMade = ParseBool(r.referral_made),
            NotesRestricted = Nullify(r.notes_restricted),
        }).ToList();
        context.ProcessRecordings.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedHomeVisitations(AppDbContext context)
    {
        if (context.HomeVisitations.Any()) return;
        using var reader = new StreamReader(CsvPath("home_visitations.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new HomeVisitation
        {
            VisitationId = int.Parse(r.visitation_id),
            ResidentId = int.Parse(r.resident_id),
            VisitDate = ParseDate(r.visit_date),
            SocialWorker = r.social_worker,
            VisitType = r.visit_type,
            LocationVisited = Nullify(r.location_visited),
            FamilyMembersPresent = Nullify(r.family_members_present),
            Purpose = Nullify(r.purpose),
            Observations = Nullify(r.observations),
            FamilyCooperationLevel = r.family_cooperation_level,
            SafetyConcernsNoted = ParseBool(r.safety_concerns_noted),
            FollowUpNeeded = ParseBool(r.follow_up_needed),
            FollowUpNotes = Nullify(r.follow_up_notes),
            VisitOutcome = r.visit_outcome,
        }).ToList();
        context.HomeVisitations.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedEducationRecords(AppDbContext context)
    {
        if (context.EducationRecords.Any()) return;
        using var reader = new StreamReader(CsvPath("education_records.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new EducationRecord
        {
            EducationRecordId = int.Parse(r.education_record_id),
            ResidentId = int.Parse(r.resident_id),
            RecordDate = ParseDate(r.record_date),
            EducationLevel = r.education_level,
            SchoolName = Nullify(r.school_name),
            EnrollmentStatus = Nullify(r.enrollment_status),
            AttendanceRate = ParseDecimalNullable(r.attendance_rate),
            ProgressPercent = ParseDecimalNullable(r.progress_percent),
            CompletionStatus = Nullify(r.completion_status),
            Notes = Nullify(r.notes),
        }).ToList();
        context.EducationRecords.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedHealthWellbeingRecords(AppDbContext context)
    {
        if (context.HealthWellbeingRecords.Any()) return;
        using var reader = new StreamReader(CsvPath("health_wellbeing_records.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new HealthWellbeingRecord
        {
            HealthRecordId = int.Parse(r.health_record_id),
            ResidentId = int.Parse(r.resident_id),
            RecordDate = ParseDate(r.record_date),
            GeneralHealthScore = ParseDecimalNullable(r.general_health_score),
            NutritionScore = ParseDecimalNullable(r.nutrition_score),
            SleepQualityScore = ParseDecimalNullable(r.sleep_quality_score),
            EnergyLevelScore = ParseDecimalNullable(r.energy_level_score),
            HeightCm = ParseDecimalNullable(r.height_cm),
            WeightKg = ParseDecimalNullable(r.weight_kg),
            Bmi = ParseDecimalNullable(r.bmi),
            MedicalCheckupDone = ParseBool(r.medical_checkup_done),
            DentalCheckupDone = ParseBool(r.dental_checkup_done),
            PsychologicalCheckupDone = ParseBool(r.psychological_checkup_done),
            Notes = Nullify(r.notes),
        }).ToList();
        context.HealthWellbeingRecords.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedInterventionPlans(AppDbContext context)
    {
        if (context.InterventionPlans.Any()) return;
        using var reader = new StreamReader(CsvPath("intervention_plans.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new InterventionPlan
        {
            PlanId = int.Parse(r.plan_id),
            ResidentId = int.Parse(r.resident_id),
            PlanCategory = r.plan_category,
            PlanDescription = Nullify(r.plan_description),
            ServicesProvided = Nullify(r.services_provided),
            TargetValue = ParseDecimalNullable(r.target_value),
            TargetDate = ParseDateNullable(r.target_date),
            Status = r.status,
            CaseConferenceDate = ParseDateNullable(r.case_conference_date),
            CreatedAt = ParseDateTime(r.created_at),
            UpdatedAt = ParseDateTime(r.updated_at),
        }).ToList();
        context.InterventionPlans.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedIncidentReports(AppDbContext context)
    {
        if (context.IncidentReports.Any()) return;
        using var reader = new StreamReader(CsvPath("incident_reports.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new IncidentReport
        {
            IncidentId = int.Parse(r.incident_id),
            ResidentId = int.Parse(r.resident_id),
            SafehouseId = int.Parse(r.safehouse_id),
            IncidentDate = ParseDate(r.incident_date),
            IncidentType = r.incident_type,
            Severity = r.severity,
            Description = Nullify(r.description),
            ResponseTaken = Nullify(r.response_taken),
            Resolved = ParseBool(r.resolved),
            ResolutionDate = ParseDateNullable(r.resolution_date),
            ReportedBy = Nullify(r.reported_by),
            FollowUpRequired = ParseBool(r.follow_up_required),
        }).ToList();
        context.IncidentReports.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedSafehouseMonthlyMetrics(AppDbContext context)
    {
        if (context.SafehouseMonthlyMetrics.Any()) return;
        using var reader = new StreamReader(CsvPath("safehouse_monthly_metrics.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new SafehouseMonthlyMetric
        {
            MetricId = int.Parse(r.metric_id),
            SafehouseId = int.Parse(r.safehouse_id),
            MonthStart = ParseDate(r.month_start),
            MonthEnd = ParseDate(r.month_end),
            ActiveResidents = int.Parse(r.active_residents),
            AvgEducationProgress = ParseDecimalNullable(r.avg_education_progress),
            AvgHealthScore = ParseDecimalNullable(r.avg_health_score),
            ProcessRecordingCount = int.Parse(r.process_recording_count),
            HomeVisitationCount = int.Parse(r.home_visitation_count),
            IncidentCount = int.Parse(r.incident_count),
            Notes = Nullify(r.notes),
        }).ToList();
        context.SafehouseMonthlyMetrics.AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedPublicImpactSnapshots(AppDbContext context)
    {
        if (context.PublicImpactSnapshots.Any()) return;
        using var reader = new StreamReader(CsvPath("public_impact_snapshots.csv"));
        using var csv = new CsvReader(reader, CsvConfig);
        var records = csv.GetRecords<dynamic>().Select(r => new PublicImpactSnapshot
        {
            SnapshotId = int.Parse(r.snapshot_id),
            SnapshotDate = ParseDate(r.snapshot_date),
            Headline = r.headline,
            SummaryText = Nullify(r.summary_text),
            MetricPayloadJson = Nullify(r.metric_payload_json),
            IsPublished = ParseBool(r.is_published),
            PublishedAt = ParseDateNullable(r.published_at),
        }).ToList();
        context.PublicImpactSnapshots.AddRange(records);
        await context.SaveChangesAsync();
    }
}
