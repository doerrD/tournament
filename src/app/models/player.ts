export interface Player {
    name: string;
}

export interface PlayerWithStats extends Player {
    value: number;
    matches: number;
    isActive: boolean;
}