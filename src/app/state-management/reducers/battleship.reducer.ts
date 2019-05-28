import * as BattleshipActions from "../actions/battleship.actions";
import { Action } from "@ngrx/store";
// import { Tutorial } from "../models/tutorial.model";
// import * as AC from "../app.component";

export interface GameState {
  //   readonly tutorial: Tutorial[];
  readonly curState: String;
}

const initialState: String = "NOT_READY";

export function reducer(
  state = initialState,
  action: BattleshipActions.Actions
) {
  switch (action.type) {
    case BattleshipActions.READY: {
      return BattleshipActions.READY;
    }
    case BattleshipActions.P1_TURN: {
      return BattleshipActions.P1_TURN;
    }
    case BattleshipActions.P2_TURN: {
      return BattleshipActions.P2_TURN;
    }
    case BattleshipActions.GAME_OVER: {
      return BattleshipActions.GAME_OVER;
    }
    default: {
      return state;
    }
  }
}
