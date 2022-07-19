import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { generateUUID } from '../common/uuid';
import { PlayerWithStats } from '../models/player';
import { TournamentService } from '../services/tournament.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss']
})
export class PlayersComponent implements OnInit {

  public players$: Observable<PlayerWithStats[]> = this.tournamentService.players$;
  public displayedColumns: string[] = ['isActive', 'name', 'matches', 'value'];

  public userForm: FormGroup;

  constructor(
    private tournamentService: TournamentService,
    private fb: FormBuilder) {
      this.userForm = this.fb.group({
        name: ['', Validators.required]
      });
  }

  ngOnInit(): void {


  }

  public addPlayer() {
    this.tournamentService.addPlayer({
      name: this.userForm.value.name
    });
    this.userForm.controls['name'].setValue('');
  }

  public togglePlayerState(playerName: string) {
    this.tournamentService.togglePlayerState(playerName);
  }
}
