# esports-veto

This is a combo repo of the frontend and the backend to run the whole application.

## Frontend

The Frontend is developed using Angular 20.

## Backend

The Backend is developed using .NET Core 9.

## About

This project aims to provide a simple solution for doing esports vetos.  
A major goal is to provide an annoymous solution that can be used without creating an account.

## Run with container/docker

you can run the app within a container/docker using

```shell
   docker compose down -v && docker compose up --build
```
__be careful__: the -v switch will delete all volumes etc.!  
If you want to preseve the data even after restart of your container, remove the -v parameter!

```shell
   docker compose down && docker compose up --build
```

Alternatively you can use to run it as a service in the background

```docker
    docker compose up -d
```

### Configuration

You need to configure some env-variables to make it work in docker. 
Create a .env file in the root folder of this repo (like docker-compose.yml)
in unix/macOS Systems 

```shell
touch .env
```

Add those lines into the .env file with your specific values

```shell
VETO_DATABASE_CONNECTIONSTRING=mongodb://root:password@mongo:27017/?authSource=admin
TOKEN_KEY=<YourTokenKeyHere>
CONTAINER=true
```

If you want to use OpenTelemetry collectors extend the Env-File like that:

```shell
OTLP_ENDPOINT_URL=<YourOtplEndpoint>
ZIPKIN_ENDPOINT_URL=<YourZipkinEndpoint>
UseOpenTelemetry=true
```

Be advised: decide, if you want to use Zipkin or an OTLP Connector over json.  
if both have an url, the backend will send both, but the span will be the same.  
Tools like jaeger will complain (though work) in the details of a trace and show both of them.

To provide Legal Notice (as it is mandatory on EU) use the following variables:

```shell
LegalNotice__Name=${LEGALNOTICE_NAME:-<Default Name>}
LegalNotice__LegalEntity=${LEGALNOTICE_LEGAL_ENTITY:-<Default Entity>}
LegalNotice__Street=${LEGALNOTICE_STREET:-<Default Street>}
LegalNotice__ZipcodeTown=${LEGALNOTICE_ZIP_CODE_TOWN:-<Default Zip Town>}
LegalNotice__Email=${LEGALNOTICE_EMAIL:-<Default Email>}
LegalNotice__PhoneNumber=${LEGALNOTICE_PHONE_NUMBER:-<Default Phone>}
```

### VETO_DATABASE_CONNECTIONSTRING

make sure that username and password match with the username an password you chose in the docker-compose.yml
```yml
  mongo:
    ...
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password
```

### TOKEN_KEY

Generate a key and place it here.

### CONTAINER

Tells the .net backend, that it should not enforce SSL/TLS itself, but relies on a reverse-proxy that does SSL Termination in Docker/Kubernetes environment. 

## Connect to Database

You can connect to mongo db using (assuming you kept the default config - otherwise update accordingly)

```shell
  mongosh --username root --password password --authenticationDatabase admin
```
Keep in mind to ssh into your mongo container first.

## Attributions

Sounds from [Notification Sounds](https://notificationsounds.com/)
