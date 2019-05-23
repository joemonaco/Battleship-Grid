import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { DragulaModule } from "ng2-dragula";
import { GameScreenComponent } from "./components/game-screen/game-screen.component";

@NgModule({
  declarations: [AppComponent, GameScreenComponent],
  imports: [BrowserModule, AppRoutingModule, DragulaModule.forRoot()],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
