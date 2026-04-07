using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class PublicImpactSnapshot
{
    [Key]
    public int SnapshotId { get; set; }
    public DateOnly SnapshotDate { get; set; }
    public string Headline { get; set; } = string.Empty;
    public string? SummaryText { get; set; }
    public string? MetricPayloadJson { get; set; }
    public bool IsPublished { get; set; }
    public DateOnly? PublishedAt { get; set; }
}
