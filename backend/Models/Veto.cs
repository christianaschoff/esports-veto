using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace VETO.Models;

public class Veto
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public required string VetoId { get; set; }
    public required VetoSystem VetoConfig { get; set; }
    public string? PlayerA { get; set; }
    public string? PlayerB { get; set; }
    public required List<VetoStep> VetoSteps { get; set; } 
    public VetoState VetoState { get; set; } = VetoState.PLAYER_MISSING;
}