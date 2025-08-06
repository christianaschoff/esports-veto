FROM node:current-alpine3.22 AS angular-build

WORKDIR /app

# Copy only package files first to cache npm install
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy rest of the Angular code and build
COPY frontend/ .
RUN npm run build -- --output-path=dist

# ── Stage 2 ── Build the ASP.NET Core API ------------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS dotnet-build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY backend/*.csproj ./backend/
RUN dotnet restore ./backend/Veto.csproj

# Copy everything else
COPY . .

# Publish the API (self‑contained if you prefer, otherwise just trimmed)
RUN dotnet publish ./backend/Veto.csproj -c Release -o /app/publish

# ── Stage 3 ── Runtime image ------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Copy the published API
COPY --from=dotnet-build /app/publish .

# Copy the Angular build into the ASP.NET wwwroot
# (adjust path if your Angular output folder is different)
COPY --from=angular-build /app/dist/browser /app/wwwroot
COPY --from=angular-build /app/dist/3rdpartylicenses.txt /app/wwwroot/3rdpartylicenses.txt
COPY --from=angular-build /app/dist/prerendered-routes.json /app/wwwroot/prerendered-routes.json

# Expose port 80 (use 5000 for Kestrel when not using reverse proxy)
EXPOSE 80

# Optional: If you want to run via Kestrel on port 5000
# ENV ASPNETCORE_URLS=http://+:5000

ENTRYPOINT ["dotnet", "Veto.dll"]