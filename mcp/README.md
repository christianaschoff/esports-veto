# Veto MCP Server

A Model Context Protocol (MCP) server for creating and managing veto sessions for Starcraft 2 matches. This server provides tools to create veto sessions with customizable game modes, player names, and match configurations.

## Features

- Create veto sessions for Starcraft 2 matches
- Support for multiple game modes (M1V1, M2V2, M3V3, M4V4)
- Configurable best-of formats (BO1, BO3, BO5, BO7, BO9)
- Custom player names and match titles
- Multiple veto systems (ABBA, ABAB)
- Batch creation with up to 256 unique matchups
- Parallel processing in batches of 5 to prevent endpoint overload
- Backward compatible with simple veto creation
- Generates admin, player, and observer URLs

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

This MCP server provides a single tool called `create_veto` that can be used to create veto sessions. It supports both individual veto creation and batch creation with multiple matchups.

### Tool Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mode` | string | Yes | - | Game mode: `M1V1`, `M2V2`, `M3V3`, or `M4V4` |
| `bestOf` | string | No | `BO3` | Best of format: `BO1`, `BO3`, `BO5`, `BO7`, or `BO9` |
| `playerA` | string | No | - | Player A name (max 25 characters) - use with `playerB` and `count` |
| `playerB` | string | No | - | Player B name (max 25 characters) - use with `playerA` and `count` |
| `title` | string | No | `Match` | Match title (max 50 characters) |
| `vetoSystem` | string | No | `ABBA` | Veto system: `ABBA` or `ABAB` |
| `count` | number | No | - | Number of veto sessions to create when using `playerA`/`playerB` (1-5) |
| `matchups` | array | No | - | Array of matchups for batch creation (max 256 matchups) |

### Matchups Array Structure

Each matchup in the `matchups` array should have:
- `playerA`: Player A name (max 25 characters)
- `playerB`: Player B name (max 25 characters)
- `title`: Optional match title (max 50 characters, defaults to global title)

### Example Usage

#### Single Veto (Legacy Format)
Create a single BO3 veto session for M1V1 mode:
```json
{
  "mode": "M1V1",
  "bestOf": "BO3",
  "playerA": "ProtossMaster",
  "playerB": "ZergQueen",
  "title": "Championship Finals"
}
```

#### Multiple Identical Vetos (Legacy Format)
Create 3 identical veto sessions for M2V2 mode:
```json
{
  "mode": "M2V2",
  "count": 3,
  "playerA": "Team Alpha",
  "playerB": "Team Beta"
}
```

#### Batch Creation with Matchups
Create multiple different veto sessions using the matchups array:
```json
{
  "mode": "M1V1",
  "bestOf": "BO3",
  "vetoSystem": "ABBA",
  "matchups": [
    {
      "playerA": "omg",
      "playerB": "itworks",
      "title": "Round 1"
    },
    {
      "playerA": "its my name",
      "playerB": "oh my god",
      "title": "Round 2"
    },
    {
      "playerA": "PlayerX",
      "playerB": "PlayerY"
    }
  ]
}
```

#### Large Tournament (256 Matchups)
Create up to 256 matchups for a large tournament:
```json
{
  "mode": "M1V1",
  "bestOf": "BO5",
  "matchups": [
    {"playerA": "Player001", "playerB": "Player002"},
    {"playerA": "Player003", "playerB": "Player004"},
    // ... up to 256 matchups
  ]
}
```

### Batch Processing

When creating multiple veto sessions, the system processes them in parallel batches of up to 5 simultaneous requests to prevent overwhelming the API endpoint. This ensures reliable performance even with large numbers of matchups.

### Response Format

The tool returns a response with:
- `success`: Boolean indicating if all veto sessions were created successfully
- `vetos`: Array of successfully created veto sessions with URLs
- `errors`: Array of errors for failed veto creations (includes matchup index for identification)

Each veto session includes:
- Veto ID and player IDs
- Match details (title, players, mode, maps)
- URLs for admin, player A, player B, and observer access

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

## License

This project is licensed under the MIT License.