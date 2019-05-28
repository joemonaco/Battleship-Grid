import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import { Tile } from "../models/tile";

@Injectable({
  providedIn: "root"
})
export class GameService {
  constructor(private socket: Socket) {
    // console.log(socket.id);
  }

  userID: String = "";

  didWin = false;

  // sendArray(enemyArr: Tile[]) {
  //   this.socket.emit("enemyShipTiles", enemyArr);
  // }

  resetGame() {
    this.socket.emit("reset");
  }

  register(userID) {
    this.socket.emit("register", userID);
    this.userID = userID;
  }

  checkEnemyBoard(row, col) {
    this.socket.emit("checkBoard", { row: row, col: col, uuid: this.userID });
  }

  sendBoard(board: Tile[]) {
    this.socket.emit("board", { uuid: this.userID, board: board });
  }

  getPlayer(): Observable<any> {
    let observable = new Observable(observer => {
      this.socket.on("player", data => {
        console.log("player", data);
        observer.next(data);
      });
      return () => {};
    });
    return observable;
  }

  isWinner() {
    let observable = new Observable(observer => {
      this.socket.on("winner", playerID => {
        console.log("winner", playerID);
        if (this.userID == playerID) {
          this.didWin = true;
        }
        observer.next(playerID);
      });
      return () => {};
    });
    return observable;
  }

  checkReady(): Observable<any> {
    console.log("check ready");
    let observable = new Observable(observer => {
      this.socket.on("readyToStart", data => {
        console.log("readyToStart", data);
        observer.next(data);
      });
      return () => {};
    });
    return observable;
  }

  getTurn(): Observable<any> {
    console.log("check turn");
    let observable = new Observable(observer => {
      this.socket.on("turn", data => {
        console.log("turn", data);
        observer.next(data);
      });
      return () => {};
    });
    return observable;
  }

  getHit(): Observable<any> {
    let observable = new Observable(observer => {
      this.socket.on("hit", (data: any) => {
        console.log("didHit row", data.row);
        console.log("didHit col", data.col);
        console.log("didHit", data.hit);
        console.log("didHit UUID", data.uuid);
        // return { row: data.row, col: data.col, hit: data.hit, uuid: data.uuid };
        //If it was other players turn check if they hit or miss on your ship
        // if (data.uuid == this.userID) {
        // }
        observer.next(data);
      });
    });
    return observable;
  }

  close() {
    this.socket.disconnect();
  }
}
