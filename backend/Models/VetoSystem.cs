using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace VETO.Models;

public record VetoSystem(string BestOf, string PlayerA, string PlayerB, string Title, string vetoSystem, string GameId, string Mode, string[] Maps)
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public string vetoId = Guid.NewGuid().ToString();
    public string playerAId = Guid.NewGuid().ToString();
    public string playerBId = Guid.NewGuid().ToString();
    public string observerId = Guid.NewGuid().ToString();
    public string creationDate = DateTime.Now.ToString("s");

}