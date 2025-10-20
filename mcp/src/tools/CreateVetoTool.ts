import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { VetoApiService } from "../services/VetoApiService";
import { MapsService } from "../services/MapsService";
import { CreateVetoInput, CreateVetoResponse, VetoResult } from "../types/index";

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
}).transform((data) => {
  // Default count to 1 when using playerA/playerB without count
  if (data.playerA && data.playerB && !data.matchups && data.count === undefined) {
    return { ...data, count: 1 };
  }
  return data;
});

export class CreateVetoTool {
  constructor(private apiService: VetoApiService) {}

  getToolDefinition(): Tool {
    return {
      name: "create_veto",
      description: "Create veto sessions for Starcraft 2 esports matches where players take turns banning/picking maps before the game starts. Supports both individual matches (provide playerA/playerB) and tournament brackets with up to 256 unique player matchups. When using playerA/playerB, count defaults to 1. Processes requests in batches of 5 to prevent API overload. Each veto session generates unique URLs for admin control, both players, and observers.",
      inputSchema: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: ["M1V1", "M2V2", "M3V3", "M4V4"],
            description: "Game format: M1V1 (1 player vs 1 player), M2V2 (2 players vs 2 players), M3V3 (3 vs 3), or M4V4 (4 vs 4 team matches)"
          },
          bestOf: {
            type: "string",
            enum: ["BO1", "BO3", "BO5", "BO7", "BO9"],
            description: "Series format meaning 'best of X games' - winner needs to win majority of games (BO3 = first to 2 wins, BO5 = first to 3 wins, etc.)",
            default: "BO3"
          },
          playerA: {
            type: "string",
            description: "Name of Team/Player A (max 25 characters). Use with playerB and count for creating multiple identical matches, or use matchups array for different opponents",
            maxLength: 25
          },
          playerB: {
            type: "string",
            description: "Name of Team/Player B (max 25 characters). Use with playerA and count for creating multiple identical matches, or use matchups array for different opponents",
            maxLength: 25
          },
          title: {
            type: "string",
            description: "Display title for the match/series (default: 'Match', max 50 characters). Used when not specified in individual matchups",
            default: "Match",
            maxLength: 50
          },
          vetoSystem: {
            type: "string",
            enum: ["ABBA", "ABAB"],
            description: "Map selection pattern: ABBA (PlayerA-B-PlayerB-A) or ABAB (PlayerA-B-A-B). Determines who bans/picks maps in which order",
            default: "ABBA"
          },
          count: {
            type: "number",
            description: "Number of identical veto sessions to create when using playerA/playerB (max 5, defaults to 1). Use matchups array for different opponents",
            minimum: 1,
            maximum: 5,
            default: 1
          },
          matchups: {
            type: "array",
            description: "Array of unique player matchups for tournament creation (max 256 matchups = 512 players). Each matchup creates a separate veto session. Ideal for brackets, round-robin tournaments, or multiple unique matches. Example: [{'playerA': 'Team Alpha', 'playerB': 'Team Beta', 'title': 'Finals'}]",
            items: {
              type: "object",
              properties: {
                playerA: {
                  type: "string",
                  description: "Name of first player/team in this specific matchup (max 25 characters)",
                  maxLength: 25
                },
                playerB: {
                  type: "string",
                  description: "Name of second player/team in this specific matchup (max 25 characters)",
                  maxLength: 25
                },
                title: {
                  type: "string",
                  description: "Optional custom title for this specific matchup (max 50 characters). Overrides the global title",
                  maxLength: 50
                }
              },
              required: ["playerA", "playerB"]
            },
            maxItems: 256
          }
        },
        required: ["mode"],
        oneOf: [
          {
            required: ["playerA", "playerB", "count"],
            not: { required: ["matchups"] }
          },
          {
            required: ["matchups"],
            not: { anyOf: [{ required: ["playerA"] }, { required: ["playerB"] }, { required: ["count"] }] }
          }
        ]
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
            title: result.Title || matchup.title,
            playerA: result.PlayerA || matchup.playerA,
            playerB: result.PlayerB || matchup.playerB,
            bestOf: result.BestOf || validatedInput.bestOf,
            mode: result.Mode || validatedInput.mode,
            maps: result.Maps || MapsService.getMapsForMode(validatedInput.mode),
            urls: {
              admin: `${baseUrl}/admin/${result.vetoId}`,
              playerA: {
                name: result.playerA || matchup.playerA,
                url: `${baseUrl}/veto/player/${result.playerAId}`
              },
              playerB: {
                name: result.playerB || matchup.playerB,
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