import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit
} from "@angular/core";
import { Tile } from "../app/tile";
import { DragulaService } from "ng2-dragula";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements AfterViewInit, OnInit {
  /** Template reference to the canvas element */
  @ViewChild("canvasEl") canvasEl: ElementRef;
  @ViewChild("enemyEl") enemyEl: ElementRef;

  /** Canvas 2d context */
  context: CanvasRenderingContext2D;
  enemyContext: CanvasRenderingContext2D;

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

  curShipId = -1;

  canDrop = false;

  constructor(private dragulaService: DragulaService) {
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
        return false; // don't prevent any drags from initiating by default
      }
    });

    // dragulaService.find("ship").drake.on("drop", (el, target) => {
    //   console.log("target", target);
    //   console.log("element", el);
    // });
    // this.dragulaService.
  }

  ngOnInit(): void {}

  mainTiles: Tile[] = [];
  shipTiles: Tile[] = [];
  enemyTiles: Tile[] = [];
  // enemyTilesSelected: Tile[] = [];

  didDrop: boolean = false;
  curShipLen = 0;
  curShipVertical = true;

  ready = false;

  didSelect: boolean = false;

  ngAfterViewInit() {
    this.context = (this.canvasEl
      .nativeElement as HTMLCanvasElement).getContext("2d");

    this.enemyContext = (this.enemyEl
      .nativeElement as HTMLCanvasElement).getContext("2d");

    this.drawGrid();

    console.log(this.mainTiles);
  }

  /**
   * Draws something using the context we obtained earlier on
   */
  drawGrid() {
    this.canvasEl.nativeElement.height = 400;
    this.canvasEl.nativeElement.width = 400;

    let row = 0;
    let col = 0;

    //Makes the rows and columns
    for (let x = 0; x <= 400; x += 40) {
      row = 0;
      for (let y = 0; y <= 400; y += 40) {
        //Making the "tiles"
        this.context.moveTo(x, 0);
        this.context.lineTo(x, 400);
        this.context.stroke();
        this.context.moveTo(0, y);
        this.context.lineTo(400, y);
        this.context.stroke();
        //Making a new tile to add to the array of tiles
        let tile = new Tile();
        tile.row = row;
        tile.col = col;
        tile.topX = x;
        tile.topY = y;
        tile.botX = x + 40;
        tile.botY = y + 40;
        tile.isHighlighted = false;
        this.mainTiles.push(tile);
        row++;
      }
      col++;
    }
  }

  hoveredRow: number = 0;
  hoveredCol: number = 0;

  hovering(event) {
    if (!this.didDrop && this.didSelect && !this.ready) {
      this.hoveredRow = Math.trunc(event.offsetY / 40);
      this.hoveredCol = Math.trunc(event.offsetX / 40);

      // console.log("hoveredRow: ", this.hoveredRow);
      // console.log("hoveredCol: ", this.hoveredCol);

      let tile = this.mainTiles.find(
        selectedTile =>
          selectedTile.row == this.hoveredRow &&
          selectedTile.col == this.hoveredCol
      );
    }
  }

  //When user lets go of the ship ontop of the grid
  mouseDrop(e) {
    console.log(this.curShipLen);
    console.log(this.curShipVertical);

    //Makes sure that ready hasnt been clicked and that a ship is selected
    if (!this.ready && this.didSelect) {
      this.didDrop = true;

      //Each tile is 40x40 so get the offset of canvas to give row and col of where mouse is
      let dropRow = Math.trunc(e.offsetY / 40);
      let dropCol = Math.trunc(e.offsetX / 40);

      //Find the tile on main board of where its dropped
      let tile = this.mainTiles.find(
        selectedTile =>
          selectedTile.row == dropRow && selectedTile.col == dropCol
      );

      if (!this.checkTiles(tile)) {
        console.log("checkTiles false");
        this.dragulaService.find("ship").drake.cancel(true);
      } else {
        // console.log(tile.isHighlighted);

        // if (!wasHighlighted) {
        //Get index for mainTiles array to be able to add to shipTiles later
        let firstTileIndex = this.mainTiles.indexOf(tile);
        // console.log("firstIndex: " + firstTileIndex);

        tile.isHighlighted = true;
        this.context.fillStyle = "blue";

        if (this.curShipVertical) {
          this.context.fillRect(tile.topX, tile.topY, 40, 40 * this.curShipLen);
          for (let i = 0; i < this.curShipLen; i++) {
            this.shipTiles.push(this.mainTiles[firstTileIndex + i]);
            this.mainTiles[firstTileIndex + i].isHighlighted = true;
            this.hideShip[this.curShipId] = true;
          }
        } else {
          this.context.fillRect(tile.topX, tile.topY, 40 * this.curShipLen, 40);

          //Use 11 because 10x10 grid and every 11 is a new column but same row
          let indexOffset = 11;
          this.shipTiles.push(this.mainTiles[firstTileIndex]);
          this.mainTiles[firstTileIndex].isHighlighted = true;
          for (let i = 0; i < this.curShipLen - 1; i++) {
            this.shipTiles.push(this.mainTiles[firstTileIndex + indexOffset]);
            this.mainTiles[firstTileIndex + indexOffset].isHighlighted = true;
            indexOffset += 11;
            this.hideShip[this.curShipId] = true;
          }
        }

        if (this.hideShip.indexOf(false) == -1) {
          this.ready = true;
        }

        this.context.stroke();
      }

      // }
    }
    this.didDrop = false;
    this.didSelect = false;
  }

  checkTiles(tile: Tile): boolean {
    // console.log("in checkTiles");

    if (tile.isHighlighted) {
      // this.dragulaService.find("ship").drake.cancel(true);
      // console.log("first tile highlighted");
      return false;
    }
    let firstTileIndex = this.mainTiles.indexOf(tile);
    if (this.curShipVertical) {
      for (let i = 0; i < this.curShipLen; i++) {
        if (this.mainTiles[firstTileIndex + i].isHighlighted) {
          // console.log("returning false vertical");
          return false;
        }
      }
    } else {
      let indexOffset = 11;
      for (let i = 0; i < this.curShipLen; i++) {
        if (this.mainTiles[firstTileIndex + indexOffset].isHighlighted) {
          // console.log("returning false horizontal");
          return false;
        }
        indexOffset += 11;
      }
    }
    // console.log("returning true");
    return true;
  }

  shipRow: number;
  shipCol: number;
  selectedIndex: number;

  shipClicked(event, shipLen, vert) {
    if (!this.ready) {
      this.curShipLen = shipLen;
      this.curShipVertical = vert;
      // console.log(event);
      this.didSelect = !this.didSelect;
      this.shipRow = Math.trunc(event.offsetY / 40);
      this.shipCol = Math.trunc(event.offsetX / 40);

      console.log(event.target.id);
      this.curShipId = event.target.id;

      // console.log(this.shipRow);
      // console.log(this.shipCol);
    }
  }

  readyUp() {
    this.ready = true;
    console.log(this.shipTiles);
    this.drawEnemyGrid();
  }

  drawEnemyGrid() {
    this.enemyEl.nativeElement.height = 400;
    this.enemyEl.nativeElement.width = 400;

    let row = 0;
    let col = 0;

    //Makes the rows and columns
    for (let x = 0; x <= 400; x += 40) {
      row = 0;
      for (let y = 0; y <= 400; y += 40) {
        //Making the "tiles"
        this.enemyContext.moveTo(x, 0);
        this.enemyContext.lineTo(x, 400);
        this.enemyContext.stroke();
        this.enemyContext.moveTo(0, y);
        this.enemyContext.lineTo(400, y);
        this.enemyContext.stroke();
        //Making a new tile to add to the array of tiles
        let tile = new Tile();
        tile.row = row;
        tile.col = col;
        tile.topX = x;
        tile.topY = y;
        tile.botX = x + 40;
        tile.botY = y + 40;
        tile.isHighlighted = false;
        this.enemyTiles.push(tile);
        row++;
      }
      col++;
    }
  }

  enemyBoardRow: number = -1;
  enemyBoardCol: number = -1;
  enemySelected = false;

  enemyBoardClicked(e) {
    if (this.enemyBoardRow != -1 && this.enemyBoardCol != -1) {
      let tile = this.enemyTiles.find(
        selectedTile =>
          selectedTile.row == this.enemyBoardRow &&
          selectedTile.col == this.enemyBoardCol
      );

      if (!tile.isHighlighted) {
        this.enemyContext.fillStyle = "white";
        this.enemyContext.fillRect(tile.topX, tile.topY, 40, 40);
      }
    }
    this.enemyBoardRow = Math.trunc(e.offsetY / 40);
    this.enemyBoardCol = Math.trunc(e.offsetX / 40);

    console.log(this.enemyBoardRow);
    console.log(this.enemyBoardCol);

    this.enemySelected = true;

    let tile = this.enemyTiles.find(
      selectedTile =>
        selectedTile.row == this.enemyBoardRow &&
        selectedTile.col == this.enemyBoardCol
    );

    if (!tile.isHighlighted) {
      this.enemyContext.fillStyle = "yellow";
      this.enemyContext.fillRect(tile.topX, tile.topY, 40, 40);
      this.enemyContext.stroke();
    }
  }

  fire() {
    if (this.enemySelected) {
      let enemyTile = this.enemyTiles.find(
        selectedTile =>
          selectedTile.row == this.enemyBoardRow &&
          selectedTile.col == this.enemyBoardCol
      );

      enemyTile.isHighlighted = true;

      let shipTile = this.shipTiles.find(
        selectedTile =>
          selectedTile.row == this.enemyBoardRow &&
          selectedTile.col == this.enemyBoardCol
      );

      if (shipTile != null) {
        console.log("hit");
        this.enemyContext.fillStyle = "red";
        this.enemyContext.fillRect(enemyTile.topX, enemyTile.topY, 40, 40);
        this.enemyContext.stroke();
      } else {
        console.log("hit");
        this.enemyContext.fillStyle = "lightblue";
        this.enemyContext.fillRect(enemyTile.topX, enemyTile.topY, 40, 40);
        this.enemyContext.stroke();
      }
    }
  }
}
