# Veto MCP Server

A Model Context Protocol (MCP) server for creating and managing veto sessions for Starcraft 2 esports matches. In Starcraft 2 competitive gaming, veto sessions allow players to take turns banning (removing) and picking (choosing) maps from a pool before the match begins. This strategic process ensures fair map selection and adds excitement to tournaments.

This server provides tools to create veto sessions with customizable game modes, player configurations, and tournament brackets, supporting both individual matches and large-scale competitions with up to 256 unique matchups.

**Created by ODGW Veto System** - Part of the Old Dudes Gone Wild ecosystem for professional esports tournament management.

## How Veto Sessions Work

In Starcraft 2 esports, veto sessions are interactive processes where players strategically select the maps they'll play on:

1. **Map Pool**: Each game mode has a predefined set of maps (e.g., M1V1 might have 7 maps)
2. **Ban/Pick Process**: Players take turns banning maps they don't want to play and picking maps they prefer
3. **Strategic Depth**: The veto pattern (ABBA/ABAB) determines who bans/picks in which order
4. **Live Interaction**: Players access unique URLs to participate in real-time veto decisions
5. **Tournament Integration**: Supports brackets, round-robin tournaments, and playoff series

Each veto session generates:
- **Admin URL**: Tournament organizers can monitor and control the process
- **Player URLs**: Each player gets their own interface for making decisions
- **Observer URL**: Live streaming and spectator access to watch the veto unfold

## Features

