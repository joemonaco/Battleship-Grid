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

  setID() {
    if (this.userID === "") {
      this.socket.on("connected", id => {
        this.userID = id;

        console.log("in connected", this.userID);
      });
      // return () => {
      //   this.socket.disconnect();
      // };
    }
    if (this.userID) {
      console.log("in set id", this.userID);
    }
  }

  getEnemyArray(): Observable<any> {
    let observable = new Observable(observer => {
      this.socket.on("enemyShipTiles", (data: any) => {
        /** check if userID does NOT match then do the data for array */
        // if (this.userID != data.id) {
        observer.next(data.enemyShips);
        // }
      });
      return () => {
        this.socket.disconnect();
      };
    });

    return observable;
  }

  close() {
    this.socket.disconnect();
  }
}
