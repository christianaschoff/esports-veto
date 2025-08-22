using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Core.Extensions.DiagnosticSources;
using VETO.Models;

namespace VETO.Services;

public class VetoSystemSetupService
{
    private readonly IMongoCollection<VetoSystem> _vetoCollection;
    
    public VetoSystemSetupService(IOptions<VetoSystemDatabaseConfig> dbConfig, ILogger<VetoSystem> logger)
    {
        var connectionString = dbConfig.Value.ConnectionString;
        if (string.IsNullOrEmpty(connectionString) || connectionString.Equals("<VetoDatabaseConnectionString>")) {            
            connectionString = Environment.GetEnvironmentVariable("VETO_DATABASE_CONNECTIONSTRING");
         }        
        var settings = MongoClientSettings.FromConnectionString(connectionString);
        settings.ClusterConfigurator = cb => cb.Subscribe(new DiagnosticsActivityEventSubscriber());

        var mongoClient = new MongoClient(settings);
        var mongoDatabase = mongoClient.GetDatabase(dbConfig.Value.DatabaseName);
        _vetoCollection = mongoDatabase.GetCollection<VetoSystem>(dbConfig.Value.VetoCollectionName);        
    }

    public async Task<List<VetoSystem>> GetAsync() =>
        await _vetoCollection.Find(_ => true).ToListAsync();

    public async Task<VetoSystem?> GetAsync(string id) =>
        await _vetoCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<VetoSystem?> GetByVetoIdAsync(string id) {
        var filter = Builders<VetoSystem>.Filter.Eq(x => x.vetoId, id);
        return await _vetoCollection.Find(x => x.vetoId == id).FirstOrDefaultAsync();
    }

    public async Task<VetoSystem?> GetVetoDataAsync(AttendeeType attendeeType, string id)
    {
        if (attendeeType == AttendeeType.Admin)
        {
            var filter = Builders<VetoSystem>.Filter.Eq(x => x.vetoId, id);
            return await _vetoCollection.Find(filter).FirstOrDefaultAsync();
        }
        if (attendeeType == AttendeeType.Observer)
        {
            var filter = Builders<VetoSystem>.Filter.Eq(x => x.observerId, id);
            return await _vetoCollection.Find(filter).FirstOrDefaultAsync();
        }
        if (attendeeType == AttendeeType.Player)
        {
            var filter = Builders<VetoSystem>.Filter.Or(
                Builders<VetoSystem>.Filter.Eq(x => x.playerAId, id),
                Builders<VetoSystem>.Filter.Eq(x => x.playerBId, id)
            );
            return await _vetoCollection.Find(filter).FirstOrDefaultAsync();
        }
        return null;
    }

    public async Task CreateAsync(VetoSystem newVeto)
    {        
        await _vetoCollection.InsertOneAsync(newVeto);
    }

    public async Task UpdateAsync(string id, VetoSystem updatedVeto) =>
        await _vetoCollection.ReplaceOneAsync(x => x.Id == id, updatedVeto);

    public async Task RemoveAsync(string id) =>
        await _vetoCollection.DeleteOneAsync(x => x.Id == id);
}
