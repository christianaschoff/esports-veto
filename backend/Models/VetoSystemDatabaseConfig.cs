namespace VETO.Models;

public class VetoSystemDatabaseConfig
{
    public string ConnectionString { get; set; } = null!;

    public string DatabaseName { get; set; } = null!;

    public string VetoCollectionName { get; set; } = null!;

    public string VetoResultCollectionName { get; set; } = null!;
}