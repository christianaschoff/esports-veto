# Veto MCP Server - Agent Guide

This guide provides comprehensive information for AI agents and developers working with the Veto MCP Server project.

## 📋 Project Overview

**Veto MCP Server** is a Model Context Protocol (MCP) server that creates and manages veto sessions for Starcraft 2 esports matches. Players use veto sessions to strategically ban and pick maps before competitive matches begin.

### Key Features
- Create veto sessions for Starcraft 2 matches (M1V1, M2V2, M3V3, M4V4)
- Support for tournament brackets with up to 256 unique matchups
- Batch processing with fixed parallel limit of 5
- Generate admin, player, and observer URLs
- Integration with external Veto API backend

### Architecture
- **Frontend**: TypeScript/Node.js MCP server using Model Context Protocol SDK
- **Backend**: External Veto API server (ASP.NET) running on port 5254
- **Communication**: JSON-RPC over stdio for MCP, REST API for backend
- **Data Flow**: MCP Server ↔ Veto API ↔ Database/Frontend

## 🛠️ Prerequisites

### System Requirements
- **Node.js**: v14.0.0 or higher (ES2020 support required)
- **npm**: Latest stable version
- **TypeScript**: v5.3.0 or higher
- **Git**: For version control

### External Dependencies
- **Veto API Server**: Running on `http://localhost:5254/api`
- **Frontend Application**: Running on `http://localhost:4200` (for generated URLs)

## 🚀 Installation & Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd veto-system/src/esports-veto/mcp
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Environment Configuration
Create environment variables or `.env` file:
```bash
export VETO_BASE_URL="http://localhost:5254/api"
# For HTTP transport mode (optional):
export MCP_TRANSPORT="http"          # "stdio" (default) or "http"
export MCP_PORT="3001"               # HTTP server port
export MCP_HOST="localhost"          # HTTP server host
export MCP_API_KEY="your-secret-key" # API key for authentication
export MCP_CORS_ORIGINS="http://localhost:3000,http://localhost:4200" # Allowed origins
```

### 4. Verify Backend Connectivity
```bash
# Test API token endpoint
curl http://localhost:5254/api/token

# Test veto creation
curl -X POST http://localhost:5254/api/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"mode":"M1V1","playerA":"Test","playerB":"Test","title":"Test"}'
```

## 🏗️ Development Workflow

### Available Scripts
```bash
npm run build      # Compile TypeScript to JavaScript
npm run dev        # Run in development mode with ts-node
npm start          # Run production build
npm test           # Run test suite
```

### Development Mode
```bash
npm run dev
```
- Uses `ts-node` for hot reloading
- Runs TypeScript directly without compilation
- Best for development and debugging

### Production Mode
```bash
npm run build
npm start
```
- Compiles to optimized JavaScript in `dist/`
- Runs compiled code for better performance

### Code Structure
```
src/
├── index.ts                 # Main MCP server entry point
├── services/
│   ├── VetoApiService.ts    # Backend API communication
│   └── MapsService.ts       # Map pool management
├── tools/
│   └── CreateVetoTool.ts    # Main veto creation tool
└── types/
    └── index.ts             # TypeScript type definitions
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Manual Testing
```bash
# Test MCP server directly
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run dev

# Test veto creation
echo '{
  "jsonrpc":"2.0",
  "id":1,
  "method":"tools/call",
  "params":{
    "name":"create_veto",
    "arguments":{"mode":"M1V1","playerA":"Test","playerB":"Test"}
  }
}' | npm run dev
```

### Integration Testing
Test with MCP clients like LM Studio or Claude Desktop using the configuration examples below.

## 📡 MCP Configuration

### LM Studio Setup
1. Open LM Studio → Program tab → Install → Edit mcp.json
2. Add the following configuration:
```json
{
  "mcpServers": {
    "veto-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": {
        "VETO_BASE_URL": "http://localhost:5254/api"
      }
    }
  }
}
```
3. Restart LM Studio

### Claude Desktop Setup
Create `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "veto-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": {
        "VETO_BASE_URL": "http://localhost:5254/api"
      }
    }
  }
}
```

### VS Code Setup
Add to `.vscode/settings.json`:
```json
{
  "mcp.servers": {
    "veto-mcp-server": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/absolute/path/to/project",
      "env": {
        "VETO_BASE_URL": "http://localhost:5254/api"
      }
    }
  }
}
```

## 🌐 HTTP Transport Configuration

For remote deployment or HTTP-based MCP clients, the server supports HTTP transport using Server-Sent Events (SSE) alongside the default stdio transport.

### Running in HTTP Mode

```bash
# Development
npm run dev:http

