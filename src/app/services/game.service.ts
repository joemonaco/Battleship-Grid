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

  // sendArray(enemyArr: Tile[]) {
  //   this.socket.emit("enemyShipTiles", enemyArr);
  // }

  resetGame() {
    this.socket.emit("reset");
  }

  getState() {
    let observable = new Observable(observer => {
      this.socket.on("state", (data) => {
        console.log("state", data);
        observer.next(data);
      });
    });
    return observable;
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

  checkReady(): Observable<any> {
    let observable = new Observable(observer => {
      this.socket.on("readyToStart", data => {
        console.log("readyToStart", data);
        observer.next(data);
      });
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

  // return () => {
  //   this.socket.disconnect();
  // // };
  // });

  // }
  // }

  // getEnemyArray(): Observable<any> {
  //   let observable = new Observable(observer => {
  //     this.socket.on("enemyShipTiles", (data: any) => {
  //       /** check if userID does NOT match then do the data for array */
  //       // if (this.userID != data.id) {
  //       observer.next(data.enemyShips);
  //       // }
  //     });
  //     return () => {
  //       this.socket.disconnect();
  //     };
  //   });

  //   return observable;
  // }
  close() {
    this.socket.disconnect();
  }
}
