import { GameModes } from "./gamemodes.data";

export interface Maps {
    game: string;
    mode: GameModes;
    name: string;
    link: string;
    image?: string;
}
