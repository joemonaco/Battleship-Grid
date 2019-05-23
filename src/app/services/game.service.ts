import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import { Tile } from "../models/tile";

@Injectable({
  providedIn: "root"
})
export class GameService {
  constructor(private socket: Socket) {}

  sendArray(enemyArr: Tile[]) {
    this.socket.emit("enemyShipTiles", enemyArr);
  }

  getEnemyArray(): Observable<any> {
    // console.log(this.socket.fromEvent<any>("message").pipe(map(data => data.msg)))
    // return this.socket.fromEvent<any>("message").pipe(map(data => data.msg));

    let observable = new Observable(observer => {
      this.socket.on("enemyShipTiles", data => {
        observer.next(data);
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
