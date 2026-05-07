import { Graph } from "~/graph";
import { EngineAlgorithmControl } from "./engine-algorithm-controls";
import { querySelector } from "~/helpers";


export class GraphAlgorithmControl extends EngineAlgorithmControl {
    start: HTMLInputElement;
    chosenGraph: HTMLInputElement; //name of element will be displayed as a message
                                   //uppercase letters will hava a space like
                                   //Chosen Graph will be displayed
    chooseGraphI: HTMLSelectElement;
    engine: Graph;
    
    constructor(container: HTMLElement, engine: Graph) {
        super(container);

        this.engine = engine

        this.chooseGraphI = querySelector<HTMLSelectElement>(
            "select.chooseGraphI",
            container
        );

        this.chosenGraph = querySelector<HTMLInputElement>(
            "Input.chosengraph",
            container
        );

        this.start = querySelector<HTMLInputElement> (
            "input.start", //this needs to be the input.(name of class in HTML doc)
            container
        );

        this.initialize();
    }

    initialize() {
        //this.engine.(name of SubmitFunction) needs a defined function in
        //the implementation of your engine with the same name as SubmitFunction
        this.chooseGraphI.addEventListener("change", () => {
            this.chosenGraph.value = this.chooseGraphI.value
            this.chooseGraphI.value = ""
            this.engine.submit(this.engine.chosenGraph, this.chosenGraph)
        })

        this.start.addEventListener("click", () => {
            this.engine.submit(this.engine.start, null)
        });
    }
}