# Production
npm run build
npm run start:http
```

### HTTP Endpoints

- `GET /health` - Health check endpoint
- `GET /mcp/sse` - SSE connection establishment
- `POST /mcp/message?sessionId=<id>` - Message handling

### MCP Client HTTP Configuration

#### Claude Desktop (HTTP):
```json
{
  "mcpServers": {
    "veto-mcp-server": {
      "type": "streamableHttp",
      "url": "http://localhost:3001/mcp",
      "headers": {
        "Authorization": "Bearer your-api-key"
      }
    }
  }
}
```

#### VS Code (HTTP):
```json
{
  "mcp": {
    "servers": {
      "veto-mcp-server": {
        "type": "http",
        "url": "http://localhost:3001/mcp",
        "headers": {
          "CONTEXT7_API_KEY": "your-api-key"
        }
      }
    }
  }
}
```

#### Windsurf (HTTP):
```json
{
  "mcpServers": {
    "veto-mcp-server": {
      "serverUrl": "http://localhost:3001/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "your-api-key"
      }
    }
  }
}
```

## 🔧 API Reference

### Tool: create_veto

Creates one or more veto sessions for Starcraft 2 matches.

#### Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mode` | string | Yes | - | Game format: `M1V1`, `M2V2`, `M3V3`, `M4V4` |
| `bestOf` | string | No | `BO3` | Series format: `BO1`, `BO3`, `BO5`, `BO7`, `BO9` |
| `playerA` | string | No* | - | Player A name (max 25 chars) |
| `playerB` | string | No* | - | Player B name (max 25 chars) |
| `title` | string | No | `Match` | Match title (max 50 chars) |
| `vetoSystem` | string | No | `ABBA` | Ban/pick pattern: `ABBA`, `ABAB` |
| `count` | number | No | `1` | Number of identical veto sessions (1-5). Rarely used - for creating multiple copies of the same matchup |
| `matchups` | array | No* | - | Array of unique matchups (max 256). **Preferred for multiple different matchups** - creates separate veto sessions for each player pair in one efficient batch call |

*Either provide `playerA`/`playerB` OR `matchups` array

#### Matchup Object Structure
```typescript
{
  playerA: string,    // Player A name (max 25 chars)
  playerB: string,    // Player B name (max 25 chars)
  title?: string      // Optional match title (max 50 chars)
}
```

#### Response Format
```typescript
{
  success: boolean,              // Overall success status
  vetos: VetoResult[],          // Array of created veto sessions
  errors: {index: number, error: string}[]  // Errors by matchup index
}

interface VetoResult {
  vetoId: string;
  playerAId: string;
  playerBId: string;
  observerId: string;
  title: string;
  playerA: string;
  playerB: string;
  bestOf: string;
  mode: string;
  maps: string[];
  urls: {
    admin: string;
    playerA: { name: string; url: string };
    playerB: { name: string; url: string };
    observer: string;
  };
}
```

#### Usage Patterns

**For a single matchup:**
Use `playerA` and `playerB` parameters (simplest approach).

**For multiple different matchups (RECOMMENDED):**
Use the `matchups` array parameter. This creates separate veto sessions for each unique player pair in one efficient batch call, supporting up to 256 different matchups. Much more efficient than making individual API calls for each matchup.

#### Example Usage

**Single Match:**
```json
{
  "mode": "M1V1",
  "playerA": "Maru",
  "playerB": "Cure",
  "title": "Championship Finals"
}
```

