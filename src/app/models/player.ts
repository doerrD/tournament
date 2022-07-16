export interface Player {
    name: string;
}

export interface PlayerWithStats extends Player {
    value: number;
    isActive: boolean;
}