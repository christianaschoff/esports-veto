import { BestOf, GameModes } from "./gamemodes.data";

export interface GameData {
    id: string;
    name: string;
    description: string;
    image?: string;
    gameModes: GameModes[]
    bestOf: BestOf[]
}
