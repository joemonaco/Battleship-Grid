import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy
} from "@angular/core";

import { Tile } from "../../models/tile";
import { Ship } from "../../models/ship";
import { LinkedList } from "../../models/linkedList";
import { PrevShip } from "../../models/prevship";
import { DragulaService } from "ng2-dragula";

import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { GameState } from "../../state-management/reducers/battleship.reducer";

import * as BattleshipActions from "../../state-management/actions/battleship.actions";
import { GameService } from "src/app/services/game.service";
import * as $ from 'jquery';

import { trigger, transition, useAnimation } from '@angular/animations';
import { pulse, fadeIn } from 'ng-animate';

@Component({
  selector: "app-game-screen",
  templateUrl: "./game-screen.component.html",
  styleUrls: ["./game-screen.component.scss"],
  animations: [
    trigger('pulse', [transition(':enter', useAnimation(pulse))]),
    // trigger('fadeIn', [transition('', useAnimation(fadeIn))]),
  ]
})
export class GameScreenComponent implements AfterViewInit, OnInit {

  pulse: any;
  fadeIn: any;
  myDelay = 9999999;

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
  // enemyShipsArr: Tile[] = [];

  //If the user has placed all ships
  allShipsPlaced = false;

  player: any;

  winner = false;

  //If it is the current players turn
  isTurn = false;

  //Checks how many tiles are highlighted. 10 Ships with 30 tiles altogher
  enemyTilesHit = 0;

