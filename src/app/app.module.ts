import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { DragulaModule } from "ng2-dragula";
import { GameScreenComponent } from "./components/game-screen/game-screen.component";

import { StoreModule } from "@ngrx/store";
import { reducer } from "./state-management/reducers/battleship.reducer";

@NgModule({
  declarations: [AppComponent, GameScreenComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DragulaModule.forRoot(),
    StoreModule.forRoot({
      battleship: reducer
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
