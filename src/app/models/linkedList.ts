import { element } from "@angular/core/src/render3";

export class Node {
  element: any;
  next: Node;

  constructor(el) {
    this.element = el;
    this.next = null;
  }
}

export class LinkedList {
  head = null;
  length = 0;

  append(element) {
    let newNode = new Node(element);

    // console.log("NEW NODE: ", newNode);
    let current;

    if (this.head == null) {
      this.head = newNode;
    } else {
      current = this.head;

      while (current.next != null) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.length++;
  }

  remove(index) {
    let count = 0;
    if (index >= 0 && index < this.length) {
      let current = this.head;
      let prev = null;
      //   let node;
      if (index == 0) {
        let row = this.head.element.row;
        let col = this.head.element.col;
        this.head = current.next;
        this.length--;
        return { row: row, col: col };
      } else {
        while (count != index) {
          prev = current;
          // console.log(current);
          current = current.next;
          count++;
        }
        this.length--;
        let elementToReturn = current.element;
        prev.next = current.next;
        return elementToReturn;
      }
    } else {
      return null;
    }
  }
}
