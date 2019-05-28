import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { GameState } from "./state-management/reducers/battleship.reducer";

import * as BattleshipActions from "./state-management/actions/battleship.actions";
import { GameService } from "src/app/services/game.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  //State of the game
  curState: String;

  constructor(
    private gameService: GameService,
    private store: Store<GameState>
  ) {}

  ngOnInit(): void {
    this.store.select("battleship").subscribe(state => {
      this.curState = state;
    });
  }
}
