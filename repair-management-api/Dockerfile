# Stage 1: Build the application using the full .NET SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the csproj file and restore packages.
# Doing this in a separate step optimizes Docker layer caching!
COPY ["repair-management-api.csproj", "./"]
RUN dotnet restore "repair-management-api.csproj"

# Copy everything else and compile the release binaries
COPY . .
RUN dotnet build "repair-management-api.csproj" -c Release -o /app/build

# Stage 2: Publish the binaries into a folder
FROM build AS publish
RUN dotnet publish "repair-management-api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Lightweight runtime environment containing ONLY the ASP.NET runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose the standard ASP.NET Core port
EXPOSE 8080

# Execute the application
ENTRYPOINT ["dotnet", "repair-management-api.dll"]
