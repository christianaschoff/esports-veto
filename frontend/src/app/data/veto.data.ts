import { Maps } from "./maps.data";

export enum VetoState {
    PLAYER_MISSING = 0,
    VETO_MISSING_A = 1,
    VETO_MISSING_B = 2,
    VETO_DONE = 3,
    VETO_UNSET = 4
}

export enum VetoStepType {
    Pick = 1,
    Ban = 2,
    Unset = 3
}

export interface VetoStep {
    playerId: string;
    map: string;
    stepType: VetoStepType;
}

export interface Veto {
    vetoState: VetoState;
    vetoSteps: VetoStep[];
}

export interface MapsStateOfPlay {
  id: number,
  map: Maps,
  state: VetoStepType,
  pickNo: number,
}

export interface MapsStateOfPlayObserver {  
  id: number,
  map: Maps,
  state: VetoStepType,
  pickNo: number,
  playerName: string
}