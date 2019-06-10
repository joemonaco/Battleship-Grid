import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { GameScreenComponent } from "../app/components/game-screen/game-screen.component";
import { LoadingComponent } from "../app/components/loading/loading.component";
import { MainMenuComponent } from "../app/components/main-menu/main-menu.component";
import { GameOverComponent } from "../app/components/game-over/game-over.component";
import { AppComponent } from "../app/app.component";
import { GameInProgressComponent } from "../app/components/game-in-progress/game-in-progress.component";

const routes: Routes = [
  {
    path: "game-screen",
    component: GameScreenComponent
  },
  {
    path: "game-over",
    component: GameOverComponent
  },
  {
    path: "main-menu",
    component: MainMenuComponent
  },
  {
    path: "loading",
    component: LoadingComponent
  },
  {
    path: "inProgress",
    component: GameInProgressComponent
  },
  {
    path: "",
    component: MainMenuComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
