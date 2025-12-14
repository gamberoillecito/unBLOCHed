import { GatePath } from "./ModelUtility.svelte";
import { GateMatrix } from '$lib/model/GateMatrix.svelte';
import { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
import { math } from '$lib/model/ModelUtility.svelte';

/**
 * This class stores the necessary fields to save and restore a given state of both
 * the UI and the inner structure of the website.
 */
export class BlochHistoryElement {
    protected _DM: DensityMatrix;
    protected _GM: GateMatrix | null;
    protected _finalDM: DensityMatrix;
    pathVisible: boolean;

    /**
     * @param DM - The density matrix before the edit
     * @param finalDM - The density matrix after the edit 
     * @param GM - The applied gate (optional)
     * @param pathVisible - Whether to show the path relative to this Element on the GUI
     */
    constructor(DM: DensityMatrix, finalDM: DensityMatrix, GM: GateMatrix | null, pathVisible: boolean = true) {
        this.pathVisible = $state(pathVisible);
        this._finalDM = finalDM.clone();
        this._DM = DM.clone();

        // If the matrix is in the history it is not displayed and so
        // it is consistent by definition
        this._DM.isConsistent = true;
        this._GM = GM ? GM.clone() : null;
    }

    get DM(): DensityMatrix {
        return this._DM;
    }
    set DM(DM: DensityMatrix) {
        this._DM = DM;
    }

    get finalDM(): DensityMatrix {
        return this._finalDM;
    }

    get GM(): GateMatrix | null {
        return this._GM;
    }
    set GM(GM: GateMatrix) {
        this._GM = GM
    }
    /**
     * If the current element is related to the application of a gate, returns the 
     * `GatePath` relative to the application of `GM` of the initial state of the 
     * density matrix `DM`
     */
    get path(): GatePath | null {
        if (this._GM) {
            if (!math.isZero(this._GM.rotationAngle) && this._GM.rotationAxis != null) {
                return new GatePath(this._DM.blochV, this._GM.rotationAxis, this._GM.rotationAngle)
            }
        }
        return null
    }
}


/**
 * The class implements the full history of the actions performed by the user on the GUI.
 * It can be seen as a list of `BlochHistoryElements` which performs all the operations
 * needed to insert elements and advance/restore the history (basically CTRL+Z and CTRL+Y)
 */
export class BlochHistory {
    protected _list: BlochHistoryElement[];
    protected _nameList: string[]; // List of the labels of the history elements
    protected _current: number; // Index of the currently active history element
    /** Checkpoints are points in the history which are NOT related to the application of a gate,
     * Their indices are saved because when we encounter a checkpoint we have to either hide or re-show
     * all the paths prior (or following) the checkpoint
     */
    protected pathCheckpoints: number[]; //Indexes of all the pathCheckpoints
    /**
     * @param DM - The initial state to use for setting the first state of the history
     */
    constructor(DM: DensityMatrix) {
        this.pathCheckpoints = [];
        this._list = $state([]);
        this._nameList = $state([]);
        this._current = $state(-1);
        this.addElement(DM, DM);
    }
    /**
     * Adds an element to the history. If the state of the list was not at the latest change
     * it also deletes all the "undone" items.
     * @param DM - The density matrix before the edit
     * @param finalDM - The density matrix after the edit 
     * @param GM - The applied gate (optional)
     */
    addElement(DM: DensityMatrix, finalDM: DensityMatrix, GM: GateMatrix | null = null) {
        // Remove all the elements past the current one
        this._current++;
        this._list.splice(this._current)

        // If the state has been set directly I have to hide all the
        // previous GatePaths
        if (!GM) {
            for (let el of this._list) {
                el.pathVisible = false;
            }
            this.pathCheckpoints.push(this._current)
        }

        if (!finalDM.isConsistent) {
            console.error("finalDM is not consistent");
        }
        this._list.push(new BlochHistoryElement(DM, finalDM, GM));
    }

    /**
     * Undoes the previous operation restoring DM to the previous state.
     * The function also performs the necessary operations to hide the GatePaths
     * that should not be displayed (i.e. that are in the "future")
    */
    undo(DM: DensityMatrix) {
        this._current = this._current == -1 ? this._current : this._current - 1;


        let targetHistoryEl = this._list[this._current + 1];
        DM.copy(targetHistoryEl.DM);

        // If the new current element is a path checkpoint I have to restore the
        // visibility of all the previous GatePaths up to the previous checkpoint
        if (this._current + 1 === this.pathCheckpoints.at(-1)) {
            let counter = 0;
            let startCheckpoint = this.pathCheckpoints[this.pathCheckpoints.length - 2]
            let endCheckpoint = this.pathCheckpoints[this.pathCheckpoints.length - 1]
            for (let he of this._list.slice(startCheckpoint, endCheckpoint)) {
                he.pathVisible = true;
                counter++
            }
            this.pathCheckpoints.pop()
        }

    }

    redo(DM: DensityMatrix) {
        this._current = this._current == (this._list.length - 1) ? this._current : this._current + 1;

        if (!this._list[this._current].GM) {
            for (let el of this._list.slice(0, this._current)) {
                el.pathVisible = false;
            }
            this.pathCheckpoints.push(this._current)
        }
        let targetHistoryEl = this._list[this._current];
        DM.copy(targetHistoryEl.finalDM);
    }

    /** List of the BlochHistoryElements from the beginning up to the current element (i.e. 
     * elements that have been "undone" are not returned.
    ) */
    get list(): BlochHistoryElement[] {
        return this._list.slice(0, this._current + 1);
    }

    get nameList(): string[] {
        let res = [];
        let lab;
        for (let i = 0; i < this._list.length; i++) {
            let el = this._list[i];
            if (el.GM) {
                lab = `[${el.DM.label}, ${el.GM.label}, ${el.finalDM.label}]`;
            }
            else {
                lab = `[${el.DM.label}, ${el.finalDM.label}]`;
            }
            res.push(`${i > this._current ? '#' : ''} ${lab}`);
        }
        return res;
    }
    /** `true` if we are at the beginning of the history */
    get earliestChange(): boolean {
        // return this._earliestChange;
        return this._current == 0;
    }

    /** `true` if we are at the end of the history */
    get latestChange(): boolean {
        // return this._latestChange;
        return this._current == this._list.length - 1
    }

    /** index of the current element of the history */
    get currentIdx(): number {
        return this._current
    }
}