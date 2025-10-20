export interface CreateVetoInput {
  mode: "M1V1" | "M2V2" | "M3V3" | "M4V4";
  bestOf?: "BO1" | "BO3" | "BO5" | "BO7" | "BO9";
  playerA?: string;
  playerB?: string;
  title?: string;
  vetoSystem?: "ABBA" | "ABAB";
  count?: number;
}

export interface VetoResult {
  vetoId: string;
  playerAId: string;
  playerBId: string;
  observerId: string;
  title: string;
  playerA: string;
  playerB: string;
  bestOf: string;
  mode: string;
  maps: string[];
  urls: {
    admin: string;
    playerA: {
      name: string;
      url: string;
    };
    playerB: {
      name: string;
      url: string;
    };
    observer: string;
  };
}

export interface CreateVetoResponse {
  success: boolean;
  vetos: VetoResult[];
  errors: Array<{ index: number; error: string }>;
}