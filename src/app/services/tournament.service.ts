import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as _ from 'lodash';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { RandomNumberGenerator } from '../common/randomNumberGenerator';
import { generateUUID } from '../common/uuid';
import { Match } from '../models/match';
import { Player, PlayerWithStats } from '../models/player';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private readonly playersKey = 'to-players';
  private readonly matchesKey = 'to-matches';

  public maxPoints = 10;

  private playersSubject: BehaviorSubject<PlayerWithStats[]>;
  public players$: Observable<PlayerWithStats[]>;

  private matchSubject: BehaviorSubject<Match[]>;
  public matches$: Observable<Match[]>;

  private currentRound: number = 0;

  constructor(private snackBar: MatSnackBar) {
    let valuesFromLocalStorage = localStorage.getItem(this.playersKey);

    this.playersSubject = new BehaviorSubject(valuesFromLocalStorage ? this.getSortedPlayersList(JSON.parse(valuesFromLocalStorage)) : []);
    this.players$ = this.playersSubject.asObservable().pipe(tap((p) => this.updateStorage(p, this.playersKey)));

    valuesFromLocalStorage = localStorage.getItem(this.matchesKey);
    this.matchSubject = new BehaviorSubject(valuesFromLocalStorage ? JSON.parse(valuesFromLocalStorage) : []);
    this.matches$ = this.matchSubject.asObservable().pipe(tap((p) => this.updateStorage(p, this.matchesKey)));

    if (this.matchSubject.value.length > 0) {
      this.matchSubject.value.forEach((m) => {
        if (m.round > this.currentRound) {
          this.currentRound = m.round + 1;
        }
      })
    }
  }

  public addPlayer(player: Player) {
    if (this.playersSubject.value.filter(p => p.name == player.name).length === 0) {
      this.playersSubject?.next(this.getSortedPlayersList([
        ...this.playersSubject.value,
        {
          ...player,
          value: 0,
          isActive: true
        }
      ]));
    } else {
      this.snackBar.open('Spieler mit diesem Namen ist bereits vorhanden');
    }
  }

  public togglePlayerState(playerName: string) {
    const player = this.playersSubject.value.find(p => p.name == playerName);
    if (player) {
      this.playersSubject?.next(this.getSortedPlayersList([
        ...this.playersSubject.value.filter(p => p.name !== playerName),
        {
          ...player,
          isActive: !player.isActive
        }
      ]));
    }
  }

  public calculateRandomMatches() {
    const activePlayers = this.playersSubject.value.filter(p => p.isActive);
    if (activePlayers.length > 3) {
      const random = new RandomNumberGenerator(activePlayers.length);

      const newMatches: Match[] = [];
      
      let next = random.next();
      while(next != null) {
        const player1 = activePlayers[next];
        let player2: Player | null = null;
        let player3: Player | null = null;
        let player4: Player | null = null;

        next = random.next();
        if (next != null) {
          player2 = activePlayers[next];
        }

        next = random.next();
        if (next != null) {
          player3 = activePlayers[next];
        }

        next = random.next();
        if (next != null) {
          player4 = activePlayers[next];
        }

        if (player1 && player2 && player3 && player4) {
          if (newMatches.length == 0) {
            this.currentRound++;
          }

          newMatches.push({
            id: generateUUID(),
            first: {
              player1,
              player2
            },
            second: {
              player1 : player3,
              player2: player4
            },
            round: this.currentRound
          });
        }
      }

      this.matchSubject.next([
        ...this.matchSubject.value,
        ...newMatches
      ]);
    }
  }

  public updateFirst(matchId: string, value: number) {
    const match = this.matchSubject.value.find(m => m.id == matchId);
    if (match) {
      match.firstPoints = value;
      this.matchSubject.next([...this.matchSubject.value]);

      this.updateStats();
    }
  }

  public updateMatch(match: Match) {
    const existingMatch = this.matchSubject.value.find(m => m.id == match.id);
    if (existingMatch) {
      existingMatch.firstPoints = match.firstPoints;
      existingMatch.secondPoints = match.secondPoints;
      this.matchSubject.next([...this.matchSubject.value]);

      this.updateStats();
    }
  }

  public tryDeleteMatch(matchId: string) {
    const ref = this.snackBar.open('Bist du dir sicher? Mach keinen "blözin".', 'Ja', {
      duration: 3000
    });
    ref.onAction().subscribe(() => this.deleteMatch(matchId));
  }

  private deleteMatch(matchId: string) {
    this.matchSubject.next([
      ...this.matchSubject.value.filter(m => m.id !== matchId)
    ]);

    this.updateStats();
  }

  private getSortedPlayersList(players: PlayerWithStats[]) {
    // const sortedPlayers = _.sortBy(players, ["value", "name"], ['desc', 'asc']);
    // return sortedPlayers;
    players.sort((p1, p2) => {
      if (p1.value > p2.value) {
        return -1;
      } else if (p1.value < p2.value) { 
          return 1;
      }

      return p1.name.localeCompare(p2.name);
    });

    return players;
  }

  private updateStorage(value: any, key: string) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private updateStats() {
    const players = this.playersSubject.value;
    players.forEach((p) => p.value = 0);

    const matches = this.matchSubject.value;
    matches.forEach((m) => {
      if (!!m.firstPoints && !!m.secondPoints) {
        const player1 = players.find(p => p.name === m.first.player1.name);
        const player2 = players.find(p => p.name === m.first.player2.name);

        if (player1 && player2) {
          player1.value += m.firstPoints;
          player2.value += m.firstPoints;
        }

        const player3 = players.find(p => p.name === m.second.player1.name);
        const player4 = players.find(p => p.name === m.second.player2.name);

        if (player3 && player4) {
          player3.value += m.secondPoints;
          player4.value += m.secondPoints;
        }
      }
    });

    this.playersSubject.next(this.getSortedPlayersList(players));
  }
}
