import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Match } from '../models/match';
import { TournamentService } from '../services/tournament.service';

interface EditableMatch extends Match {
  isEditMode?: boolean;
}

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class MatchesComponent implements OnInit {

  public matches$: Observable<EditableMatch[]> = this.tournamentService.matches$.pipe(map((matches) => {
    matches.forEach((match:EditableMatch) => {
      match.isEditMode = !(match.firstPoints && match.secondPoints)
    });

    return matches;
  }));
  
  public displayedColumns: string[] = ['round', 'first', 'second', 'result', 'actions'];
  public expandedMatch?: EditableMatch;
  public points = new Array(this.tournamentService.maxPoints + 1);

  constructor(
    private tournamentService: TournamentService) { }

  ngOnInit(): void {
    
  }

  public calculateRandomMatches() {
    this.tournamentService.calculateRandomMatches();
  }

  public updateMatch(match: EditableMatch) {
    match.isEditMode = false;
    this.tournamentService.updateMatch(match);
  }

  public deleteMatch(matchId: string) {
    this.tournamentService.tryDeleteMatch(matchId);
  }
}
