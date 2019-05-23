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

  sendArray(enemyArr: Tile[]) {
    this.socket.emit("enemyShipTiles", enemyArr);
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

  getHit(): any {
    // let observable = new Observable(observer => {
    this.socket.on("hit", (data: any) => {
      return data;
      //If it was other players turn check if they hit or miss on your ship
      if (data.uuid == this.userID) {
      }
      // observer.next(data.enemyShips);
      // }
    });
    // return () => {
    //   this.socket.disconnect();
    // // };
    // });
    // return observable;
    // }
  }

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
