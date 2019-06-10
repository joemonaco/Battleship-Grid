import { Component, OnInit, OnDestroy } from "@angular/core";
import { Store } from "@ngrx/store";
import { GameState } from "../../state-management/reducers/battleship.reducer";

import * as BattleshipActions from "../../state-management/actions/battleship.actions";
import { GameService } from "src/app/services/game.service";
import { Router } from "@angular/router";

import { GameScreenComponent } from "../game-screen/game-screen.component";

@Component({
  selector: "app-game-over",
  templateUrl: "./game-over.component.html",
  styleUrls: ["./game-over.component.scss"]
})
export class GameOverComponent implements OnInit {
  constructor(
    private gameService: GameService,
    private store: Store<GameState>,
    private router: Router,
    private gameScreen: GameScreenComponent
  ) {}

  didWin = false;

  userID: String;
  ngOnInit() {
    console.log("this user id is", this.gameService.userID);
    this.userID = this.gameService.userID;

    this.gameService.getWinningID().subscribe(data => {
      if (this.userID == data) {
        this.didWin = true;
      }
    });

    setTimeout(() => {
      this.store.dispatch(new BattleshipActions.NotReady());
      this.router.navigate(["/main-menu"]);
    }, 10000);

    // if (this.gameService.userID == this.gameService.winningID) {
    //   console.log("true");
    //   this.didWin = true;
    // }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    // this.gameScreen.destroyEverything();
    this.gameService.resetGame();
  }
}
