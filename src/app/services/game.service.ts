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

  userID;

  sendArray(enemyArr: Tile[]) {
    this.socket.emit("enemyShipTiles", enemyArr);
  }

  setID() {
    if (this.userID == "") {
      let observable = new Observable(observer => {
        this.socket.on("connected", id => {
          this.userID = id;
          observer.next(id);
          // console.log(this.userID);
        });
        return () => {
          this.socket.disconnect();
        };
      });

      this.userID = observable;
    }

    console.log(this.userID);
  }

  getEnemyArray(): Observable<any> {
    // console.log(this.socket.fromEvent<any>("message").pipe(map(data => data.msg)))
    // return this.socket.fromEvent<any>("message").pipe(map(data => data.msg));

    // let observable = new Observable(observer => {
    //   this.socket.on("enemyShipTiles", data => {
    //     observer.next(data);
    //   });
    //   return () => {
    //     this.socket.disconnect();
    //   };
    // });

    let observable = new Observable(observer => {
      this.socket.on("enemyShipTiles", (data: any) => {
        /** check if userID does NOT match then do the data for array */

        if (this.userID != data.id) {
          observer.next(data.enemyShips);
        }
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
