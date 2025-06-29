import { DensityMatrix, GateMatrix, GatePath } from "./Model.svelte";

import {
type Complex, 
create,
all,
complex,
} from 'mathjs'

const config = {
  absTol: 1e-10,
}

const math = create(all, config);

export class BlochHistoryElement {
    protected _DM: DensityMatrix;
    protected _GM: GateMatrix|null;
    id: number;
    
    constructor(DM: DensityMatrix, GM: GateMatrix|null) {
        this.id = 1;
        this._DM = DM.clone();
        this._GM = GM? GM.clone() : null ;
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
    // protected _pathList: GatePath[];
    constructor() {
        this._list = $state([]);
        // this._pathList = $state([]);
    }
    
    addElement(DM: DensityMatrix, GM: GateMatrix|null = null) {
        this._list.push(new BlochHistoryElement(DM, GM));
        // if (!math.isZero(GM.rotationAngle) && GM.rotationAxis != null){
        //     this._pathList.push(new GatePath(DM.blochV, GM.rotationAxis, GM.rotationAngle));
        // }
    }

    get list(): BlochHistoryElement[] {
        return this._list
    }

    // get pathsList(): GatePath[] {
    //     return this._pathList;
    // }
}