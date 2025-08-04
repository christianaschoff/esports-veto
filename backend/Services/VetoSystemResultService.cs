using Microsoft.Extensions.Options;
using MongoDB.Driver;
using VETO.Models;

namespace VETO.Services;

public class VetoSystemResultService
{
    private readonly IMongoCollection<Veto> _vetoCollection;

    public VetoSystemResultService(IOptions<VetoSystemDatabaseConfig> dbConfig)
    {
        var mongoClient = new MongoClient(dbConfig.Value.ConnectionString);
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
