import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { GameState } from "./state-management/reducers/battleship.reducer";

import * as BattleshipActions from "./state-management/actions/battleship.actions";
import { GameService } from "src/app/services/game.service";

import { trigger, transition, useAnimation } from '@angular/animations';
import { flash } from 'ng-animate';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  animations: [
    trigger('pulse', [transition('* => *', useAnimation(flash))])
  ]
})
export class AppComponent implements OnInit {

  pulse: any;

  //State of the game
  curState: String;

  gamePicked = false;
  singlePlayer: boolean;

  constructor(
    private gameService: GameService,
    private store: Store<GameState>
  ) {}

  ngOnInit(): void {
    this.store.select("battleship").subscribe(state => {
      this.curState = state;
    });
  }

  chooseMode(singlePlayer) {
    
    this.gamePicked = true;
    if (singlePlayer) {
      this.singlePlayer = true;
    } else {
      this.singlePlayer = false;
    }

    this.gameService.setGameMode(this.singlePlayer);
  }
}
