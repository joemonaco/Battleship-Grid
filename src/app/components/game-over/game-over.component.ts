import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { GameState } from "../../state-management/reducers/battleship.reducer";

import * as BattleshipActions from "../../state-management/actions/battleship.actions";
import { GameService } from "src/app/services/game.service";

@Component({
  selector: "app-game-over",
  templateUrl: "./game-over.component.html",
  styleUrls: ["./game-over.component.scss"]
})
export class GameOverComponent implements OnInit {
  constructor(
    private gameService: GameService,
    private store: Store<GameState>
  ) {}

  didWin = false;
  ngOnInit() {
    if (this.gameService.didWin) {
      this.didWin = true;
    }
  }
}
