import { BestOf } from "./gamemodes.data";

export interface Constellation 
{
  bestOf: BestOf,
  playerA: string,
  playerB: string,  
  vetoSystem: string,
  gameid: string,
  mode: string,
  maps: string[]
}

export interface ConstellationResponse {
    playerAId: string,
    playerBId: string,
    observerId: string,
    vetoId: string,
    title: string,
    playerA: string,
    playerB: string,
    bestOf: string,
    mode: string,
    gameId: string
}

export interface VetoBaseDataResponse {  
    vetoId: string,
    title: string,
    playerA: string,
    playerB: string,
    bestOf: string,
    mode: string,
    gameId: string,
    maps: string[],
    vetoSystem: string
}


export interface JoinVetoResponse {
  vetoId: string,
  userId: string,
  userName: string
}

export interface VetoRound
{
  step: number;
  actionType: VETO_ACTION;
  playerName: string;  
}

export enum VETO_ACTION {
  VETO = 'VETO',
  PICK = 'PICK'
}

export enum ATTENDEE_TYPE {
  ADMIN = 'ADMIN',
  PLAYER = 'PLAYER',
  OBSERVER = 'OBSERVER'
}

