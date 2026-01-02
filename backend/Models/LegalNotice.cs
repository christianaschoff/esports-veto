namespace VETO.Models;

public class LegalNotice
{
    public required string Name { get; set; }
    public required string LegalEntity { get; set; }
    public required string Street { get; set; }
    public required string ZipcodeTown { get; set; }
    public required string Email { get; set; }
    public required string PhoneNumber { get; set; }
}