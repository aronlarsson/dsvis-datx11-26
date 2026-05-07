import { parseValues } from "~/helpers";
import { Engine, MessagesObject } from "~/engine";
import { EngineGeneralControls } from "~/general-controls/engine-general-controls";
import { Graph } from "~/graph";
import { G } from "@svgdotjs/svg.js";
import { WeightedGraphNode } from "~/objects/weightedgraph-node";
import { WeightedConnection } from "~/objects/weigted-connection";
import { GraphNode } from "~/objects/graph-node";

export const DepthMessages = {
    example: {
        here: "test"
    }
    //the messages we put somewhere on the canvas
    //to be implemented I think this is in the form of json file
    //seems to be used when you put "this.pause(example.here)"
} as const satisfies MessagesObject

export class Depth extends Engine implements Graph {
    graph: WeightedGraphNode | null = null;
    edgeTableGroup: G 
    createdNodes: WeightedGraphNode[] = [];
    initialValues: (String | Number)[] = [];
    messages: MessagesObject = DepthMessages;
    generalControls: EngineGeneralControls;
    allEdges:WeightedConnection<WeightedGraphNode>[] = []
    
    



    constructor(containorSelector: string) {
        super(containorSelector)
        //general controls are the buttons on the bottom
        //so we create our own general if we want to change those
        this.generalControls = new EngineGeneralControls(this.container, this)
        this.edgeTableGroup = this.Svg.group()
        this.edgeTableGroup.addClass("edge-table")
    }

    async start() {
        
        const nodes = this.treeGraph()
        
        this.allEdges = this.getEdges(nodes)
        const result = this.searchGraph(nodes[0])
        console.log(result)
        await this.nodeTraversalVisualisation(result)
    }


    async nodeTraversalVisualisation(graphTraversal:WeightedConnection<WeightedGraphNode>[]) {
        
        let currNode:WeightedGraphNode
        let lastNode:WeightedGraphNode | null = null
        const knownEdges:Set<WeightedConnection<WeightedGraphNode>> = new Set
        const visitedEdges:Set<WeightedConnection<WeightedGraphNode>> = new Set
    
        for (const edge of graphTraversal) {
            

            currNode = edge.$start
            currNode.setHighlight(true)
           

            for (const key in currNode.$outgoing) {
                const currEdge = currNode.$outgoing[key]
                
                if (!currEdge) continue
                if (!visitedEdges.has(currEdge)) {
                    knownEdges.add(currEdge)

                }
                
            }
            this.updateEdgeTable(knownEdges)
            await this.pause(`At node ${currNode.getText()}`)
            lastNode?.setHighlight(false)
            
            visitedEdges.add(edge)

            if (currNode === lastNode) { 
                //this skips the needs for extra userinput when you go from A->B B->C 
                lastNode = currNode
            }
            else {
                //Sets highlight to start of edge
                
                currNode.setHighlight(false)
            }

            //remove edge from edgetable
            knownEdges.delete(edge)
            this.updateEdgeTable(knownEdges)


            //Sets highlight to end of edge
            edge.setHighlight(true)
            currNode = edge.$end
            currNode.setHighlight(true)
            await this.pause("i am here now")
            currNode.setHighlight(false)
            lastNode = currNode

        }

        await this.pause("Done!")
    }

 




    //search through the graph starting from "startNode". returns a list of chronological order of traversal
    searchGraph(startNode:WeightedGraphNode):WeightedConnection<WeightedGraphNode>[] {
        const visitedNodes: WeightedGraphNode[] = []
        const result:WeightedConnection<WeightedGraphNode>[] = []
        this.searchGraphRecursion(startNode,visitedNodes,result)
        return result
    }



    private searchGraphRecursion(currNode:WeightedGraphNode,visitedNodes:WeightedGraphNode[],result:WeightedConnection<GraphNode>[]):void {
        
        if (!currNode) {
            throw new Error("start node doesnt exist")
        }
        
        visitedNodes.push(currNode)
        
        const edges = this.getEdges([currNode])
        for (let i = 0; i < edges.length;i++) {
            const connectedNode = edges[i].$end
            if (!visitedNodes.includes(connectedNode)) {
                result.push(edges[i])
                this.searchGraphRecursion(connectedNode, visitedNodes,result)
            }
        }
    } 

    async chosenGraph(graf: string | number) {
        if (graf === "") {
            await this.resetAlgorithm()
        } else if (graf === "Undirected") {
            await this.resetAlgorithm()
            this.undirectedGraph()
        } else if (graf === "Directed") {
            await this.resetAlgorithm()
            this.directedGraph()
        } 
         else if (graf === "Tree") {
            await this.resetAlgorithm()
            this.createdNodes = this.treeGraph() }
        
        else {
            await this.resetAlgorithm()
            this.Svg.text("You are WRONG!")
            .center(this.$Svg.width/10, this.$Svg.height/2)
            .font({ size: 100 })
            .stroke({ color: "#f44444", width: 5 })
            this.Svg.text("also ERROR!")
            .center(this.$Svg.width/10, this.$Svg.height/2 + 100)
            .font({ size: 10 })
            .stroke({ color: "#f44444", width: 0.5 })
        }
    }

    initialise(initialValues: string[] | null = null): this {
        //initialValues will probably only be used if we can make it so
        //that you can construct your own graph, in other classes it's
        //used like this.initialise(["k"]) and you start with a k node
        this.initialValues = parseValues(initialValues);
        super.initialise()
        return this;
    }

