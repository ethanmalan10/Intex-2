using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class CaseConference
{
    [Key]
    public int ConferenceId { get; set; }
    public int? ResidentId { get; set; }
    public DateOnly ConferenceDate { get; set; }
    public string Topic { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
