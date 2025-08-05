using Microsoft.Extensions.Options;
using MongoDB.Driver;
using VETO.Models;

namespace VETO.Services;

public class VetoSystemSetupService
{
    private readonly IMongoCollection<VetoSystem> _vetoCollection;

    public VetoSystemSetupService(IOptions<VetoSystemDatabaseConfig> dbConfig)
    {
        var mongoClient = new MongoClient(dbConfig.Value.ConnectionString);
        var mongoDatabase = mongoClient.GetDatabase(dbConfig.Value.DatabaseName);
        _vetoCollection = mongoDatabase.GetCollection<VetoSystem>(dbConfig.Value.VetoCollectionName);
    }

    public async Task<List<VetoSystem>> GetAsync() =>
        await _vetoCollection.Find(_ => true).ToListAsync();

    public async Task<VetoSystem?> GetAsync(string id) =>
        await _vetoCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<VetoSystem?> GetByVetoIdAsync(string id) =>
        await _vetoCollection.Find(x => x.vetoId == id).FirstOrDefaultAsync();

    public async Task<VetoSystem?> GetVetoDataAsync(AttendeeType attendeeType, string id)
    {
        if (attendeeType == AttendeeType.Admin)
        {
            return await _vetoCollection.Find(x => x.vetoId == id).FirstOrDefaultAsync();
        }
        if (attendeeType == AttendeeType.Observer)
        {
            return await _vetoCollection.Find(x => x.observerId == id).FirstOrDefaultAsync();
        }
        if (attendeeType == AttendeeType.Player)
        {
            return await _vetoCollection.Find(x => x.playerAId == id || x.playerBId == id).FirstOrDefaultAsync();
        }
        return null;
    }

    public async Task CreateAsync(VetoSystem newVeto) =>
        await _vetoCollection.InsertOneAsync(newVeto);

    public async Task UpdateAsync(string id, VetoSystem updatedVeto) =>
        await _vetoCollection.ReplaceOneAsync(x => x.Id == id, updatedVeto);

    public async Task RemoveAsync(string id) =>
        await _vetoCollection.DeleteOneAsync(x => x.Id == id);
}
