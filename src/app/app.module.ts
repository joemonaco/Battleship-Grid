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

const config: SocketIoConfig = {
  url: "192.168.1.14:8000",
  options: {}
};

@NgModule({
  declarations: [AppComponent, GameScreenComponent],
  imports: [
    BrowserModule,
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

/**

const express = require("express");
const path = require("path");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const port = 8000;

app.use(express.static(path.join("192.168.1.14:8000")));

players = [];
player1Board = [];
player2Board = [];

// usersInGame = [false, false];

io.on("connection", socket => {
  // player1Board = [];
  // player2Board = [];

  console.log("new connection made:" + String(socket.id));

  socket.on("reset", () => {
    player1Board = [];
    player2Board = [];
    players = [];
    console.log("in reset");
  });

  socket.on("register", userID => {
    players.push(userID);
    console.log(userID);
  });

  // socket.emit("drop-ball", { type: "red", name: name });

  // socket.on("enemyShipTiles", enemyArray => {
  //   // console.log(enemyArray);
  //   ships = enemyArray;

  //   // console.log("came from", socket.id);
  //   io.emit("enemyShipTiles", { enemyShips: enemyArray, id: socket.id });
  // });

  socket.on("board", data => {
    if (players[0] == data.uuid) {
      player1Board = [];
      player1Board = data.board;
      console.log("player1Board", player1Board);
    } else {
      player2Board = [];
      player2Board = data.board;
      console.log("player2Board", player2Board);
    }
  });

  socket.on("checkBoard", data => {
    console.log(data.row);
    console.log(data.col);
    console.log("uuid is", data.uuid);

    if (players[0] == data.uuid) {
      let tile = player2Board.find(
        selectedTile =>
          selectedTile.row == data.row && selectedTile.col == data.col
      );

      console.log("player 2", tile);

      let index = player2Board.indexOf(tile);
      if (tile.isHighlighted) {
        // socket.emit()
        player2Board[index].isHit = true;
        socket.emit("hit", {
          row: data.row,
          col: data.col,
          uuid: players[1],
          hit: true
        });
      } else {
        player2Board[index].isMiss = true;
        socket.emit("hit", {
          row: data.row,
          col: data.col,
          uuid: players[1],
          hit: false
        });
      }

      console.log("player2Board", player2Board[index]);
    } else {
      let tile = player1Board.find(
        selectedTile =>
          selectedTile.row == data.row && selectedTile.col == data.col
      );

      console.log("player1", tile);

      let index = player1Board.indexOf(tile);

      if (tile.isHighlighted) {
        player1Board[index].isHit = true;
        socket.emit("hit", {
          row: data.row,
          col: data.col,
          uuid: players[0],
          hit: true
        });
      } else {
        player1Board[index].isMiss = true;
        socket.emit("hit", {
          row: data.row,
          col: data.col,
          uuid: players[0],
          hit: false
        });
      }

      console.log("player1Board", player1Board[index]);
    }
  });
});

server.listen(port, () => {
  console.log("Listening on port" + port);
});
 */
