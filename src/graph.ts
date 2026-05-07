import { Engine, SubmitFunction } from "~/engine";
import { initialiseEngine, RecordOfEngines } from "./helpers";
import { Depth } from "./graphs/Depth-first-search";
import { EngineAlgorithmControl } from "./algorithm-controls/engine-algorithm-controls";
import { GraphAlgorithmControl } from "./algorithm-controls/graph-algorithmcontrols";

export interface Graph extends Engine {
    start: SubmitFunction;
    chosenGraph: SubmitFunction;
    //define buttons that can be used for all graphs
    //these will be at the top of the screen like
    //insert for collections or deleteMin for prioqueues
    //the name of SubmitFunctions will be put along
    //messages when clicked
    //to have buttons at the bottom of the screen look
    //at general-controls
}

const GRAPH_CLASSES = {
    Depth: Depth, //define the searching algorithms
    // I think its used so the program can find classes
    // in the html
} as const satisfies RecordOfEngines<Graph>;

const { engine, isBaseEngine } = initialiseEngine<Graph>(
    "#graphContainer",
    GRAPH_CLASSES
);

if (!isBaseEngine) {
    engine.algorithmControls = new GraphAlgorithmControl(
        engine.container,
        engine
    ); //This code should give our buttons "power"
  
}