import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { MapsService } from "../services/MapsService";

const GetMapsSchema = z.object({
  mode: z.enum(["M1V1", "M2V2", "M3V3", "M4V4"]),
  seasonOrDate: z.string().optional()
});

export class GetMapsTool {
  getToolDefinition(): Tool {
    return {
      name: "get_maps",
      description: "Retrieve the list of maps for a specific Starcraft 2 game mode. Optionally filter by season name or date (ISO format like '2025-01-15'). If no season/date is provided, returns maps from the latest season.",
      inputSchema: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: ["M1V1", "M2V2", "M3V3", "M4V4"],
            description: "Game format: M1V1 (1 player vs 1 player), M2V2 (2 players vs 2 players), M3V3 (3 vs 3), or M4V4 (4 vs 4 team matches)"
          },
          seasonOrDate: {
            type: "string",
            description: "Optional season name (e.g., '2025 Season 1') or date in ISO format (e.g., '2025-01-15') to filter maps. If omitted, uses the latest season."
          }
        },
        required: ["mode"]
      }
    };
  }

  async execute(input: z.infer<typeof GetMapsSchema>): Promise<{ maps: string[] }> {
    const validatedInput = GetMapsSchema.parse(input);
    const maps = await MapsService.getMapsForMode(validatedInput.mode, validatedInput.seasonOrDate);
    return { maps };
  }
}