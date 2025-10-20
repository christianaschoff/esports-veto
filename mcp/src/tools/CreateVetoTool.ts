import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { VetoApiService } from "../services/VetoApiService.js";
import { MapsService } from "../services/MapsService.js";
import { CreateVetoInput, CreateVetoResponse, VetoResult } from "../types/index.js";

const CreateVetoSchema = z.object({
  mode: z.enum(["M1V1", "M2V2", "M3V3", "M4V4"]),
  bestOf: z.enum(["BO1", "BO3", "BO5", "BO7", "BO9"]).optional().default("BO3"),
  playerA: z.string().max(25).optional().default("Player1"),
  playerB: z.string().max(25).optional().default("Player2"),
  title: z.string().max(50).optional().default("Match"),
  vetoSystem: z.enum(["ABBA", "ABAB"]).optional().default("ABBA"),
  count: z.number().min(1).max(5).optional().default(1)
});

export class CreateVetoTool {
  constructor(private apiService: VetoApiService) {}

  getToolDefinition(): Tool {
    return {
      name: "create_veto",
      description: "Create one or more veto sessions for Starcraft 2 matches",
      inputSchema: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: ["M1V1", "M2V2", "M3V3", "M4V4"],
            description: "Game mode: M1V1, M2V2, M3V3, or M4V4"
          },
          bestOf: {
            type: "string",
            enum: ["BO1", "BO3", "BO5", "BO7", "BO9"],
            description: "Best of format: BO1, BO3, BO5, BO7, or BO9 (default: BO3)",
            default: "BO3"
          },
          playerA: {
            type: "string",
            description: "Player A name (default: Player1, max 25 chars)",
            default: "Player1",
            maxLength: 25
          },
          playerB: {
            type: "string",
            description: "Player B name (default: Player2, max 25 chars)",
            default: "Player2",
            maxLength: 25
          },
          title: {
            type: "string",
            description: "Match title (default: Match, max 50 chars)",
            default: "Match",
            maxLength: 50
          },
          vetoSystem: {
            type: "string",
            enum: ["ABBA", "ABAB"],
            description: "Veto system: ABBA or ABAB (default: ABBA)",
            default: "ABBA"
          },
          count: {
            type: "number",
            description: "Number of vetos to create (default: 1, max: 5)",
            default: 1,
            minimum: 1,
            maximum: 5
          }
        },
        required: ["mode"]
      }
    };
  }

  async execute(input: CreateVetoInput): Promise<CreateVetoResponse> {
    const validatedInput = CreateVetoSchema.parse(input);
    const maps = MapsService.getMapsForMode(validatedInput.mode);

    if (maps.length === 0) {
      throw new Error(`No maps found for mode: ${validatedInput.mode}`);
    }

    const vetos: VetoResult[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    // Create vetos (up to 5 simultaneously)
    const promises = Array.from({ length: validatedInput.count }, async (_, index) => {
      try {
        const vetoData = {
          bestOf: validatedInput.bestOf,
          playerA: validatedInput.playerA,
          playerB: validatedInput.playerB,
          title: validatedInput.title,
          vetoSystem: validatedInput.vetoSystem,
          gameId: "starcraft2",
          mode: validatedInput.mode,
          maps: maps
        };

        const result = await this.apiService.createVeto(vetoData);

        const baseUrl = this.apiService.baseUrl.replace('/api', '').replace('5254', '4200');

        return {
          vetoId: result.vetoId,
          playerAId: result.playerAId,
          playerBId: result.playerBId,
          observerId: result.observerId,
          title: result.Title,
          playerA: result.PlayerA,
          playerB: result.PlayerB,
          bestOf: result.BestOf,
          mode: result.Mode,
          maps: result.Maps,
          urls: {
            admin: `${baseUrl}/admin/${result.vetoId}`,
            playerA: {
              name: result.playerA,
              url: `${baseUrl}/veto/player/${result.playerAId}`
            },
            playerB: {
              name: result.playerB,
              url: `${baseUrl}/veto/player/${result.playerBId}`
            },
            observer: `${baseUrl}/observe/${result.observerId}`
          }
        };
      } catch (error) {
        errors.push({ index, error: error instanceof Error ? error.message : String(error) });
        return null;
      }
    });

    const results = await Promise.all(promises);
    const successfulVetos = results.filter((r): r is VetoResult => r !== null);

    return {
      success: errors.length === 0,
      vetos: successfulVetos,
      errors: errors
    };
  }
}