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