    async resetAlgorithm() {
        await super.resetAlgorithm();
        for (const k of this.createdNodes) {
            k.remove()
            for (const c in k.$incoming) {
                k.$incoming[c]?.remove()
                k.$incoming[c]?.$textObj.remove()
            }
            for (const c in k.$outgoing) {
                k.$outgoing[c]?.remove()
                k.$outgoing[c]?.$textObj.remove()
            }
        }
        this.createdNodes = []
    }

    //defines a new Node object and puts it under where messages
    //are, will not define connections to different nodes.
    newNode(text: string): WeightedGraphNode {
        const newNode = new WeightedGraphNode(text, this.getObjectSize(), this.getStrokeWidth())
        this.createdNodes.push(newNode)
        return this.Svg.put(
            newNode
        ).init(...this.getNodeStart());
    }

    //This is just the connect function but i didn't wanna bother with
    //sending along a unique key to every node.
    link(
        ourNode: WeightedGraphNode, 
        theirNode: WeightedGraphNode,
        weight: number,
        dir: string
    ): void {
        ourNode.connect(theirNode.getText(), 
                        ourNode.getText(), 
                        theirNode, 
                        this.getStrokeWidth(), 
                        weight, 
                        dir)
    }

    //Puts a Node a 100(px not sure what unit we have) away from
    //another node at a degree(not radians!)
    //does not have animation implemented
    putAtDeg(
        putNode: WeightedGraphNode,
        relativNode: WeightedGraphNode,
        degree: number,
        distance: number = 125,
        animation: boolean = false
    ): void {
        distance = distance*putNode.getSize()/40
        const degreé = Math.PI/180 * degree * (-1)
        const [relativX, relativY] = relativNode.getCenter()
        var ani = 0
        if (animation) ani = this.getAnimationSpeed();
        putNode.setCenter(
            relativX + distance*Math.cos(degreé),
            relativY + distance*Math.sin(degreé),
            ani
        )
    }

    //Want the eventual algorithm to call this every it takes a "step"
    updateEdgeTable(knownEdges:Set<WeightedConnection<WeightedGraphNode>>) {
    

    const columns = ["From", "To", "Weight"];
    const edges = knownEdges
    
    const cellHeight = 40;
    const cellWidth = 80;

    const startX = this.$Svg.width-cellWidth*columns.length;
    const startY = 0;
    
    // Clear previous content
    this.edgeTableGroup.clear();

    this.drawRow(columns,0,startX,startY,cellWidth,cellHeight)

    let k = 0
     for (const edge of edges) {
        const currEdge = edge
        const rowData = [currEdge.$start.getText(),currEdge.$end.getText(),currEdge.$weight.toString()]
    

        this.drawRow(
            rowData,
            k + 1,
            startX,
            startY,
            cellWidth,
            cellHeight
        );
        k++
    }           
    
    this.Svg.add(this.edgeTableGroup)
}

//returns all outgoing edges from the provided nodes
private getEdges(nodes:WeightedGraphNode[]):WeightedConnection<WeightedGraphNode>[] {
    const edges:WeightedConnection<WeightedGraphNode>[] = []
    for (const node of nodes) {
        for (const key in node.$outgoing) {
            
            const edge = node.$outgoing[key];
            
            if (!edge) continue;

            edges.push(edge);
        }
    }
    return edges

}

private drawRow(
    rowData: string[],
    rowIndex: number,
    startX: number,
    startY: number,
    cellWidth: number,
    cellHeight: number
) {
    for (let col = 0; col < rowData.length; col++) {

        const x = startX + col * cellWidth;
        const y = startY + rowIndex * cellHeight;

        this.edgeTableGroup
            .rect(cellWidth, cellHeight)
            .move(x, y);

        this.edgeTableGroup
            .text(rowData[col])
            .font({
                anchor: 'middle',
                leading: '1em',
                size: 14
            })
            .center(x + cellWidth / 2, y + cellHeight / 2);
    }
}




treeGraph(): WeightedGraphNode[] {
        const midW = this.$Svg.width/2 - 100
        const midH = this.$Svg.height/2 - 200

        const A = this.newNode("A")
        const B = this.newNode("B")
        const C = this.newNode("C")
        const D = this.newNode("D")
        const E = this.newNode("E")
        const F = this.newNode("F")
        const G = this.newNode("G")
        const H = this.newNode("H")
        const I = this.newNode("I")
        const J = this.newNode("J")
        const K = this.newNode("K")
        const L = this.newNode("L")
        const M = this.newNode("M")
        const N = this.newNode("N")

        A.setCenter(midW, midH)
        this.graph = A

        this.putAtDeg(B, A, -20)
        this.putAtDeg(C, A, -160)
        this.link(A, B, 10, "to")
        this.link(A, C, 10, "to")

        this.putAtDeg(D, B, -135)
        this.putAtDeg(E, B, -45)
        this.link(B, D, 10, "to")
        this.link(B, E, 10, "to")

        this.putAtDeg(F, C, -135)
        this.putAtDeg(G, C, -45)
        this.link(C, F, 10, "to")
        this.link(C, G, 10, "to")

        this.putAtDeg(H, F, -135)
        this.putAtDeg(I, F, -45)
        this.link(F, H, 10, "to")
        this.link(F, I, 10, "to")

        this.putAtDeg(J, G, 250)
        this.link(G, J, 10, "to")

        this.putAtDeg(K, I, -100)
        this.link(I, K, 10, "to")

        this.putAtDeg(L, K, -135)
        this.putAtDeg(M, K, -45)
        this.link(K, L, 10, "to")
        this.link(K, M, 10, "to")

        this.putAtDeg(N, D, -90)
        this.link(D, N, 10, "to")

        return [A,B,C,D,E,F,G,H,I,J,K,L,M,N]
    }





}