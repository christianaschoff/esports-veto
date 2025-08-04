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
  }  
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

### Rate Limiter

You can simply deactivate the rate limiter if you want to. Rate limiter relies on the generated JWTs.  
If you want to remove the JWTs, then you need to remove the rate limiter as well!

## Remarks

CORS is configured for local development to the default port of a local started angular app.  
If you want to work with prod builds only putting the angular build into wwwroot folder, you won't need any CORS configuration.

The Application is configured to 5452 (for no specific reason).
If you change that, make sure that the proxy.conf.json of the angular frontend is configured to the new port as well.