  //For Hiding ships after they are placed, false means ship not placed
  hideShip = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ];

  /** FOR TESTING ONLY */
  // hideShip = [true, true, true, true, true, true, true, true, true, false];

  allShips: Ship[] = [];
  prevShips: PrevShip[] = [];

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

  gameStarted = false;

  //The current state of the game
  curState: Observable<String>;

  availableShots: LinkedList = new LinkedList();

  readyClicked = false;

  targetCanvas: any;

  constructor(
    private dragulaService: DragulaService,
    private store: Store<GameState>,
    private gameService: GameService
  ) {
    //Creating the dragula group to make ships draggable
    

    // this.gameService.setID();
    // console.log(this.gameService.userID);
  }

  isReadySub: any;
  isWinnerSub: any;
  getPlayerSub: any;
  getTurnSub: any;
  getHitSub: any;
  updateBoardSub: any;

  AIshots: Tile[] = [];

  boardStyle = {};
  enemyBoardStyle = {};

  changeBoardStyle(player) {

    if(player == 0) {
    this.boardStyle = { 
    'background':'red',
    'color':'#fff',
    'animation-name': 'flash',
    'animation-duration': '2s',
    'animation-timing-function': 'linear',
    'animation-iteration-count': 'infinite'}
    }
    else {
      this.enemyBoardStyle = { 
        'background':'red',
        'color':'#fff',
        'animation-name': 'flash',
        'animation-duration': '2s',
        'animation-timing-function': 'linear',
        'animation-iteration-count': 'infinite'}
    }
  }

  ngOnInit() {
    this.createShips();
    // 
    
    
  

    // this.dragulaService.drag("ship")
    //   .subscribe(({ name, el, source }) => {
    //    document.getElementById(el.id)
    //   })

    this.dragulaService.createGroup("ship", {
      removeOnSpill: false,
      revertOnSpill: true,
      accepts: function(el, target) {
        // // console.log('TARGET', target);
        // this.canvasTarget = target;
        // console.log(this.canvasTarget)
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
      },
      
    })

      // this.dragulaService.drop("ship")
      // .subscribe(({ name, el, target, source, sibling }) => {
      //   console.log("TARGET: ");
      //   console.log(target);
      //   console.log("SOURCE: ");
      //   console.log(source);
      // })

    this.store.select("battleship").subscribe(state => {
      this.curState = state;
      if (state == "P2_TURN") {
        let randIndex = Math.floor(Math.random() * this.availableShots.length);
        console.log("randIndex", randIndex);
        let listElement = this.availableShots.remove(randIndex);

        let tile = this.playerBoardTiles.find(
          selectedTile =>
            selectedTile.row == listElement.row &&
            selectedTile.col == listElement.col
        );

        this.AIshots.push(tile);
        this.gameService.checkEnemyBoardAI(tile.row, tile.col);
      }
    });

    // console.log
    this.isReadySub = this.gameService.checkReady().subscribe(isReady => {
      console.log(isReady);
      if (isReady) {

        this.store.dispatch(new BattleshipActions.GameReady());
        this.gameStarted = true;
        this.myDelay = 2;
        if (this.player == 1) {
          this.isTurn = true;
        }
      }
    });

    this.isWinnerSub = this.gameService.isWinner().subscribe(player => {
      console.log(player, " is winner");
      this.winner = true;
      // if (player == this.player) {
      this.store.dispatch(new BattleshipActions.GameOver());

      // }
    });

    this.getPlayerSub = this.gameService.getPlayer().subscribe(data => {
      console.log("getting data to be player: ", data);
      this.player = data;
    });

    this.getTurnSub = this.gameService.getTurn().subscribe(turn => {
      // console.log(turn);
      if (turn == "P1_TURN") {
        this.store.dispatch(new BattleshipActions.Switching());
        this.store.dispatch(new BattleshipActions.Player1Turn());
        if (this.player == 1) {
          this.isTurn = true;
        } else {
          this.isTurn = false;
        }
      } else if (turn == "P2_TURN") {
        this.store.dispatch(new BattleshipActions.Switching());
        this.store.dispatch(new BattleshipActions.Player2Turn());
        if (this.player == 2) {
          this.isTurn = true;
        } else {
          this.isTurn = false;
        }
      }
    });

    this.getHitSub = this.gameService.getHit().subscribe(data => {
      if (data.uuid == this.gameService.userID) {
        // Getting the tile on the enemy board to set it to higlighted
        let enemyTile = this.enemyBoardTiles.find(
          selectedTile =>
            selectedTile.row == data.row && selectedTile.col == data.col
        );
        enemyTile.isHighlighted = true;

        if (data.hit) {
          console.log("hit true for player", data.uuid);
          this.enemyBoardContext.fillStyle = "#FA0E18";
          this.changeBoardStyle(1);
          setTimeout(() => {
            this.enemyBoardStyle = {};
          }, 1000);
        } else {
          console.log("hit false for player", data.uuid);
          this.enemyBoardContext.fillStyle = "lightgray";
        }

        this.enemyBoardContext.fillRect(enemyTile.topX, enemyTile.topY, 40, 40);
        this.enemyBoardContext.stroke();
      } else {
        if(data.hit) {
          this.changeBoardStyle(0);
          setTimeout(() => {
            this.boardStyle = {};
          }, 1000);
        }
      }
    });

    this.updateBoardSub = this.gameService
      .updatePlayerBoard()
      .subscribe(data => {
        if (data.uuid == this.gameService.userID) {
          console.log("update board");

          if (data.hit) {
            this.playerBoardContext.fillStyle = "#FA0E18";
          } else {
            this.playerBoardContext.fillStyle = "lightgray";
          }

          this.playerBoardContext.fillRect(data.topX, data.topY, 40, 40);
          this.playerBoardContext.stroke();
        }
      });

    this.gameService.register(this.getUUID());
  }

  createShips() {
    let ship0: Ship = {
      isVertical: true,
      width: 40,
      height: 160,
      isHidden: false,
      size: 4
    };

    let ship1: Ship = {
      isVertical: false,
      width: 160,
      height: 40,
      isHidden: false,
      size: 4
    };
    let ship2: Ship = {
      isVertical: true,
      width: 40,
      height: 120,
      isHidden: false,
      size: 3
    };
    let ship3: Ship = {
      isVertical: false,
      width: 120,
      height: 40,
      isHidden: false,
      size: 3
    };
    let ship4: Ship = {
      isVertical: true,
      width: 40,
      height: 120,
      isHidden: false,
      size: 3
    };
    let ship5: Ship = {
      isVertical: false,
      width: 80,
      height: 40,
      isHidden: false,
      size: 2
    };
    let ship6: Ship = {
      isVertical: true,
      width: 40,
      height: 80,
      isHidden: false,
      size: 2
    };
    let ship7: Ship = {
      isVertical: false,
      width: 80,
      height: 40,
      isHidden: false,
      size: 2
    };
    let ship8: Ship = {
      isVertical: true,
      width: 40,
      height: 80,
      isHidden: false,
      size: 2
    };
    let ship9: Ship = {
      isVertical: false,
      width: 200,
      height: 40,
      isHidden: false,
      size: 5
    };

    // this.allShips.push(ship0);

    this.allShips.push(ship0);
    this.allShips.push(ship1);
    this.allShips.push(ship2);
    this.allShips.push(ship3);
    this.allShips.push(ship4);
    this.allShips.push(ship5);
    this.allShips.push(ship6);
    this.allShips.push(ship7);
    this.allShips.push(ship8);
    this.allShips.push(ship9);
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.

    console.log("in destory");
    this.gameService.resetGame();

    this.isReadySub.unsubcribe();
    this.isWinnerSub.unsubcribe();
    this.getPlayerSub.unsubcribe();
    this.getTurnSub.unsubcribe();
    this.getHitSub.unsubcribe();
    this.updateBoardSub.unsubcribe();
  }

  reset() {
    this.gameService.resetGame();
    this.gameService.register(this.gameService.userID);
  }

  getUUID(): String {
    // console.log("in getUUID");
    length = 32;
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    // console.log(result);
    return result;
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
    for (let x = 0; x < 400; x += 40) {
      row = 0;
      for (let y = 0; y < 400; y += 40) {
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
    // this.playerBoardContext.strokeStyle = "white";
  }

  /** Helper for drawing tiles on grid */
  drawTilesOnGrid(context: CanvasRenderingContext2D, x, y) {
    context.moveTo(x, 0);
    context.lineTo(x, 400);
    context.stroke();
    context.moveTo(0, y);
    context.lineTo(400, y);
    // context.strokeStyle = "white";
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
    tile.isHit = false;
    tile.isMiss = false;
    tile.isHighlighted = false;

    if (isPlayerBoard) {
      this.playerBoardTiles.push(tile);
    } else {
      this.enemyBoardTiles.push(tile);
    }
  }

  prevShipRow;
  prevShipCol;
  prevShipIndex;
  // prevShipFirstIndex;

  undoLast() {
    if (this.prevShips.length != 0) {
      let prevShip = this.prevShips[this.prevShips.length - 1];

      //Find the tile on main board of where its dropped
      let tile = this.playerBoardTiles.find(
        selectedTile =>
          selectedTile.row == prevShip.row && selectedTile.col == prevShip.col
      );

      //Get index for playerBoardTiles array to be able to add to playerShipTiles later
      let firstTileIndex = this.playerBoardTiles.indexOf(tile);

      tile.isHighlighted = false;
      this.playerBoardContext.fillStyle = "white";

      //If selected ship is vertical color tiles accordingly
      if (this.allShips[prevShip.index].isVertical) {
        this.playerBoardContext.fillRect(
          tile.topX,
          tile.topY,
          40,
          40 * this.allShips[prevShip.index].size
        );
        for (let i = 0; i < this.allShips[prevShip.index].size; i++) {
          // this.playerShipTiles.push(
          //   this.playerBoardTiles[firstTileIndex + i]
          // );
          this.playerBoardTiles[firstTileIndex + i].isHighlighted = false;

          //Hides the ship from the view so cant be dragged again
          this.hideShip[prevShip.index] = false;
        }
      } else {
        this.playerBoardContext.fillRect(
          tile.topX,
          tile.topY,
          40 * this.allShips[prevShip.index].size,
          40
        );

        //Use 10 because 10x10 grid and every 10 is a new column but same row
        let indexOffset = 10;
        // this.playerShipTiles.push(this.playerBoardTiles[firstTileIndex]);
        this.playerBoardTiles[firstTileIndex].isHighlighted = false;
        for (let i = 0; i < this.allShips[prevShip.index].size - 1; i++) {
          // this.playerShipTiles.push(
          //   this.playerBoardTiles[firstTileIndex + indexOffset]
          // );
          this.playerBoardTiles[
            firstTileIndex + indexOffset
          ].isHighlighted = false;
          indexOffset += 10;
          //Hides the ship from the view so cant be dragged again
          this.hideShip[prevShip.index] = false;
        }
      }
      console.log("PREV SHIPS", this.prevShips);
      this.prevShips.pop();
      // this.playerBoardContext.strokeStyle = "white";
      this.playerBoardContext.stroke();
    }
  }

  touchEnd(e) {
    // console.log(e);

    let boundingRectBoard = document.getElementById('board').getBoundingClientRect();
    console.log(boundingRectBoard);

    if(this.shipXPos > boundingRectBoard.left && this.shipXPos < boundingRectBoard.right) {
      if(this.shipYPos > boundingRectBoard.top && this.shipYPos < boundingRectBoard.bottom) {
        let col = Math.trunc(this.shipXPos / 40);
        let row = Math.trunc((this.shipYPos - boundingRectBoard.top) / 40);
        this.mouseDrop(row, col);
      }
    }

  }

  shipXPos = -1;
  shipYPos = -1;


  touchMove(e) {
    //  console.log('PAGE X',Math.trunc(e.touches[0].pageX));
    //  console.log('PAGE Y', Math.trunc(e.touches[0].pageY));
    console.log('TOUCH');
     this.shipXPos = e.touches[0].pageX;
     this.shipYPos = e.touches[0].pageY;
    //  console.log(e);

    //  let board = document.getElementById('board');

     
  }

  //When user lets go of the ship ontop of the grid
  mouseDrop(dropRow, dropCol, e?) {


    // console.log(this.curShipLen);
    // console.log(this.curShipVertical);
    // console.log("player number is", this.player);
    // e.preventDefault();

    console.log("MOUSE DROP");
    // // console.log(target);

    // console.log(e);
    // // console.log(e.touches[0].pageX - e.touches[0].target.offsetLeft);
    // console.log(Math.trunc(e.clientX / 40));
    // console.log(Math.trunc(e.clientY / 40));


    //Makes sure that allShipsPlaced hasnt been clicked and that a ship is selected
    if (this.didSelectShip) {
      //Each tile is 40x40 so get the offset of canvas to give row and col of where mouse is
      if(dropRow == null) {
        dropRow = Math.trunc(e.offsetY / 40);
        dropCol = Math.trunc(e.offsetX / 40);
      }
      this.prevShipRow = dropRow;
      this.prevShipCol = dropCol;
      //Find the tile on main board of where its dropped
      let tile = this.playerBoardTiles.find(
        selectedTile =>
          selectedTile.row == dropRow && selectedTile.col == dropCol
      );

      //Checks if ship is overlapping with others
      if (!this.isOverlapping(tile)) {
        // console.log("isOverlapping false");
        this.dragulaService.find("ship").drake.cancel(true);
      } else {
        //Get index for playerBoardTiles array to be able to add to playerShipTiles later
        let firstTileIndex = this.playerBoardTiles.indexOf(tile);

        tile.isHighlighted = true;
        this.playerBoardContext.fillStyle = "rgb(85, 148, 173)";

        let prevShip: PrevShip = {
          row: dropRow,
          col: dropCol,
          index: this.curShipId
        };

        this.prevShips.push(prevShip);

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

          //Use 10 because 10x10 grid and every 10 is a new column but same row
          let indexOffset = 10;
          this.playerShipTiles.push(this.playerBoardTiles[firstTileIndex]);
          this.playerBoardTiles[firstTileIndex].isHighlighted = true;
          for (let i = 0; i < this.curShipLen - 1; i++) {
            this.playerShipTiles.push(
              this.playerBoardTiles[firstTileIndex + indexOffset]
            );
            this.playerBoardTiles[
              firstTileIndex + indexOffset
            ].isHighlighted = true;
            indexOffset += 10;
            //Hides the ship from the view so cant be dragged again
            this.hideShip[this.curShipId] = true;
          }
        }

        //Checks if all the ships have been placed
        if (this.hideShip.indexOf(false) == -1) {
          this.allShipsPlaced = true;
        }
        // this.playerBoardContext.strokeStyle = "white";
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
      let indexOffset = 10;
      for (let i = 1; i < this.curShipLen; i++) {
        console.log(
          "firstTileIndex + indexOffset",
          firstTileIndex + indexOffset
        );
        if (this.playerBoardTiles[firstTileIndex + indexOffset].isHighlighted) {
          return false;
        }
        indexOffset += 10;
      }
    }
    return true;
  }

  /** When a ship is selected */
  turnShip(event) {
    this.curShipId = event.target.id;
    let tempWidth = this.allShips[this.curShipId].width;
    this.allShips[this.curShipId].width = this.allShips[this.curShipId].height;
    this.allShips[this.curShipId].height = tempWidth;
    this.allShips[this.curShipId].isVertical = !this.allShips[this.curShipId]
      .isVertical;
  }

  shipClicked(event) 
  {
    console.log("ship clicked");
    // event.preventDefault();
    this.didSelectShip = !this.didSelectShip;
    this.curShipId = event.target.id;
    this.prevShipIndex = this.curShipId;

    this.curShipLen = this.allShips[this.curShipId].size;
    this.curShipVertical = this.allShips[this.curShipId].isVertical;
  }

  doSomething() {
    console.log("DRAGGING");
  }

  /** When user clicks ready */
  readyUp() {
    this.allShipsPlaced = true;
    // console.log(this.playerShipTiles);
    this.drawGrid(false);
    // this.allShipsPlaced = false;

    this.readyClicked = true;

    // this.gameService.sendArray(this.playerShipTiles);
    this.gameService.sendBoard(this.playerBoardTiles);

    if (this.gameService.singlePlayer) {
      this.createAIBoard();
    }

    console.log("PLAYER BOARD", this.playerBoardTiles);
  }

  /** When the user selects a tile on the enemy board */
  enemyBoardClicked(e) {
    // console.log("you are player", this.player);
    // console.log("thisTurn is: ", this.isTurn);

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

    // console.log(this.enemyBoardRow);
    // console.log(this.enemyBoardCol);

    //Get the new tile clicked by user
    tile = this.enemyBoardTiles.find(
      selectedTile =>
        selectedTile.row == this.enemyBoardRow &&
        selectedTile.col == this.enemyBoardCol
    );

    //As long as the tile has not been fire before, make it yellow to show user they selected
    if (!tile.isHighlighted) {
      this.enemyBoardContext.fillStyle = "#9BCB4C";
      this.enemyBoardContext.fillRect(tile.topX, tile.topY, 40, 40);
      this.enemyBoardContext.stroke();
      //User has selected a spot; To make fire btn enabled
      this.enemySelected = true;
    }
  }

  /** When the user clicks the fire button after selecting a tile */
  fire() {
    if (this.enemySelected) {
      //Check if it is a hit here and then update UI accordingly
      this.gameService.checkEnemyBoard(this.enemyBoardRow, this.enemyBoardCol);

      this.enemySelected = false;
    }
  }

  AIboard: Tile[] = [];
  AIshipTiles: Tile[] = [];

  createAIBoard() {
    const boardSizes = [5, 4, 4, 3, 3, 3, 2, 2, 2, 2];
    // const boardSizes = [5];

    let row = 0;
    let col = 0;
    //Makes the rows and columns
    for (let x = 0; x < 400; x += 40) {
      row = 0;
      for (let y = 0; y < 400; y += 40) {
        //Making the tiles for the player
        let tile = new Tile();
        tile.row = row;
        tile.col = col;
        tile.topX = x;
        tile.topY = y;
        tile.botX = x + 40;
        tile.botY = y + 40;
        tile.isHit = false;
        tile.isMiss = false;
        tile.isHighlighted = false;
        this.availableShots.append({ row: row, col: col });
        this.AIboard.push(tile);
        row++;
      }
      col++;
    }

    console.log("AI BOARd", this.AIboard);

    let AIrows: number[] = [];
    let AIcols: number[] = [];

    boardSizes.forEach(size => {
      let randRow = -1;
      let randCol = -1;

      while (!this.checkAIboard(randRow, randCol, size)) {
        randRow = Math.floor(Math.random() * 9);
        randCol = Math.floor(Math.random() * 9);
      }

      console.log("ADDING SHIP: ", size);
    });

    console.log("AI BOARd", this.AIboard);
    console.log("AI SHIPS", this.AIshipTiles);

    this.gameService.sendAIboard(this.AIboard);
    this.AIboard = [];
    this.AIshipTiles = [];
  }

  checkAIboard(row, col, size): boolean {
    if (row != -1) {
      let tile = this.AIboard.find(
        selectedTile => selectedTile.row == row && selectedTile.col == col
      );

      if (tile.isHighlighted) {
        return false;
      } else {
        let firstTileIndex = this.AIboard.indexOf(tile);
        let vert = Math.round(Math.random());
        console.log("vert is", vert);
        if (vert == 0) {
          for (let i = 0; i < size; i++) {
            //Checks to make sure that ship isnt going off the board
            if (this.AIboard[firstTileIndex + i].row > 9) {
              return false;
            }

            if (this.AIboard[firstTileIndex + i].isHighlighted) {
              return false;
            }
          }
        } else {
          let indexOffset = 10;
          for (let i = 0; i < size; i++) {
            if (row + size > 9 || col + size > 9) {
              return false;
            }
            console.log(
              "firstTileIndex + indexOffset",
              this.AIboard[firstTileIndex + indexOffset]
            );

            if (this.AIboard[firstTileIndex + indexOffset].isHighlighted) {
              return false;
            }
            indexOffset += 10;
          }
        }

        //If selected ship is vertical color tiles accordingly
        if (vert == 0) {
          for (let i = 0; i < size; i++) {
            // this.AIboard.push(
            //   this.AIboard[firstTileIndex + i]
            // );
            this.AIboard[firstTileIndex + i].isHighlighted = true;
            this.AIshipTiles.push(this.AIboard[firstTileIndex + i]);
          }
        } else {
          //Use 10 because 10x10 grid and every 10 is a new column but same row
          let indexOffset = 10;

          this.AIboard[firstTileIndex].isHighlighted = true;
          this.AIshipTiles.push(this.AIboard[firstTileIndex]);
          for (let i = 0; i < size - 1; i++) {
            this.AIshipTiles.push(this.AIboard[firstTileIndex + indexOffset]);
            this.AIboard[firstTileIndex + indexOffset].isHighlighted = true;
            indexOffset += 10;
            //Hides the ship from the view so cant be dragged again
          }
        }
        return true;
      }
    }
    return false;
  }
}
