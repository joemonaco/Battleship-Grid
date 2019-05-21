import { Component, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { Tile } from "../app/tile";
import { DragulaService } from "ng2-dragula";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements AfterViewInit {
  /** Template reference to the canvas element */
  @ViewChild("canvasEl") canvasEl: ElementRef;
  @ViewChild("shipEl1") shipEl1: ElementRef;
  @ViewChild("shipEl2") shipEl2: ElementRef;

  /** Canvas 2d context */
  context: CanvasRenderingContext2D;
  shipContext1: CanvasRenderingContext2D;

  constructor(private dragulaService: DragulaService) {
    dragulaService.createGroup("ship", {
      removeOnSpill: true
    });
  }

  mainTiles: Tile[] = [];
  shipTiles: Tile[] = [];

  didDrop: boolean = false;
  curShipLen = 0;
  curShipVertical = true;

  ready = false;

  didSelect: boolean = false;

  ngAfterViewInit() {
    this.context = (this.canvasEl
      .nativeElement as HTMLCanvasElement).getContext("2d");

    this.drawGrid();
    // this.drawShips();

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

    for (let x = 0; x <= 400; x += 40) {
      row = 0;
      for (let y = 0; y <= 400; y += 40) {
        this.context.moveTo(x, 0);
        this.context.lineTo(x, 400);
        this.context.stroke();
        this.context.moveTo(0, y);
        this.context.lineTo(400, y);
        this.context.stroke();
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

  // drawShips() {
  //   this.shipEl1.nativeElement.height = 160;
  //   this.shipEl1.nativeElement.width = 40;

  //   var curIndex = 0;

  //   let row = 0;
  //   let col = 0;

  //   for (var x = 0; x <= 40; x += 40) {
  //     row = 0;
  //     for (var y = 0; y <= 160; y += 40) {
  //       this.shipContext1.moveTo(x, 0);
  //       this.shipContext1.lineTo(x, 40);
  //       this.shipContext1.stroke();
  //       this.shipContext1.moveTo(0, y);
  //       this.shipContext1.lineTo(40, y);
  //       this.shipContext1.stroke();
  //       this.shipContext1.fillStyle = "blue";
  //       let shipTile = new ShipTile();
  //       shipTile.isVertical = false;
  //       shipTile.index = curIndex;
  //       shipTile.size = 4;
  //       shipTile.row = row;
  //       shipTile.col = col;
  //       this.ship1Tiles.push(shipTile);
  //       this.shipContext1.fillRect(x, y, x + 40, y + 40);
  //       row++;
  //     }
  //     col++;
  //   }
  // }

  hoveredRow: number = 0;
  hoveredCol: number = 0;

  hovering(event) {
    if (!this.didDrop && this.didSelect && !this.ready) {
      this.hoveredRow = Math.trunc(event.offsetY / 40);
      this.hoveredCol = Math.trunc(event.offsetX / 40);

      console.log("hoveredRow: ", this.hoveredRow);
      console.log("hoveredCol: ", this.hoveredCol);

      let tile = this.mainTiles.find(
        selectedTile =>
          selectedTile.row == this.hoveredRow &&
          selectedTile.col == this.hoveredCol
      );

      // if (!tile.isHighlighted) {
      //   this.unHighlight();
      // tile.isHighlighted = true;
      // this.context.moveTo(tile.topX, 0);
      // this.context.lineTo(tile.topX, 600);
      // this.context.stroke();
      // this.context.moveTo(0, tile.topY);
      // this.context.lineTo(600, tile.topY);
      // this.context.stroke();
      // this.context.fillStyle = "lightgray";
      // this.context.fillRect(tile.topX, tile.topY, 40, 40 * 4);
      // }
    }
  }

  // unHighlight() {
  //   let tile = this.mainTiles.find(selectedTile => selectedTile.isHighlighted);

  //   if (tile != null) {
  //     tile.isHighlighted = false;
  //     this.context.fillStyle = "white";
  //     this.context.fillRect(tile.topX, tile.topY, 40, 40 * 4);
  //   }
  // }

  mouseDrop(e) {
    if (!this.ready && this.didSelect) {
      console.log("drop");
      // this.context.fillStyle = "blue";
      this.didDrop = true;

      let dropRow = Math.trunc(e.offsetY / 40);
      let dropCol = Math.trunc(e.offsetX / 40);

      console.log("dropRow: ", dropRow);
      console.log("dropCols: ", dropCol);

      let tile = this.mainTiles.find(
        selectedTile =>
          selectedTile.row == dropRow && selectedTile.col == dropCol
      );
      let firstTileIndex = this.mainTiles.indexOf(tile);
      console.log("firstIndex: " + firstTileIndex);

      // if (!tile.isHighlighted) {
      // this.unHighlight();
      tile.isHighlighted = true;
      this.context.moveTo(tile.topX, 0);
      this.context.lineTo(tile.topX, 400);
      this.context.stroke();
      this.context.moveTo(0, tile.topY);
      this.context.lineTo(400, tile.topY);
      this.context.stroke();
      this.context.fillStyle = "blue";
      if (this.curShipVertical) {
        this.context.fillRect(tile.topX, tile.topY, 40, 40 * this.curShipLen);
        for (let i = 0; i < this.curShipLen; i++) {
          this.shipTiles.push(this.mainTiles[firstTileIndex + i]);
        }
      } else {
        this.context.fillRect(tile.topX, tile.topY, 40 * this.curShipLen, 40);
        let indexOffset = 11;
        for (let i = 0; i < this.curShipLen; i++) {
          this.shipTiles.push(this.mainTiles[firstTileIndex + indexOffset]);
          indexOffset += 11;
        }
      }
      // }

      this.didDrop = false;
      this.didSelect = false;
    }
  }

  shipRow: number;
  shipCol: number;
  selectedIndex: number;

  shipClicked(event, shipLen, vert) {
    if (!this.ready) {
      this.curShipLen = shipLen;
      this.curShipVertical = vert;
      console.log(event);
      this.didSelect = !this.didSelect;
      this.shipRow = Math.trunc(event.offsetY / 40);
      this.shipCol = Math.trunc(event.offsetX / 40);

      console.log(this.shipRow);
      console.log(this.shipCol);
    }
  }

  readyUp() {
    this.ready = true;
    console.log(this.shipTiles);
  }
}
