import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { DragulaModule } from "ng2-dragula";
import { GameScreenComponent } from "./components/game-screen/game-screen.component";

import { StoreModule } from "@ngrx/store";
import { reducer } from "./state-management/reducers/battleship.reducer";

import { SocketIoModule, SocketIoConfig } from "ngx-socket-io";
import { GameService } from "src/app/services/game.service";
import { GameOverComponent } from "./components/game-over/game-over.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const config: SocketIoConfig = { url: "http://174.138.111.227:8000", options: {} };
// const config: SocketIoConfig = { url: localStorage.getItem('socket_address') , options: {} };

@NgModule({
  declarations: [AppComponent, GameScreenComponent, GameOverComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    DragulaModule.forRoot(),
    StoreModule.forRoot({
      battleship: reducer
    }),
    SocketIoModule.forRoot(config)
  ],
  providers: [GameService],
  bootstrap: [AppComponent]
})
export class AppModule {}
