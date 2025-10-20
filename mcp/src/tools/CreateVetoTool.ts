import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { VetoApiService } from "../services/VetoApiService.js";
import { MapsService } from "../services/MapsService.js";
import { CreateVetoInput, CreateVetoResponse, VetoResult } from "../types/index.js";

const MatchupSchema = z.object({
  playerA: z.string().max(25),
  playerB: z.string().max(25),
  title: z.string().max(50).optional()
});

const CreateVetoSchema = z.object({
  mode: z.enum(["M1V1", "M2V2", "M3V3", "M4V4"]),
  bestOf: z.enum(["BO1", "BO3", "BO5", "BO7", "BO9"]).optional().default("BO3"),
  playerA: z.string().max(25).optional(),
  playerB: z.string().max(25).optional(),
  title: z.string().max(50).optional().default("Match"),
  vetoSystem: z.enum(["ABBA", "ABAB"]).optional().default("ABBA"),
  count: z.number().min(1).max(5).optional(),
  matchups: z.array(MatchupSchema).max(256).optional()
}).refine((data) => {
  // Either matchups OR (playerA and playerB) must be provided
  const hasMatchups = data.matchups && data.matchups.length > 0;
  const hasPlayers = data.playerA && data.playerB;
  return hasMatchups || hasPlayers;
}, {
  message: "Either 'matchups' array or 'playerA' and 'playerB' must be provided"
}).refine((data) => {
  // If using old format, count is required
  if (!data.matchups && (!data.playerA || !data.playerB)) {
    return data.count !== undefined;
  }
  return true;
}, {
  message: "When using playerA/playerB, 'count' is required"
});

export class CreateVetoTool {
  constructor(private apiService: VetoApiService) {}

  getToolDefinition(): Tool {
    return {
      name: "create_veto",
      description: "Create one or more veto sessions for Starcraft 2 matches. Supports both individual veto creation and batch creation with matchups.",
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
            description: "Player A name (max 25 chars) - use with playerB and count for simple creation",
            maxLength: 25
          },
          playerB: {
            type: "string",
            description: "Player B name (max 25 chars) - use with playerA and count for simple creation",
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
            description: "Number of vetos to create when using playerA/playerB (max: 5)",
            minimum: 1,
            maximum: 5
          },
          matchups: {
            type: "array",
            description: "Array of matchups for batch creation (max 256 matchups). Each matchup should have playerA, playerB, and optional title.",
            items: {
              type: "object",
              properties: {
                playerA: {
                  type: "string",
                  description: "Player A name (max 25 chars)",
                  maxLength: 25
                },
                playerB: {
                  type: "string",
                  description: "Player B name (max 25 chars)",
                  maxLength: 25
                },
                title: {
                  type: "string",
                  description: "Optional match title (max 50 chars)",
                  maxLength: 50
                }
              },
              required: ["playerA", "playerB"]
            },
            maxItems: 256
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

    // Determine matchups to create
    let matchupsToCreate: Array<{ playerA: string; playerB: string; title?: string; index: number }> = [];

    if (validatedInput.matchups && validatedInput.matchups.length > 0) {
      // Use provided matchups
      matchupsToCreate = validatedInput.matchups.map((matchup, index) => ({
        playerA: matchup.playerA,
        playerB: matchup.playerB,
        title: matchup.title || validatedInput.title || "Match",
        index
      }));
    } else if (validatedInput.playerA && validatedInput.playerB && validatedInput.count) {
      // Use old format with count
      matchupsToCreate = Array.from({ length: validatedInput.count }, (_, index) => ({
        playerA: validatedInput.playerA!,
        playerB: validatedInput.playerB!,
        title: validatedInput.title || "Match",
        index
      }));
    }

    // Process in batches of 5 to prevent overwhelming the endpoint
    const batchSize = 5;
    for (let i = 0; i < matchupsToCreate.length; i += batchSize) {
      const batch = matchupsToCreate.slice(i, i + batchSize);

      const batchPromises = batch.map(async (matchup) => {
        try {
          const vetoData = {
            bestOf: validatedInput.bestOf,
            playerA: matchup.playerA,
            playerB: matchup.playerB,
            title: matchup.title,
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
          errors.push({
            index: matchup.index,
            error: error instanceof Error ? error.message : String(error)
          });
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const successfulBatchVetos = batchResults.filter((r): r is VetoResult => r !== null);
      vetos.push(...successfulBatchVetos);
    }

    return {
      success: errors.length === 0,
      vetos: vetos,
      errors: errors
    };
  }
}