**Tournament Bracket (Batch Creation - RECOMMENDED):**
```json
{
  "mode": "M1V1",
  "matchups": [
    {"playerA": "Player1", "playerB": "Player2", "title": "Quarterfinal 1"},
    {"playerA": "Player3", "playerB": "Player4", "title": "Quarterfinal 2"},
    {"playerA": "Player5", "playerB": "Player6", "title": "Quarterfinal 3"},
    {"playerA": "Player7", "playerB": "Player8", "title": "Quarterfinal 4"}
  ]
}
```
*Creates 4 unique veto sessions in one efficient batch call*
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors
**Cause**: Import path issues between dev and production
**Solution**: Ensure imports use relative paths without `.js` extensions
**Check**: Run `npm run build` to verify compilation

#### 2. Empty veto arrays in responses
**Cause**: Schema validation failing (missing required parameters)
**Solution**: Ensure either `playerA`/`playerB` OR `matchups` are provided
**Check**: Verify API backend is running on port 5254

#### 3. API connection failures
**Cause**: Veto API server not running or wrong URL
**Solution**: Check `VETO_BASE_URL` environment variable
**Test**: `curl http://localhost:5254/api/token`

#### 4. MCP client can't connect
**Cause**: Incorrect paths or permissions in config
**Solution**: Use absolute paths and verify file permissions
**Check**: Test server directly with `npm run dev`

#### 5. Token authentication errors
**Cause**: Invalid or expired API tokens
**Solution**: Tokens are auto-managed, check API server logs
**Debug**: Enable verbose logging in VetoApiService

### Debug Commands
```bash
# Check Node.js version
node --version

# Verify build
npm run build && ls -la dist/

# Test API connectivity
curl -v http://localhost:5254/api/token

# Test MCP server directly
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run dev

# Check environment variables
echo $VETO_BASE_URL
```

### Logs and Monitoring
- **MCP Server**: Outputs to stderr (visible in MCP client logs)
- **API Calls**: Check Veto API server logs
- **Token Management**: Automatic refresh every 25 minutes

## 📊 Performance Considerations

### Batch Processing
- **Limit**: Fixed at 5 parallel veto creations per batch
- **Reason**: Prevents API endpoint overload
- **Implementation**: Sequential batch processing in `CreateVetoTool.execute()`

### Memory Usage
- **Maps Data**: Loaded once per mode, cached in memory
- **Token Caching**: JWT tokens cached for 25 minutes
- **Concurrent Requests**: Limited by batch size

### Scalability
- **Max Matchups**: 256 per request
- **Rate Limiting**: Dependent on backend API limits
- **Resource Usage**: Minimal - primarily network I/O

## 🔒 Security Notes

### API Authentication
- JWT tokens auto-fetched and cached
- Bearer token authentication for API calls
- Token expiry handling (25-minute windows)

### Input Validation
- Zod schema validation for all inputs
- String length limits (25 chars for names, 50 for titles)
- Array size limits (256 max matchups)

### Data Sanitization
- Player names and titles validated
- No arbitrary code execution
- Safe JSON parsing and serialization

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
CMD ["node", "dist/index.js"]
```

### Environment Variables
```bash
VETO_BASE_URL=https://your-api-server.com/api
NODE_ENV=production
```

### Health Checks
```bash
# Test MCP server health
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | timeout 5 node dist/index.js

# Test API connectivity
curl -f http://localhost:5254/api/token || exit 1
```

## 📚 Additional Resources

### Related Files
- `README.md`: User-facing documentation
- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration

### External Links
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [LM Studio MCP Documentation](https://lmstudio.ai/docs/app/mcp)
- [Starcraft 2 Esports](https://starcraft2.blizzard.com/)

### Support
- Check API server logs for backend issues
- Verify network connectivity between MCP server and API
- Test with direct API calls to isolate issues

---

**Last Updated**: October 21, 2025
**Version**: 1.0.0
**Maintainer**: AI Agent