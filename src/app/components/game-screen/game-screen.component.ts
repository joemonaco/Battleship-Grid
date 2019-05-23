import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit
} from "@angular/core";

import { Tile } from "../../models/tile";
import { DragulaService } from "ng2-dragula";

import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { GameState } from "../../state-management/reducers/battleship.reducer";

import * as BattleshipActions from "../../state-management/actions/battleship.actions";
import { GameService } from "src/app/services/game.service";

@Component({
  selector: "app-game-screen",
  templateUrl: "./game-screen.component.html",
  styleUrls: ["./game-screen.component.scss"]
})
export class GameScreenComponent implements AfterViewInit, OnInit {
  /** Template reference to the canvas element */
  @ViewChild("playerBoardEl") playerBoardEl: ElementRef;
  @ViewChild("enemyBoardEl") enemyBoardEl: ElementRef;

  /** Canvas 2d context */
  playerBoardContext: CanvasRenderingContext2D;
  enemyBoardContext: CanvasRenderingContext2D;

  //Tiles for Player Board, Players ships, Enemy Board
  playerBoardTiles: Tile[] = [];
  playerShipTiles: Tile[] = [];
  enemyBoardTiles: Tile[] = [];
  enemyShipsArr: Tile[] = [];

  //If the user has placed all ships
  allShipsPlaced = false;

  //For Hiding ships after they are placed, false means ship not placed
  // hideShip = [
  //   false,
  //   false,
  //   false,
  //   false,
  //   false,
  //   false,
  //   false,
  //   false,
  //   false,
  //   false
  // ];

  /** FOR TESTING ONLY */
  hideShip = [true, true, true, true, true, true, true, true, true, false];

  //Checking if user picked up a ship
  didSelectShip: boolean = false;

  //All for keeping track of the current selected ship
  curShipId = -1;
  curShipLen = 0;
  curShipVertical = true;

  //For keeping track of where the user has clicked on the enemy board
  enemyBoardRow: number = -1;
  enemyBoardCol: number = -1;
  enemySelected = false;

  //The current state of the game
  curState: Observable<String>;

  constructor(
    private dragulaService: DragulaService,
    private store: Store<GameState>,
    private gameService: GameService
  ) {
    //Creating the dragula group to make ships draggable
    dragulaService.createGroup("ship", {
      removeOnSpill: false,
      revertOnSpill: true,
      accepts: function(el, target) {
        return false;
      },
      invalid: function(el, handle) {
        if (
          el.id == "board" ||
          el.id == "rdyBtn" ||
          el.id == "enemyBoard" ||
          el.id == "fireBtn"
        ) {
          return true;
        }
        return false;
      }
    });
  }

  ngOnInit() {
    this.store.select("battleship").subscribe(state => {
      this.curState = state;
    });

    this.gameService.getEnemyArray().subscribe(arr => {
      this.enemyShipsArr = arr;
      console.log("enemyShipArr");
      console.log(this.enemyShipsArr);
    });
  }

  ngAfterViewInit() {
    this.playerBoardContext = (this.playerBoardEl
      .nativeElement as HTMLCanvasElement).getContext("2d");

    this.enemyBoardContext = (this.enemyBoardEl
      .nativeElement as HTMLCanvasElement).getContext("2d");

    this.drawGrid(true);

    console.log(this.playerBoardTiles);
  }

  /** Draws tiles on the grid for the player */
  drawGrid(isPlayerGrid: boolean) {
    let row = 0;
    let col = 0;

    //Makes the rows and columns
    for (let x = 0; x <= 400; x += 40) {
      row = 0;
      for (let y = 0; y <= 400; y += 40) {
        //Making the tiles for the player
        if (isPlayerGrid) {
          this.drawTilesOnGrid(this.playerBoardContext, x, y);
          this.createTile(x, y, row, col, isPlayerGrid);
        } else {
          this.drawTilesOnGrid(this.enemyBoardContext, x, y);
          this.createTile(x, y, row, col, isPlayerGrid);
        }
        row++;
      }
      col++;
    }
  }

  /** Helper for drawing tiles on grid */
  drawTilesOnGrid(context: CanvasRenderingContext2D, x, y) {
    context.moveTo(x, 0);
    context.lineTo(x, 400);
    context.stroke();
    context.moveTo(0, y);
    context.lineTo(400, y);
    context.stroke();
  }

  /** Helper for creating tile objects  */
  createTile(x, y, row, col, isPlayerBoard) {
    let tile = new Tile();
    tile.row = row;
    tile.col = col;
    tile.topX = x;
    tile.topY = y;
    tile.botX = x + 40;
    tile.botY = y + 40;
    tile.isHighlighted = false;

    if (isPlayerBoard) {
      this.playerBoardTiles.push(tile);
    } else {
      this.enemyBoardTiles.push(tile);
    }
  }

