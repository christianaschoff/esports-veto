using Microsoft.Extensions.Options;
using MongoDB.Driver;
using VETO.Extensions;
using VETO.Models;

namespace VETO.Database;

public class MongoIndices
{
    private readonly IOptions<VetoSystemDatabaseConfig> _dbConfig;
    private readonly IConfiguration _configuration;
    private readonly ILogger<MongoIndices> _logger;

    public MongoIndices(IOptions<VetoSystemDatabaseConfig> dbConfig, ILogger<MongoIndices> logger, IConfiguration configuration)
    {
        _dbConfig = dbConfig;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task CreateIndexesAsync()
    {
        var connectionString = _dbConfig.Value.ConnectionString;
        if (string.IsNullOrEmpty(connectionString) || connectionString.Equals("<VetoDatabaseConnectionString>"))
        {
            connectionString = Environment.GetEnvironmentVariable("VETO_DATABASE_CONNECTIONSTRING");
        }
        try
        {
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

            await vetoCollection.Indexes.CreateOneAsync(
                new CreateIndexModel<VetoSystem>(Builders<VetoSystem>.IndexKeys.Ascending(x => x.observerId)));

            await vetoResultCollection.Indexes.CreateOneAsync(
                new CreateIndexModel<Veto>(Builders<Veto>.IndexKeys.Ascending(x => x.Id)));

            await vetoResultCollection.Indexes.CreateOneAsync(
                new CreateIndexModel<Veto>(Builders<Veto>.IndexKeys.Ascending(x => x.VetoConfig.vetoId)));

            await vetoResultCollection.Indexes.CreateOneAsync(
                new CreateIndexModel<Veto>(Builders<Veto>.IndexKeys.Ascending(x => x.VetoConfig.playerBId)));

            await vetoResultCollection.Indexes.CreateOneAsync(
                new CreateIndexModel<Veto>(Builders<Veto>.IndexKeys.Ascending(x => x.VetoConfig.playerAId)));

            await vetoResultCollection.Indexes.CreateOneAsync(
                new CreateIndexModel<Veto>(Builders<Veto>.IndexKeys.Ascending(x => x.VetoConfig.observerId)));
        }
        catch (Exception ex)
        {
            if (HelperFunctions.UseOpenTelemetry(_configuration))
            {
                _logger.LogError(ex.Message);
            }
            
        }
    }
}