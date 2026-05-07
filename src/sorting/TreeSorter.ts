import { Engine, MessagesObject, SubmitFunction } from "~/engine";
import { BinaryDir, BinaryNode } from "~/objects/binary-node";
import { DSArray } from "~/objects/dsarray";
import { TextCircle } from "~/objects/text-circle";
import { Sorter } from "~/sorting";

export const SortMessages = {
    general: {
        empty: "Array is empty!",
        full: "Array is full!",
        finished: "Finished",
    },
    sort: {
        compare: (a: string, b: string) => `Compare ${a} and ${b}`,
        swap: (a: string, b: string) => `Swap ${a} and ${b}`,
    },
} as const satisfies MessagesObject;

export class TreeSorter extends Engine implements Sorter {

    initialValues: number[] = [];
    
    treeRoot: BinaryNode | null = null;
    treeNodes: Array<BinaryNode | null> = [];
    sortArray: DSArray | null = null;

    messages: MessagesObject = SortMessages;

    constructor(containerSelector: string) {
        super(containerSelector);
    }

    initialise(initialValues: number[] = []) {
        this.initialValues = initialValues;
        super.initialise();
    }

    async resetAlgorithm() {
        await super.resetAlgorithm();
        this.treeRoot = null;
        const arraySize = this.initialValues.length;
        this.treeNodes = new Array(arraySize).fill(null);

        const [xRoot, yRoot] = this.getTreeRoot();
        this.sortArray = this.Svg.put(
            new DSArray(arraySize, this.getObjectSize(), true)
        ).init(arraySize, xRoot, this.Svg.viewbox().height - yRoot);

        if (Number(this.sortArray.x()) < this.$Svg.margin) {
            this.sortArray.x(this.$Svg.margin);
        }

        // Initialize array with input values
        for (let i = 0; i < this.initialValues.length; i++) {
            const value = String(this.initialValues[i]);
            const node = this.Svg.put(
                new BinaryNode(value, this.getObjectSize(), this.getStrokeWidth())
            ).init(...this.getNodeStart());

            this.treeNodes[i] = node;
            if (i === 0) {
                this.treeRoot = node;
            } else {
                const parentIdx = Math.floor((i - 1) / 2);
                const parentNode = this.treeNodes[parentIdx];
                if (parentNode) {
                    const direction: BinaryDir = i === 2 * parentIdx + 1 ? "left" : "right";
                    parentNode.setChild(direction, node, this.getStrokeWidth());
                }
            }

            this.sortArray.setValue(i, value);
            this.sortArray.setDisabled(i, false);
        }

        this.resizeTree();
    }

    resizeTree() {
        const animate = !this.state.isResetting();
        this.treeRoot?.resize(
            ...this.getTreeRoot(),
            this.$Svg.margin,
            this.getNodeSpacing(),
            animate ? this.getAnimationSpeed() : 0
        );
    }

    async submit(
        method: SubmitFunction,
        field: HTMLInputElement | null
    ): Promise<boolean> {
        if (field === null) {
            await this.execute(method, []);
            return true;
        }
        let rawValue: string = "";
        try {
            rawValue = field.value;
            field.value = "";
            const inputNumbers = rawValue
                .split(" ")
                .filter((value) => !isNaN(Number(value)) && !isNaN(parseInt(value)))
                .map((value) => parseInt(value));
            await this.execute(method, inputNumbers);
            return true;
        } catch (e: any) {
            console.error(e);
            return false;
        }
    }

    setArraySize(size: number): void {
        const values: number[] = Array.from({ length: size }, () =>
            Math.floor(Math.random() * 99) + 1
        );
        this.initialise(values);
    }

    getValue(index: number): number {
        return Number(this.sortArray?.getValue(index) || 0);
    }

    getValues(): number[] {
        const result: number[] = [];
        for (let i = 0; i < this.initialValues.length; i++) {
            const val = this.sortArray?.getValue(i);
            if (val && val !== "") {
                result.push(Number(val));
            }
        }
        return result;
    }

    async swap(i: number, j: number) {
        if (!this.sortArray || !this.treeNodes[i] || !this.treeNodes[j]) return;

        const iNode = this.treeNodes[i]!;
        const jNode = this.treeNodes[j]!;

        const iValue = String(this.sortArray.getValue(i));
        const jValue = String(this.sortArray.getValue(j));

        // Create animated circles that will swap
        const iCircle = this.Svg.put(
            new TextCircle(iValue, this.getObjectSize(), this.getStrokeWidth())
        ).init(iNode.cx(), iNode.cy());

        const jCircle = this.Svg.put(
            new TextCircle(jValue, this.getObjectSize(), this.getStrokeWidth())
        ).init(jNode.cx(), jNode.cy());

        // Animate them swapping positions
        iCircle.setCenter(jNode.cx(), jNode.cy(), this.getAnimationSpeed());
        jCircle.setCenter(iNode.cx(), iNode.cy(), this.getAnimationSpeed());

        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, this.getAnimationSpeed()));

        // Update array visualization
        this.sortArray.swap(i, j, true);

        // Update tree node values
        iNode.setText(jValue);
        jNode.setText(iValue);

        // Clean up temporary circles
        iCircle.remove();
        jCircle.remove();
    }

    setTreeHighlight(index: number, type: "primary" | "secondary" | "tertiary") {
        const node = this.treeNodes[index];
        if (node) {
            node.setHighlight(true);
        }
        this.sortArray?.setIndexHighlight(index, true);
    }

    clearTreeHighlight(index: number) {
        const node = this.treeNodes[index];
        if (node) {
            node.setHighlight(false);
        }
        this.sortArray?.setIndexHighlight(index, false);
    }

    setTreesDisabled(start: number, end: number) {
        for (let i = start; i < end && i < this.initialValues.length; i++) {
            this.sortArray?.setDisabled(i, true);
        }
    }

    async sort() {
        throw new Error("Sort not implemented");
    }

    async insert(...values: Array<number | string>) {
        // Insert values into the tree (for subclasses to implement)
    }

    async unsort() {
        // Unsort the tree (for subclasses to implement)
    }

    getObjectSize(): number {
        switch (this.generalControls.objectSizeSelect.value) {
            case "tiny":
                return 3;
            case "small":
                return 8;
            case "medium":
                return 15;
            case "large":
                return 30;
            case "huge":
                return 40;
            default:
                return 15;
        }
    }
}
