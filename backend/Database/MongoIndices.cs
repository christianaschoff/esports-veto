using System.Reflection.Emit;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using VETO.Models;

namespace VETO.Database;


public class MongoIndices
{
    private readonly IOptions<VetoSystemDatabaseConfig> _dbConfig;

    public MongoIndices(IOptions<VetoSystemDatabaseConfig> dbConfig)
    {
        _dbConfig = dbConfig;  
    }

    public async Task CreateIndexesAsync()
    {
        var connectionString = _dbConfig.Value.ConnectionString;
        if (string.IsNullOrEmpty(connectionString) || connectionString.Equals("<VetoDatabaseConnectionString>"))
        {
            connectionString = Environment.GetEnvironmentVariable("VETO_DATABASE_CONNECTIONSTRING");
        }
        var settings = MongoClientSettings.FromConnectionString(connectionString);

        var mongoClient = new MongoClient(settings);
        var mongoDatabase = mongoClient.GetDatabase(_dbConfig.Value.DatabaseName);

        var vetoCollection = mongoDatabase.GetCollection<VetoSystem>(_dbConfig.Value.VetoCollectionName);
        var vetoResultCollection = mongoDatabase.GetCollection<Veto>(_dbConfig.Value.VetoResultCollectionName);

        // Create indexes
        await vetoCollection.Indexes.CreateOneAsync(
            new CreateIndexModel<VetoSystem>(Builders<VetoSystem>.IndexKeys.Ascending(x => x.Id)));

        await vetoCollection.Indexes.CreateOneAsync(
            new CreateIndexModel<VetoSystem>(Builders<VetoSystem>.IndexKeys.Ascending(x => x.vetoId)));

        await vetoCollection.Indexes.CreateOneAsync(
            new CreateIndexModel<VetoSystem>(Builders<VetoSystem>.IndexKeys.Ascending(x => x.playerAId)));

        await vetoCollection.Indexes.CreateOneAsync(
            new CreateIndexModel<VetoSystem>(Builders<VetoSystem>.IndexKeys.Ascending(x => x.playerBId)));


        await vetoResultCollection.Indexes.CreateOneAsync(
            new CreateIndexModel<Veto>(Builders<Veto>.IndexKeys.Ascending(x => x.Id)));

        await vetoResultCollection.Indexes.CreateOneAsync(
            new CreateIndexModel<Veto>(Builders<Veto>.IndexKeys.Ascending(x => x.VetoConfig.vetoId)));

        await vetoResultCollection.Indexes.CreateOneAsync(
            new CreateIndexModel<Veto>(Builders<Veto>.IndexKeys.Ascending(x => x.VetoConfig.playerBId)));

        await vetoResultCollection.Indexes.CreateOneAsync(
            new CreateIndexModel<Veto>(Builders<Veto>.IndexKeys.Ascending(x => x.VetoConfig.playerAId)));
    }
}