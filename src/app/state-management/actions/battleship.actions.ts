import { Injectable } from "@angular/core";
import { Action } from "@ngrx/store";

//Game is ready when both players click their ready button
export const READY = "READY";

export const P1_TURN = "P1_TURN";
export const P2_TURN = "P2_TURN";

//Game is over when all ships of one player are destroyed
export const GAME_OVER = "GAME_OVER";

export class GameReady implements Action {
  readonly type = READY;

  constructor() {}
}

export class Player1Turn implements Action {
  readonly type = P1_TURN;

  //payload here will be a tile coord
  constructor() {}
}

export class Player2Turn implements Action {
  readonly type = P2_TURN;

  //payload here will be a tile coord
  constructor() {}
}

export type Actions = GameReady | Player1Turn | Player2Turn;

// export type Actions = AddTutorial | RemoveTutorial;
