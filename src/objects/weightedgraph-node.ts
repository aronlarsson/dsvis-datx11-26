import { GraphNode } from "./graph-node";
import { WeightedConnection } from "./weigted-connection";

export class WeightedGraphNode extends GraphNode {
    $outgoing: Record<string, WeightedConnection<this> | null> = {};
    $incoming: Record<string, WeightedConnection<this> | null> = {};
    $weights: Record<string, number | null> = {};


    constructor(text: string, size: number, strokeWidth: number) {
        super(text, size, strokeWidth);
    }


    // These are inhereted functions, nothing wrong with them
    // but adding more variables to them seems to be a no-no
    // so use connect instead
    override setPredecessor(): never 
     { throw new Error ("setPredecessor and setSuccessor are obsolete use connect for this class");}

    override setSuccessor(): never 
     { throw new Error ("setPredecessor and setSuccessor are obsolete use connect for this class")}

    // connect has pretty much the exact structure of setSuccessor
    // but i added so it checks dir in the beginning and puts
    // weight in at the end
    // dir = from creates theirKey ----> ourKey
    // dir = to creates   theirKey <---- ourKey
    // dir = both creates theirKey <---> ourKey
    connect(
        theirKey: string,
        ourKey: string,
        theirNode: this | null,
        strokeWidth: number,
        weight: number,
        dir: string
    ): this {
        if (dir === "from" && theirNode) {
            theirNode.connect(ourKey, theirKey, this, strokeWidth, weight, "to")
            return this
        } else if (dir === "both" && theirNode) {
            theirNode.connect(ourKey, theirKey, this, strokeWidth, weight, "to")
        } else if (dir !== "to") {
            throw new Error ("connect only has the directions to, from and both defined")
        }
        const outEdge = this.$outgoing[theirKey];
        
        if (outEdge) {
            const oldSuccessor = outEdge.getEnd();
            const oldIncoming = oldSuccessor.$incoming;
            for (const k in oldIncoming) {
                if (oldIncoming[k] === outEdge) {
                    delete oldIncoming[k];
                }
            }
            outEdge.remove();
        }
        if (theirNode) {
            const inEdge = theirNode.$incoming[ourKey];
            if (inEdge) {
                const oldPredecessor = inEdge.getStart();
                const oldOutgoing = oldPredecessor.$outgoing;
                for (const k in oldOutgoing) {
                    if (oldOutgoing[k] === inEdge) {
                        delete oldOutgoing[k];
                    }
                }
                inEdge.remove();
            }
            var bend = 0
            if(theirNode.$outgoing[ourKey] && theirNode.$outgoing[ourKey].$weight != weight) {
                bend = 0.2
                theirNode.$outgoing[ourKey].$bend = bend
                theirNode.$outgoing[ourKey].update(theirNode.$outgoing[ourKey].$coords)
            }
            const edge = this.root()
                .put(new WeightedConnection(this, theirNode, weight))
                .init(
                    strokeWidth,
                    this.getBend(theirKey) + bend,
                    this.getDirected(theirKey)
                );

            this.$outgoing[theirKey] = edge;
            this.$weights[theirKey] = weight
            theirNode.$incoming[ourKey] = edge;
        } else {
            delete this.$outgoing[theirKey];
        }
        this._updateNullary();
        return this;
    }
}