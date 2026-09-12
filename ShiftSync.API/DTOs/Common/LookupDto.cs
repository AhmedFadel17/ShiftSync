namespace ShiftSync.API.DTOs.Common
{
    public record LookupDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }
}
