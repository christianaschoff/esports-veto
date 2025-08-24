# Backend

The Backend is developed using dotnet Core 9.

## Prerequisits

### Database

Mongodb was used is the storage, but you can use whatever you like. You will need to write a new adapter of course.  

This is handled by using .net user-secrets for local development:
```CMD
  dotnet user-secrets set "VetoDatabase:ConnectionString" "Your-Database-Connectionstring"
```
If this does not work, you might need to init the user-secret for the project using

```CMD
  dotnet user-secrets init
```
In the appsettings file you will find the structure like that:

```JSON
{
  ...
  "VetoDatabase": {
    "ConnectionString": "<YourDatabaseConnectionstring>",
    "DatabaseName": "DATABASE-NAME",
    "VetoCollectionName": "COLLECTION-NAME",
    "VetoResultCollectionName": "COLLECTION-NAME-2"
  }, 
  "OTLP_ENDPOINT_URL": "OTLP ENDPOINT",
  "ZIPKIN_ENDPOINT_URL": "ZIPKIN ENDPOINT",
  "UseOpenTelemetry": true 
}
```
### JWT

The Application creates JWT. 
You will need to provide a key within the appsettings.  
This is handled by using .net user-secrets for local development.  

```CMD
  dotnet user-secrets set "Token:key" "Your-Secret-Key"
```
If this does not work, you might need to init the user-secret for the project using

```CMD
  dotnet user-secrets init
```
In the appsettings file you will find the structure like that:

```JSON
{
...
 "Token" : {
    "key": "<YourSecretKey>"
  }
}
```

### Run with docker

have a look into the Readme in the base folder!

### Monitoring & Tracing 

We use OpenTelemtry within the application.  
To activate Logging and tracing you need to set

```JSON
  "UseOpenTelemetry": true 
```

When using OpenTelemtry is enabled, an /metrics Endpoint is added and can be consumed by Tools like Prometheus.  
Tracing can be done by OTLP over http or Zipkin over gRPC. You can connect that to jaeger or other collectors.  
You __can__ use Zikin and OTLP side by side, but when the same collector like jaeger is configured, it will receive each span/event two times. That might cause warning messages in jaeger.  
We recommend to configure just one endpoint. Just leave the other blank oder set it to null. Please consult the documentation of your collector to get the correct endpoints.

### Rate Limiter

You can simply deactivate the rate limiter if you want to. Rate limiter relies on the generated JWTs.  
If you want to remove the JWTs, then you need to remove the rate limiter as well!

## Remarks

CORS is configured for local development to the default port of a local started angular app.  
If you want to work with prod builds only putting the angular build into wwwroot folder, you won't need any CORS configuration.

The Application is configured to 5452 (for no specific reason).
If you change that, make sure that the proxy.conf.json of the angular frontend is configured to the new port as well.