import { Player } from "./player";

export interface Match {
    id: string;
    first: Double;
    second: Double;
    firstPoints?: number;
    secondPoints?: number;
    round: number;
}

export interface Double {
    player1: Player;
    player2: Player;
}