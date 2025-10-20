import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { VetoApiService } from "./services/VetoApiService.js";
import { CreateVetoTool } from "./tools/CreateVetoTool.js";

// Use dev environment for testing
const BASE_URL = process.env.VETO_BASE_URL || "http://localhost:5254/api";

const server = new Server({
  name: "veto-mcp-server",
  version: "1.0.0",
});

const apiService = new VetoApiService(BASE_URL);
const createVetoTool = new CreateVetoTool(apiService);

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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Veto MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});