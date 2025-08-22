using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Core.Extensions.DiagnosticSources;
using VETO.Models;

namespace VETO.Services;

public class VetoSystemResultService
{
    private readonly IMongoCollection<Veto> _vetoCollection;    

    public VetoSystemResultService(IOptions<VetoSystemDatabaseConfig> dbConfig)
    {
        var connectionString = dbConfig.Value.ConnectionString;
        if (string.IsNullOrEmpty(connectionString) || connectionString.Equals("<VetoDatabaseConnectionString>"))
        {
            connectionString = Environment.GetEnvironmentVariable("VETO_DATABASE_CONNECTIONSTRING");
        }
        var settings = MongoClientSettings.FromConnectionString(connectionString);
        settings.ClusterConfigurator = cb => cb.Subscribe(new DiagnosticsActivityEventSubscriber());

        var mongoClient = new MongoClient(settings);
        var mongoDatabase = mongoClient.GetDatabase(dbConfig.Value.DatabaseName);
        _vetoCollection = mongoDatabase.GetCollection<Veto>(dbConfig.Value.VetoResultCollectionName);        
    }

    public async Task<List<Veto>> GetAsync() =>
        await _vetoCollection.Find(_ => true).ToListAsync();

    public async Task<Veto?> GetByIdAsync(string id) =>
        await _vetoCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<Veto?> GetByVetoIdAsync(string id) =>
        await _vetoCollection.Find(x => x.VetoId == id).FirstOrDefaultAsync();

    public async Task CreateAsync(Veto veto) =>
        await _vetoCollection.InsertOneAsync(veto);

    public async Task UpdateAsync(string id, Veto updatedVeto) =>
        await _vetoCollection.ReplaceOneAsync(x => x.Id == id, updatedVeto, new ReplaceOptions { IsUpsert = true });                
        
    public async Task RemoveAsync(string id) =>
        await _vetoCollection.DeleteOneAsync(x => x.Id == id);
}
