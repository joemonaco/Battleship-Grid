import { Component, OnInit } from "@angular/core";
import { GameService } from "src/app/services/game.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-main-menu",
  templateUrl: "./main-menu.component.html",
  styleUrls: ["./main-menu.component.scss"]
})
export class MainMenuComponent implements OnInit {
  gamePicked = false;
  singlePlayer: boolean;

  constructor(private gameService: GameService, private router: Router) {}

  ngOnInit() {}

  chooseMode(singlePlayer) {
    this.gamePicked = true;
    if (singlePlayer) {
      this.singlePlayer = true;
    } else {
      this.singlePlayer = false;
    }

    this.gameService.setGameMode(this.singlePlayer);
    this.router.navigate(["/game-screen"]);
  }
}