- **Strategic Map Veto System**: Create interactive veto sessions where players ban/pick Starcraft 2 maps before matches
- **Multiple Game Formats**: Support for 1v1 (M1V1), 2v2 (M2V2), 3v3 (M3V3), and 4v4 (M4V4) team matches
- **Flexible Series Length**: Configurable best-of formats (BO1, BO3, BO5, BO7, BO9) for different tournament stages
- **Custom Branding**: Personalized player names, team names, and match titles
- **Veto Patterns**: Choose between ABBA and ABAB ban/pick sequences for strategic variety
- **Tournament Scale**: Batch creation supporting up to 256 unique matchups (512 players) for large brackets
- **Performance Optimized**: Parallel processing in batches of 5 to prevent API overload during mass creation
- **Legacy Support**: Backward compatible with simple single/bulk veto creation
- **Complete Access Control**: Generates unique URLs for tournament admins, both players, and live observers

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Access to a running Veto API server (default: http://localhost:5254/api)

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd veto-mcp-server
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

You can configure the server using environment variables:

- `VETO_BASE_URL`: The base URL of your Veto API server (default: `http://localhost:5254/api`)

Example:
```bash
export VETO_BASE_URL="https://your-veto-api.com/api"
```

### Development vs Production

- **Development**: Uses `npm run dev` with ts-node for hot reloading
- **Production**: Build with `npm run build` and run with `npm start`

## Running the Server

### Development Mode

For development with automatic reloading:
```bash
npm run dev
```

### Production Mode

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

The server will start and listen for MCP requests via stdio (standard input/output).

## Usage

This MCP server provides a single tool called `create_veto` that can be used to create veto sessions for Starcraft 2 matches. Choose the approach that fits your needs:

### When to Use Each Method

- **Single Match**: Use `playerA` + `playerB` + `count: 1` for one-off exhibition matches
- **Multiple Identical Matches**: Use `playerA` + `playerB` + `count: 2-5` for practice sessions or round-robin with same opponents
- **Tournament Bracket**: Use `matchups` array for unique player pairings in brackets, playoffs, or diverse competitions

### Tool Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mode` | string | Yes | - | Game mode: `M1V1`, `M2V2`, `M3V3`, or `M4V4` |
| `bestOf` | string | No | `BO3` | Best of format: `BO1`, `BO3`, `BO5`, `BO7`, or `BO9` |
| `playerA` | string | No | - | Player A name (max 25 characters) - use with `playerB` and `count` |
| `playerB` | string | No | - | Player B name (max 25 characters) - use with `playerA` and `count` |
| `title` | string | No | `Match` | Match title (max 50 characters) |
| `vetoSystem` | string | No | `ABBA` | Veto system: `ABBA` or `ABAB` |
| `count` | number | No | 1 | Number of veto sessions to create when using `playerA`/`playerB` (1-5, defaults to 1) |
| `matchups` | array | No | - | Array of matchups for batch creation (max 256 matchups) |

### Matchups Array Structure

Each matchup in the `matchups` array should have:
- `playerA`: Player A name (max 25 characters)
- `playerB`: Player B name (max 25 characters)
- `title`: Optional match title (max 50 characters, defaults to global title)

### Example Usage

#### Exhibition Match (Single Veto)
Create a single BO3 veto session for a 1v1 exhibition match:
```json
{
  "mode": "M1V1",
  "bestOf": "BO3",
  "playerA": "ProtossMaster",
  "playerB": "ZergQueen",
  "title": "Championship Finals"
}
```
*Note: `count` defaults to 1 when using `playerA`/`playerB`*
*Use case: Streamed exhibition matches, content creation, or single-elimination tournament finals*

#### Practice Sessions (Multiple Identical)
Create 3 identical BO1 veto sessions for team practice:
```json
{
  "mode": "M2V2",
  "bestOf": "BO1",
  "count": 3,
  "playerA": "Team Alpha",
  "playerB": "Team Beta",
  "title": "Practice Session"
}
```
*Use case: Team practice, round-robin warmups, or multiple matches between same opponents*

#### Tournament Bracket (Unique Matchups)
Create a playoff bracket with unique player pairings:
```json
{
  "mode": "M1V1",
  "bestOf": "BO5",
  "vetoSystem": "ABBA",
  "matchups": [
    {
      "playerA": "Maru",
      "playerB": "Cure",
      "title": "Quarterfinals A"
    },
    {
      "playerA": "Stats",
      "playerB": "Zest",
      "title": "Quarterfinals B"
    },
    {
      "playerA": "Dark",
      "playerB": "Rogue",
      "title": "Quarterfinals C"
    }
  ]
}
```
*Use case: Tournament brackets, playoff series, round-robin tournaments with different opponents*

#### Large Online Tournament (256 Matchups)
Create a massive online tournament with diverse player pool:
```json
{
  "mode": "M1V1",
  "bestOf": "BO3",
  "matchups": [
    {"playerA": "ProPlayer001", "playerB": "AmateurChamp002", "title": "Group A Round 1"},
    {"playerA": "StreamerAlpha", "playerB": "RisingStar004", "title": "Group B Round 1"},
    // ... up to 256 unique matchups for massive tournaments
  ]
}
```
*Use case: Large online tournaments, community events, or professional league brackets*

### Batch Processing

When creating multiple veto sessions, the system processes them in parallel batches of up to 5 simultaneous requests to prevent overwhelming the API endpoint. This ensures reliable performance even with large numbers of matchups.

### Response Format

The tool returns a structured response designed for tournament management:

#### Success Response Structure
```json
{
  "success": true,           // true if all veto sessions created successfully
  "vetos": [                 // Array of created veto sessions (1 per matchup)
    {
      "vetoId": "uuid",      // Unique identifier for this veto session
      "playerAId": "uuid",   // Player A's unique access token
      "playerBId": "uuid",   // Player B's unique access token
      "observerId": "uuid",  // Observer/spectator access token
      "title": "Match Title", // Display name for the match
      "playerA": "PlayerName", // Team/Player A display name
      "playerB": "PlayerName", // Team/Player B display name
      "bestOf": "BO3",       // Series format (BO1, BO3, BO5, BO7, BO9)
      "mode": "M1V1",        // Game format (M1V1, M2V2, M3V3, M4V4)
      "maps": ["Map1", "Map2", ...], // Available maps for veto selection
      "urls": {
        "admin": "http://localhost:4200/admin/uuid",     // Tournament admin control panel
        "playerA": {
          "name": "PlayerName",                          // Player A's display name
          "url": "http://localhost:4200/veto/player/uuid" // Player A's veto interface
        },
        "playerB": {
          "name": "PlayerName",                          // Player B's display name
          "url": "http://localhost:4200/veto/player/uuid" // Player B's veto interface
        },
        "observer": "http://localhost:4200/observe/uuid"  // Live spectator view
      }
    }
  ],
  "errors": []              // Empty array if successful, otherwise contains error details
}
```

#### URL Usage Guide
- **Admin URL**: Tournament organizers monitor progress, start/stop vetoes, and resolve disputes
- **Player URLs**: Each player accesses their personal interface to make ban/pick decisions in real-time
- **Observer URL**: Streamers, commentators, and fans watch the veto process unfold live

#### Error Response Structure
```json
{
  "success": false,
  "vetos": [],              // Successfully created vetos (may be partial)
  "errors": [               // Array of creation failures
    {
      "index": 2,           // Matchup index that failed (0-based)
      "error": "Error message describing what went wrong"
    }
  ]
}
```

## Integration with MCP Clients

This server is designed to work with MCP-compatible clients. The server communicates via stdio, so it can be integrated into applications that support the Model Context Protocol.

## Testing

Run the included test script:
```bash
npm test
```

## Troubleshooting

### Common Issues

1. **Connection to Veto API fails**
   - Ensure the Veto API server is running
   - Check the `VETO_BASE_URL` environment variable
   - Verify network connectivity

2. **Build fails**
   - Ensure you have Node.js v16 or higher installed
   - Try clearing node_modules and reinstalling: `rm -rf node_modules && npm install`

3. **Server won't start**
   - Check that port 5254 (default) is not in use if running locally
   - Verify all dependencies are installed
   - Check for TypeScript compilation errors

### Logs

The server outputs error logs to stderr. Check the console output for debugging information.

## About ODGW

This Veto MCP Server is developed as part of the **ODGW (Old Dudes Gone Wild)** ecosystem. ODGW provides professional tools and services for esports tournament management, including veto systems, bracket generation, and live streaming integration for competitive gaming communities.

For more information about ODGW services and tools, visit our ecosystem documentation.

## License

This project is licensed under the MIT License.