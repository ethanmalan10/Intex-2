using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DonationAllocations",
                columns: table => new
                {
                    AllocationId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DonationId = table.Column<int>(type: "integer", nullable: false),
                    SafehouseId = table.Column<int>(type: "integer", nullable: false),
                    ProgramArea = table.Column<string>(type: "text", nullable: false),
                    AmountAllocated = table.Column<decimal>(type: "numeric", nullable: false),
                    AllocationDate = table.Column<DateOnly>(type: "date", nullable: false),
                    AllocationNotes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationAllocations", x => x.AllocationId);
                });

            migrationBuilder.CreateTable(
                name: "Donations",
                columns: table => new
                {
                    DonationId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SupporterId = table.Column<int>(type: "integer", nullable: false),
                    DonationType = table.Column<string>(type: "text", nullable: false),
                    DonationDate = table.Column<DateOnly>(type: "date", nullable: false),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false),
                    CampaignName = table.Column<string>(type: "text", nullable: true),
                    ChannelSource = table.Column<string>(type: "text", nullable: false),
                    CurrencyCode = table.Column<string>(type: "text", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric", nullable: true),
                    EstimatedValue = table.Column<decimal>(type: "numeric", nullable: true),
                    ImpactUnit = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    ReferralPostId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Donations", x => x.DonationId);
                });

            migrationBuilder.CreateTable(
                name: "EducationRecords",
                columns: table => new
                {
                    EducationRecordId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResidentId = table.Column<int>(type: "integer", nullable: false),
                    RecordDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EducationLevel = table.Column<string>(type: "text", nullable: false),
                    SchoolName = table.Column<string>(type: "text", nullable: true),
                    EnrollmentStatus = table.Column<string>(type: "text", nullable: true),
                    AttendanceRate = table.Column<decimal>(type: "numeric", nullable: true),
                    ProgressPercent = table.Column<decimal>(type: "numeric", nullable: true),
                    CompletionStatus = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EducationRecords", x => x.EducationRecordId);
                });

            migrationBuilder.CreateTable(
                name: "HealthWellbeingRecords",
                columns: table => new
                {
                    HealthRecordId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResidentId = table.Column<int>(type: "integer", nullable: false),
                    RecordDate = table.Column<DateOnly>(type: "date", nullable: false),
                    GeneralHealthScore = table.Column<decimal>(type: "numeric", nullable: true),
                    NutritionScore = table.Column<decimal>(type: "numeric", nullable: true),
                    SleepQualityScore = table.Column<decimal>(type: "numeric", nullable: true),
                    EnergyLevelScore = table.Column<decimal>(type: "numeric", nullable: true),
                    HeightCm = table.Column<decimal>(type: "numeric", nullable: true),
                    WeightKg = table.Column<decimal>(type: "numeric", nullable: true),
                    Bmi = table.Column<decimal>(type: "numeric", nullable: true),
                    MedicalCheckupDone = table.Column<bool>(type: "boolean", nullable: false),
                    DentalCheckupDone = table.Column<bool>(type: "boolean", nullable: false),
                    PsychologicalCheckupDone = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthWellbeingRecords", x => x.HealthRecordId);
                });

            migrationBuilder.CreateTable(
                name: "HomeVisitations",
                columns: table => new
                {
                    VisitationId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResidentId = table.Column<int>(type: "integer", nullable: false),
                    VisitDate = table.Column<DateOnly>(type: "date", nullable: false),
                    SocialWorker = table.Column<string>(type: "text", nullable: false),
                    VisitType = table.Column<string>(type: "text", nullable: false),
                    LocationVisited = table.Column<string>(type: "text", nullable: true),
                    FamilyMembersPresent = table.Column<string>(type: "text", nullable: true),
                    Purpose = table.Column<string>(type: "text", nullable: true),
                    Observations = table.Column<string>(type: "text", nullable: true),
                    FamilyCooperationLevel = table.Column<string>(type: "text", nullable: false),
                    SafetyConcernsNoted = table.Column<bool>(type: "boolean", nullable: false),
                    FollowUpNeeded = table.Column<bool>(type: "boolean", nullable: false),
                    FollowUpNotes = table.Column<string>(type: "text", nullable: true),
                    VisitOutcome = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeVisitations", x => x.VisitationId);
                });

            migrationBuilder.CreateTable(
                name: "IncidentReports",
                columns: table => new
                {
                    IncidentId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResidentId = table.Column<int>(type: "integer", nullable: false),
                    SafehouseId = table.Column<int>(type: "integer", nullable: false),
                    IncidentDate = table.Column<DateOnly>(type: "date", nullable: false),
                    IncidentType = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ResponseTaken = table.Column<string>(type: "text", nullable: true),
                    Resolved = table.Column<bool>(type: "boolean", nullable: false),
                    ResolutionDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ReportedBy = table.Column<string>(type: "text", nullable: true),
                    FollowUpRequired = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IncidentReports", x => x.IncidentId);
                });

            migrationBuilder.CreateTable(
                name: "InKindDonationItems",
                columns: table => new
                {
                    ItemId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DonationId = table.Column<int>(type: "integer", nullable: false),
                    ItemName = table.Column<string>(type: "text", nullable: false),
                    ItemCategory = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitOfMeasure = table.Column<string>(type: "text", nullable: false),
                    EstimatedUnitValue = table.Column<decimal>(type: "numeric", nullable: false),
                    IntendedUse = table.Column<string>(type: "text", nullable: false),
                    ReceivedCondition = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InKindDonationItems", x => x.ItemId);
                });

            migrationBuilder.CreateTable(
                name: "InterventionPlans",
                columns: table => new
                {
                    PlanId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResidentId = table.Column<int>(type: "integer", nullable: false),
                    PlanCategory = table.Column<string>(type: "text", nullable: false),
                    PlanDescription = table.Column<string>(type: "text", nullable: true),
                    ServicesProvided = table.Column<string>(type: "text", nullable: true),
                    TargetValue = table.Column<decimal>(type: "numeric", nullable: true),
                    TargetDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CaseConferenceDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterventionPlans", x => x.PlanId);
                });

            migrationBuilder.CreateTable(
                name: "PartnerAssignments",
                columns: table => new
                {
                    AssignmentId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartnerId = table.Column<int>(type: "integer", nullable: false),
                    SafehouseId = table.Column<int>(type: "integer", nullable: true),
                    ProgramArea = table.Column<string>(type: "text", nullable: false),
                    AssignmentStart = table.Column<DateOnly>(type: "date", nullable: false),
                    AssignmentEnd = table.Column<DateOnly>(type: "date", nullable: true),
                    ResponsibilityNotes = table.Column<string>(type: "text", nullable: true),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartnerAssignments", x => x.AssignmentId);
                });

            migrationBuilder.CreateTable(
                name: "Partners",
                columns: table => new
                {
                    PartnerId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartnerName = table.Column<string>(type: "text", nullable: false),
                    PartnerType = table.Column<string>(type: "text", nullable: false),
                    RoleType = table.Column<string>(type: "text", nullable: false),
                    ContactName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: false),
                    Region = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partners", x => x.PartnerId);
                });

            migrationBuilder.CreateTable(
                name: "ProcessRecordings",
                columns: table => new
                {
                    RecordingId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResidentId = table.Column<int>(type: "integer", nullable: false),
                    SessionDate = table.Column<DateOnly>(type: "date", nullable: false),
                    SocialWorker = table.Column<string>(type: "text", nullable: false),
                    SessionType = table.Column<string>(type: "text", nullable: false),
                    SessionDurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    EmotionalStateObserved = table.Column<string>(type: "text", nullable: false),
                    EmotionalStateEnd = table.Column<string>(type: "text", nullable: false),
                    SessionNarrative = table.Column<string>(type: "text", nullable: true),
                    InterventionsApplied = table.Column<string>(type: "text", nullable: true),
                    FollowUpActions = table.Column<string>(type: "text", nullable: true),
                    ProgressNoted = table.Column<bool>(type: "boolean", nullable: false),
                    ConcernsFlagged = table.Column<bool>(type: "boolean", nullable: false),
                    ReferralMade = table.Column<bool>(type: "boolean", nullable: false),
                    NotesRestricted = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessRecordings", x => x.RecordingId);
                });

            migrationBuilder.CreateTable(
                name: "PublicImpactSnapshots",
                columns: table => new
                {
                    SnapshotId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SnapshotDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Headline = table.Column<string>(type: "text", nullable: false),
                    SummaryText = table.Column<string>(type: "text", nullable: true),
                    MetricPayloadJson = table.Column<string>(type: "text", nullable: true),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    PublishedAt = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicImpactSnapshots", x => x.SnapshotId);
                });

            migrationBuilder.CreateTable(
                name: "Residents",
                columns: table => new
                {
                    ResidentId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CaseControlNo = table.Column<string>(type: "text", nullable: false),
                    InternalCode = table.Column<string>(type: "text", nullable: false),
                    SafehouseId = table.Column<int>(type: "integer", nullable: false),
                    CaseStatus = table.Column<string>(type: "text", nullable: false),
                    Sex = table.Column<string>(type: "text", nullable: false),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: false),
                    BirthStatus = table.Column<string>(type: "text", nullable: true),
                    PlaceOfBirth = table.Column<string>(type: "text", nullable: true),
                    Religion = table.Column<string>(type: "text", nullable: true),
                    CaseCategory = table.Column<string>(type: "text", nullable: false),
                    SubCatOrphaned = table.Column<bool>(type: "boolean", nullable: false),
                    SubCatTrafficked = table.Column<bool>(type: "boolean", nullable: false),
                    SubCatChildLabor = table.Column<bool>(type: "boolean", nullable: false),
                    SubCatPhysicalAbuse = table.Column<bool>(type: "boolean", nullable: false),
                    SubCatSexualAbuse = table.Column<bool>(type: "boolean", nullable: false),
                    SubCatOsaec = table.Column<bool>(type: "boolean", nullable: false),
                    SubCatCicl = table.Column<bool>(type: "boolean", nullable: false),
                    SubCatAtRisk = table.Column<bool>(type: "boolean", nullable: false),
                    SubCatStreetChild = table.Column<bool>(type: "boolean", nullable: false),
                    SubCatChildWithHiv = table.Column<bool>(type: "boolean", nullable: false),
                    IsPwd = table.Column<bool>(type: "boolean", nullable: false),
                    PwdType = table.Column<string>(type: "text", nullable: true),
                    HasSpecialNeeds = table.Column<bool>(type: "boolean", nullable: false),
                    SpecialNeedsDiagnosis = table.Column<string>(type: "text", nullable: true),
                    FamilyIs4ps = table.Column<bool>(type: "boolean", nullable: false),
                    FamilySoloParent = table.Column<bool>(type: "boolean", nullable: false),
                    FamilyIndigenous = table.Column<bool>(type: "boolean", nullable: false),
                    FamilyParentPwd = table.Column<bool>(type: "boolean", nullable: false),
                    FamilyInformalSettler = table.Column<bool>(type: "boolean", nullable: false),
                    DateOfAdmission = table.Column<DateOnly>(type: "date", nullable: false),
                    AgeUponAdmission = table.Column<string>(type: "text", nullable: true),
                    PresentAge = table.Column<string>(type: "text", nullable: true),
                    LengthOfStay = table.Column<string>(type: "text", nullable: true),
                    ReferralSource = table.Column<string>(type: "text", nullable: true),
                    ReferringAgencyPerson = table.Column<string>(type: "text", nullable: true),
                    DateColbRegistered = table.Column<DateOnly>(type: "date", nullable: true),
                    DateColbObtained = table.Column<DateOnly>(type: "date", nullable: true),
                    AssignedSocialWorker = table.Column<string>(type: "text", nullable: true),
                    InitialCaseAssessment = table.Column<string>(type: "text", nullable: true),
                    DateCaseStudyPrepared = table.Column<DateOnly>(type: "date", nullable: true),
                    ReintegrationType = table.Column<string>(type: "text", nullable: true),
                    ReintegrationStatus = table.Column<string>(type: "text", nullable: true),
                    InitialRiskLevel = table.Column<string>(type: "text", nullable: false),
                    CurrentRiskLevel = table.Column<string>(type: "text", nullable: false),
                    DateEnrolled = table.Column<DateOnly>(type: "date", nullable: false),
                    DateClosed = table.Column<DateOnly>(type: "date", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NotesRestricted = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Residents", x => x.ResidentId);
                });

            migrationBuilder.CreateTable(
                name: "SafehouseMonthlyMetrics",
                columns: table => new
                {
                    MetricId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SafehouseId = table.Column<int>(type: "integer", nullable: false),
                    MonthStart = table.Column<DateOnly>(type: "date", nullable: false),
                    MonthEnd = table.Column<DateOnly>(type: "date", nullable: false),
                    ActiveResidents = table.Column<int>(type: "integer", nullable: false),
                    AvgEducationProgress = table.Column<decimal>(type: "numeric", nullable: true),
                    AvgHealthScore = table.Column<decimal>(type: "numeric", nullable: true),
                    ProcessRecordingCount = table.Column<int>(type: "integer", nullable: false),
                    HomeVisitationCount = table.Column<int>(type: "integer", nullable: false),
                    IncidentCount = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SafehouseMonthlyMetrics", x => x.MetricId);
                });

            migrationBuilder.CreateTable(
                name: "Safehouses",
                columns: table => new
                {
                    SafehouseId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SafehouseCode = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Region = table.Column<string>(type: "text", nullable: false),
                    City = table.Column<string>(type: "text", nullable: false),
                    Province = table.Column<string>(type: "text", nullable: false),
                    Country = table.Column<string>(type: "text", nullable: false),
                    OpenDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CapacityGirls = table.Column<int>(type: "integer", nullable: false),
                    CapacityStaff = table.Column<int>(type: "integer", nullable: false),
                    CurrentOccupancy = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Safehouses", x => x.SafehouseId);
                });

            migrationBuilder.CreateTable(
                name: "SocialMediaPosts",
                columns: table => new
                {
                    PostId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Platform = table.Column<string>(type: "text", nullable: false),
                    PlatformPostId = table.Column<string>(type: "text", nullable: true),
                    PostUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DayOfWeek = table.Column<string>(type: "text", nullable: true),
                    PostHour = table.Column<int>(type: "integer", nullable: true),
                    PostType = table.Column<string>(type: "text", nullable: true),
                    MediaType = table.Column<string>(type: "text", nullable: true),
                    Caption = table.Column<string>(type: "text", nullable: true),
                    Hashtags = table.Column<string>(type: "text", nullable: true),
                    NumHashtags = table.Column<int>(type: "integer", nullable: false),
                    MentionsCount = table.Column<int>(type: "integer", nullable: false),
                    HasCallToAction = table.Column<bool>(type: "boolean", nullable: false),
                    CallToActionType = table.Column<string>(type: "text", nullable: true),
                    ContentTopic = table.Column<string>(type: "text", nullable: true),
                    SentimentTone = table.Column<string>(type: "text", nullable: true),
                    CaptionLength = table.Column<int>(type: "integer", nullable: false),
                    FeaturesResidentStory = table.Column<bool>(type: "boolean", nullable: false),
                    CampaignName = table.Column<string>(type: "text", nullable: true),
                    IsBoosted = table.Column<bool>(type: "boolean", nullable: false),
                    BoostBudgetPhp = table.Column<decimal>(type: "numeric", nullable: true),
                    Impressions = table.Column<int>(type: "integer", nullable: true),
                    Reach = table.Column<int>(type: "integer", nullable: true),
                    Likes = table.Column<int>(type: "integer", nullable: true),
                    Comments = table.Column<int>(type: "integer", nullable: true),
                    Shares = table.Column<int>(type: "integer", nullable: true),
                    Saves = table.Column<int>(type: "integer", nullable: true),
                    ClickThroughs = table.Column<int>(type: "integer", nullable: true),
                    VideoViews = table.Column<int>(type: "integer", nullable: true),
                    EngagementRate = table.Column<decimal>(type: "numeric", nullable: true),
                    ProfileVisits = table.Column<int>(type: "integer", nullable: true),
                    DonationReferrals = table.Column<int>(type: "integer", nullable: true),
                    EstimatedDonationValuePhp = table.Column<decimal>(type: "numeric", nullable: true),
                    FollowerCountAtPost = table.Column<int>(type: "integer", nullable: true),
                    WatchTimeSeconds = table.Column<int>(type: "integer", nullable: true),
                    AvgViewDurationSeconds = table.Column<int>(type: "integer", nullable: true),
                    SubscriberCountAtPost = table.Column<int>(type: "integer", nullable: true),
                    Forwards = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SocialMediaPosts", x => x.PostId);
                });

            migrationBuilder.CreateTable(
                name: "Supporters",
                columns: table => new
                {
                    SupporterId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SupporterType = table.Column<string>(type: "text", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    OrganizationName = table.Column<string>(type: "text", nullable: true),
                    FirstName = table.Column<string>(type: "text", nullable: true),
                    LastName = table.Column<string>(type: "text", nullable: true),
                    RelationshipType = table.Column<string>(type: "text", nullable: false),
                    Region = table.Column<string>(type: "text", nullable: true),
                    Country = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FirstDonationDate = table.Column<DateOnly>(type: "date", nullable: true),
                    AcquisitionChannel = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Supporters", x => x.SupporterId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DonationAllocations");

            migrationBuilder.DropTable(
                name: "Donations");

            migrationBuilder.DropTable(
                name: "EducationRecords");

            migrationBuilder.DropTable(
                name: "HealthWellbeingRecords");

            migrationBuilder.DropTable(
                name: "HomeVisitations");

            migrationBuilder.DropTable(
                name: "IncidentReports");

            migrationBuilder.DropTable(
                name: "InKindDonationItems");

            migrationBuilder.DropTable(
                name: "InterventionPlans");

            migrationBuilder.DropTable(
                name: "PartnerAssignments");

            migrationBuilder.DropTable(
                name: "Partners");

            migrationBuilder.DropTable(
                name: "ProcessRecordings");

            migrationBuilder.DropTable(
                name: "PublicImpactSnapshots");

            migrationBuilder.DropTable(
                name: "Residents");

            migrationBuilder.DropTable(
                name: "SafehouseMonthlyMetrics");

            migrationBuilder.DropTable(
                name: "Safehouses");

            migrationBuilder.DropTable(
                name: "SocialMediaPosts");

            migrationBuilder.DropTable(
                name: "Supporters");
        }
    }
}
