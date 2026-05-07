import { Text } from "@svgdotjs/svg.js";
import { LinkedNode } from "./basic-structure-objects/linked-node";
import { BTreeNode } from "./btree-node";
import { Connection } from "./connection";
import { GraphNode } from "./graph-node";

export class WeightedConnection<T extends GraphNode | BTreeNode | LinkedNode> extends Connection<T> {
    $weight: number
    $textObj!: Text

    constructor(start: T, end: T, weight: number) {
        super(start, end)
        
        this.$weight = weight
    }

    // for the overridden functions i only added _createWeight and _redrawWeight
    override update(
        newCoords: Partial<{ x1: number; y1: number; x2: number; y2: number; r2: number; }>, 
        animationDuration: number = 0
    ): this {
        Object.assign(this.$coords, newCoords);
        (this.engine().animate(this, animationDuration > 0) as this).plot(
            this._getPath()
        );
        this._redrawWeight(newCoords, animationDuration)
        if (this.isDirected()) {
            this._redrawArrow(animationDuration);
        }
        return this;
    }

    override init(
        strokeWidth: number,
        bend: number = 0,
        directed: boolean = false
    ): this {
        this.stroke({ width: strokeWidth });
        this.back();
        this.setBend(bend);
        if (directed) {
            this._createArrow();
        }
        this._createWeight();
        this.update(this.$coords);
        return this;
    }

    // Creates a text object that contains the weight value
    // of this connection
    _createWeight(): void {
        const C = this.$coords
        var [offx, offy] = [0, 0]
        if (this.$bend > 0) {
            [offx, offy] = this._offset()
        }
        this.$textObj = this.root()
        .text(this.$weight.toString())
        .font({ size: 25*this.$end.getSize()/40 })
        .fill("#000000")
        .stroke({ color: "#B32034", width: 2 })
        .center(
            (C.x1 + C.x2)/2 + (C.y1 - C.y2) * this.$bend - offx*17,
            (C.y1 + C.y2)/2 + (C.x2 - C.x1) * this.$bend - offy*17
        );
    }

    // When update gets called this animates the text object
    // so it stays in the middle of the connection
    _redrawWeight(newCoords: Partial<{ x1: number; 
                                       y1: number; 
                                       x2: number; 
                                       y2: number; 
                                       r2: number; 
                                    }>,
                  animationDuration: number = 0): void {
        const C = this.$coords

        const x1 = newCoords.x1 ? newCoords.x1 : C.x1
        const x2 = newCoords.x2 ? newCoords.x2 : C.x2
        const y1 = newCoords.y1 ? newCoords.y1 : C.y1
        const y2 = newCoords.y2 ? newCoords.y2 : C.y2

        var [offx, offy] = [0, 0]
        if (this.$bend > 0) {
            [offx, offy] = this._offset()
        }

        this.$textObj.font({ size: 25*this.$end.getSize()/40 })
        this.$textObj.engine().animate(this.$textObj, animationDuration > 0)
        .center(
            (x1 + x2)/2 + (y1 - y2) * this.$bend - offx*7,
            (y1 + y2)/2 + (x2 - x1) * this.$bend - offy*7
        )
    }

    _offset(): [number, number] {
        const preX1 = (this.$coords.x2 - this.$coords.x1)
        const preY1 = (this.$coords.y2 - this.$coords.y1)
        const norm  = Math.sqrt(preX1*preX1 + preY1*preY1)
        const x1    = preX1/norm
        const y1    = preY1/norm
        const siny1 = y1*Math.cos(Math.PI/2) + x1*Math.sin(Math.PI/2)
        const cosx1 = x1*Math.cos(Math.PI/2) - y1*Math.sin(Math.PI/2)
        return [cosx1, siny1]
    }
}