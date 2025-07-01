import { thickness } from "three/tsl";
import { DensityMatrix, GateMatrix, GatePath, print_mat } from "./Model.svelte";

import {
type Complex, 
create,
all,
complex,
} from 'mathjs'
import { ToonShaderHatching } from "three/examples/jsm/Addons.js";

const config = {
  absTol: 1e-10,
}

const math = create(all, config);

export class BlochHistoryElement {
    protected _DM: DensityMatrix;
    protected _GM: GateMatrix|null;
    pathVisible: boolean;
    
    constructor(DM: DensityMatrix, GM: GateMatrix|null,  pathVisible:boolean = true) {
        this.pathVisible= $state(pathVisible);
        this._DM = DM.clone();
        this._GM = GM? GM.clone() : null;
    }
    
    get DM(): DensityMatrix {
        return this._DM;
    }
    set DM(DM:DensityMatrix) {
        this._DM = DM;
    }

    get GM(): GateMatrix|null {
        return this._GM;
    }
    set GM(GM:GateMatrix) {
        this._GM = GM
    }
    
    get path() :GatePath|null{
        if (this._GM) {
          if (!math.isZero(this._GM.rotationAngle) && this._GM.rotationAxis != null){
            return new GatePath(this._DM.blochV, this._GM.rotationAxis, this._GM.rotationAngle)
          }
        }
      return null
    }
}



export class BlochHistory {
    protected _list: BlochHistoryElement[]; 
    protected _nameList: string[]; // List of the labels of the history elements
    protected _current: number; // Index of the currently active history element
    protected pathCheckpoints: number[]; //Indexes of all the pathCheckpoints
    // protected _pathList: GatePath[];
    constructor(DM: DensityMatrix) {
        this.pathCheckpoints = [0];
        this._list = $state([]);
        this._nameList = $state([]);
        this._current = $state(-1);
        this.addElement(DM);
    }
    
    addElement(DM: DensityMatrix, GM: GateMatrix|null = null) {
        // Remove all the elements past the current one
        this._current++;
        this._list.splice(this._current)

        if (!GM) {
            for (let el of this._list) {
                el.pathVisible = false;
            }
            this.pathCheckpoints.push(this._current)            
        }
        this._list.push(new BlochHistoryElement(DM, GM));
        console.log(`Added element. Current: ${this._current}. List: ${this._list.length}`);
        console.log(`Added element. Checkpoints: ${this.pathCheckpoints}`);
    }

    // Undoes the previous operation restoring DM to the previous state
    undo(DM: DensityMatrix) {
        this._current = this._current == -1 ? this._current : this._current - 1;
        
        
        console.log(`current in undo: ${this._current} len ${this._list.length}`);
        let targetHistoryEl = this._list[this._current + 1];
        DM.copy(targetHistoryEl.DM);
        
        // If the new current element is a path checkpoint I have to restore the
        // visibility of all the previous GatePaths up to the previous checkpoint
        if (this._current  === this.pathCheckpoints.at(-1)) {
            let counter = 0;
            let startCheckpoint = this.pathCheckpoints[this.pathCheckpoints.length - 1]
            let endCheckpoint = this.pathCheckpoints[this.pathCheckpoints.length ]
            for (let he of this._list.slice(startCheckpoint, endCheckpoint)) {
                he.pathVisible = true;
                console.log(`Setting ${counter + startCheckpoint}`);
                counter++
            }
            this.pathCheckpoints.pop()
        }
        console.log(`undo:${this.nameList}`);
        
    }
    
    redo(DM: DensityMatrix) {
        this._current = this._current == (this._list.length - 1) ? this._current : this._current + 1;
        console.log(`current in redo: ${this._current} len ${this._list.length}`);
        
        if (!this._list[this._current].GM) {
            for (let el of this._list.slice(0, this._current)) {
                el.pathVisible = false;
            }
            this.pathCheckpoints.push(this._current)            
        }
        let targetHistoryEl = this._list[this._current];
        
        let finalDM = targetHistoryEl.DM.clone()
        if (targetHistoryEl.GM) {
            finalDM.apply_gate(targetHistoryEl.GM)
        }
        DM.copy(finalDM);
    }

    get list(): BlochHistoryElement[] {
        return this._list.slice(0, this._current + 1);
    }

    get nameList(): string[] {
        let res = [];
        let lab;
        for (let i = 0; i < this._list.length; i++) {
            let el = this._list[i];
            if (el.GM) {
                lab = el.GM.label; 
            }
            else {
                lab = el.DM.label;
            }
            res.push(`${i > this._current ? '#': ''} ${lab}`);
        }
        return res;
    }

    get earliestChange(): boolean {
        // return this._earliestChange;
        return this._current == 0;
    }
    
    get latestChange() :boolean {
        // return this._latestChange;
        return this._current == this._list.length - 1
    }

    // get pathsList(): GatePath[] {
    //     return this._pathList;
    // }
}