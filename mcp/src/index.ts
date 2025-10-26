import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { VetoApiService } from "./services/VetoApiService";
import { CreateVetoTool } from "./tools/CreateVetoTool";
import { HttpTransport } from "./transports/HttpTransport";

// Use dev environment for testing
const BASE_URL = process.env.VETO_BASE_URL || "http://localhost:5254/api";

const server = new Server({
  name: "veto-mcp-server",
  version: "1.0.0",
});

const apiService = new VetoApiService(BASE_URL);
const createVetoTool = new CreateVetoTool(apiService);

async function main() {
  // Detect transport mode from environment variables or command line args
  const transportMode = process.env.MCP_TRANSPORT || process.argv[2] || 'stdio';
  const port = parseInt(process.env.MCP_PORT || '3001');
  const host = process.env.MCP_HOST || 'localhost';
  const apiKey = process.env.MCP_API_KEY;

  if (transportMode === 'http') {
    // HTTP transport mode
    const httpTransport = new HttpTransport({
      port,
      host,
      apiKey,
      corsOrigins: process.env.MCP_CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:4200']
    });

    // Register MCP handlers
    httpTransport.registerHandlers(
      async () => {
        return {
          tools: [createVetoTool.getToolDefinition()],
        };
      },
      async (request) => {
        const { name, arguments: args } = request.params;

        if (name === "create_veto") {
          try {
            const result = await createVetoTool.execute(args as any);
            return {
              content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
              isError: true,
            };
          }
        }

        throw new Error(`Unknown tool: ${name}`);
      }
    );

    await httpTransport.start();
  } else {
    // Default stdio transport mode - set up handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [createVetoTool.getToolDefinition()],
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === "create_veto") {
        try {
          const result = await createVetoTool.execute(args as any);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error) {
          return {
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          };
        }
      }

      throw new Error(`Unknown tool: ${name}`);
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Veto MCP server running on stdio");
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});