  //When user lets go of the ship ontop of the grid
  mouseDrop(e) {
    console.log(this.curShipLen);
    console.log(this.curShipVertical);

    //Makes sure that allShipsPlaced hasnt been clicked and that a ship is selected
    if (this.didSelectShip) {
      //Each tile is 40x40 so get the offset of canvas to give row and col of where mouse is
      let dropRow = Math.trunc(e.offsetY / 40);
      let dropCol = Math.trunc(e.offsetX / 40);

      //Find the tile on main board of where its dropped
      let tile = this.playerBoardTiles.find(
        selectedTile =>
          selectedTile.row == dropRow && selectedTile.col == dropCol
      );

      //Checks if ship is overlapping with others
      if (!this.isOverlapping(tile)) {
        console.log("isOverlapping false");
        this.dragulaService.find("ship").drake.cancel(true);
      } else {
        //Get index for playerBoardTiles array to be able to add to playerShipTiles later
        let firstTileIndex = this.playerBoardTiles.indexOf(tile);

        tile.isHighlighted = true;
        this.playerBoardContext.fillStyle = "blue";

        //If selected ship is vertical color tiles accordingly
        if (this.curShipVertical) {
          this.playerBoardContext.fillRect(
            tile.topX,
            tile.topY,
            40,
            40 * this.curShipLen
          );
          for (let i = 0; i < this.curShipLen; i++) {
            this.playerShipTiles.push(
              this.playerBoardTiles[firstTileIndex + i]
            );
            this.playerBoardTiles[firstTileIndex + i].isHighlighted = true;

            //Hides the ship from the view so cant be dragged again
            this.hideShip[this.curShipId] = true;
          }
        } else {
          this.playerBoardContext.fillRect(
            tile.topX,
            tile.topY,
            40 * this.curShipLen,
            40
          );

          //Use 11 because 10x10 grid and every 11 is a new column but same row
          let indexOffset = 11;
          this.playerShipTiles.push(this.playerBoardTiles[firstTileIndex]);
          this.playerBoardTiles[firstTileIndex].isHighlighted = true;
          for (let i = 0; i < this.curShipLen - 1; i++) {
            this.playerShipTiles.push(
              this.playerBoardTiles[firstTileIndex + indexOffset]
            );
            this.playerBoardTiles[
              firstTileIndex + indexOffset
            ].isHighlighted = true;
            indexOffset += 11;
            //Hides the ship from the view so cant be dragged again
            this.hideShip[this.curShipId] = true;
          }
        }

        //Checks if all the ships have been placed
        if (this.hideShip.indexOf(false) == -1) {
          this.allShipsPlaced = true;
        }

        this.playerBoardContext.stroke();
      }

      // }
    }
    // this.didDrop = false;
    this.didSelectShip = false;
  }

  /** Checks if the ship is overlapping */
  isOverlapping(tile: Tile): boolean {
    if (tile.isHighlighted) {
      return false;
    }
    let firstTileIndex = this.playerBoardTiles.indexOf(tile);

    if (this.curShipVertical) {
      for (let i = 0; i < this.curShipLen; i++) {
        //Checks to make sure that ship isnt going off the board
        if (this.playerBoardTiles[firstTileIndex + i].row > 9) {
          return false;
        }

        if (this.playerBoardTiles[firstTileIndex + i].isHighlighted) {
          return false;
        }
      }
    } else {
      let indexOffset = 11;
      for (let i = 0; i < this.curShipLen; i++) {
        if (this.playerBoardTiles[firstTileIndex + indexOffset].isHighlighted) {
          return false;
        }
        indexOffset += 11;
      }
    }
    return true;
  }

  /** When a ship is selected */
  shipClicked(event, shipLen, vert) {
    this.curShipLen = shipLen;
    this.curShipVertical = vert;
    this.didSelectShip = !this.didSelectShip;
    this.curShipId = event.target.id;
  }

  /** When user clicks ready */
  readyUp() {
    this.allShipsPlaced = true;
    console.log(this.playerShipTiles);
    this.drawGrid(false);
    // this.allShipsPlaced = false;

    this.store.dispatch(new BattleshipActions.GameReady());
    this.gameService.sendArray(this.playerShipTiles);
  }

  /** When the user selects a tile on the enemy board */
  enemyBoardClicked(e) {
    //Checks the previous tile selected if users picks new tile
    let tile = this.enemyBoardTiles.find(
      selectedTile =>
        selectedTile.row == this.enemyBoardRow &&
        selectedTile.col == this.enemyBoardCol
    );

    //If user chooses new tile make the old one white
    if (tile != null && !tile.isHighlighted) {
      this.enemyBoardContext.fillStyle = "white";
      this.enemyBoardContext.fillRect(tile.topX, tile.topY, 40, 40);
    }

    //Get the new tile clicked by user
    this.enemyBoardRow = Math.trunc(e.offsetY / 40);
    this.enemyBoardCol = Math.trunc(e.offsetX / 40);

    console.log(this.enemyBoardRow);
    console.log(this.enemyBoardCol);

    //Get the new tile clicked by user
    tile = this.enemyBoardTiles.find(
      selectedTile =>
        selectedTile.row == this.enemyBoardRow &&
        selectedTile.col == this.enemyBoardCol
    );

    //As long as the tile has not been fire before, make it yellow to show user they selected
    if (!tile.isHighlighted) {
      this.enemyBoardContext.fillStyle = "yellow";
      this.enemyBoardContext.fillRect(tile.topX, tile.topY, 40, 40);
      this.enemyBoardContext.stroke();
      //User has selected a spot; To make fire btn enabled
      this.enemySelected = true;
    }
  }

  /** When the user clicks the fire button after selecting a tile */
  fire() {
    if (this.enemySelected) {
      //Getting the tile on the enemy board to set it to higlighted
      let enemyTile = this.enemyBoardTiles.find(
        selectedTile =>
          selectedTile.row == this.enemyBoardRow &&
          selectedTile.col == this.enemyBoardCol
      );
      enemyTile.isHighlighted = true;

      //Checking the ships to see if it is a hit
      let shipTile = this.enemyShipsArr.find(
        selectedTile =>
          selectedTile.row == this.enemyBoardRow &&
          selectedTile.col == this.enemyBoardCol
      );

      //shipTile would be null if no ship was found
      if (shipTile != null) {
        this.enemyBoardContext.fillStyle = "red";
      } else {
        this.enemyBoardContext.fillStyle = "lightblue";
      }

      this.enemyBoardContext.fillRect(enemyTile.topX, enemyTile.topY, 40, 40);
      this.enemyBoardContext.stroke();
    }
    this.enemySelected = false;
  }
}
