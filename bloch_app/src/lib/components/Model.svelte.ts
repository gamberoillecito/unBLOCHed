import { ComputeEngine } from '@cortex-js/compute-engine';
import {
    complex,
    type Complex, 
    multiply as matmul,
    transpose,
    conj    
} from 'mathjs'
import { js } from 'three/tsl';

export type ComplexMat2x2 = [[Complex, Complex], [Complex, Complex]];


export function print_mat(mat: ComplexMat2x2) {
    console.log(`[${mat[0][0]}, ${mat[0][1]},\n${mat[1][0]}, ${mat[1][1]}]`)
}

function dagger(mat:ComplexMat2x2) {
    return conj(transpose(mat))
}

export class FancyMatrix {
    protected _latexMult: string;
    protected _mat: ComplexMat2x2;
    protected _latexMat: (string)[][];

    ce: ComputeEngine;

    constructor(){
        this.ce = new ComputeEngine();
        this._mat= $state([
            [complex(1), complex(0)], 
            [complex(0), complex(0)]
        ]);
        this._latexMult = '1';
        this._latexMat = $state(this._mat.map(row => row.map(el => el.toString())));
    }

    setValue(value: Complex, i: number, j:number) {
        this._mat[i][j] = value;
        this._latexMat[i][j] = value.toString();
        this._latexMult = '1';
        // If the value of a matrix element I have to invalidate the
        // multiplier and apply it to each element
        for (let i = 0; i < 2; i++){
            for (let j = 0; j < 2; j++){
                this._latexMat[i][j] = this._mat[i][j].toString();
            }
        }
    }

    setMultLatex(latex: string){
        this._latexMult = latex;
        let eval_mult = this.ce.parse(latex).N();
        let mult = complex(eval_mult.re, eval_mult.im);
        for (let i = 0; i < 2; i++){
            for (let j = 0; j < 2; j++){
                this._mat[i][j]= matmul(this._mat[i][j], mult) as Complex;
            }
        }
    }
    setLatex(latex:string, i: number, j:number) {
        // If a multiplier is present in the matrix, use it to calculate
        // the real value of the matrix element
        // The element of the latex matrix ignores the presence of the multiplier
        // let complete_expr = `(${mult}) * (${latex})`; 
        // console.info(complete_expr);
        let converted = this.ce.parse(latex).N();
        this._mat[i][j] = complex(converted.re, converted.im);
        this._latexMat[i][j] = latex;
    }

    // apply_gate(gate_mat: ComplexMat2x2 ) {
    apply_gate(gate_mat: ComplexMat2x2) {
        // let gate_mat:ComplexMat2x2 =  [
        // [complex(0), complex(1)], 
        // [complex(1), complex(0)]]

        console.log("apply gate")
        console.log("this.mat")
        print_mat(this._mat);
        console.log("gate_mat")
        print_mat(gate_mat);
        let gate_dag = dagger(gate_mat)
        this._mat = matmul(gate_mat, matmul(this._mat, gate_dag)) as ComplexMat2x2;
    }


    get mat(){
        return this._mat;
    }
    get latexMat(){
        return this._latexMat;
    }

    get latexMult(){
        return this._latexMult;
    }


}

export class DensityMatrix extends FancyMatrix {
    #a: Complex; 
    #b: Complex; 
    #c: Complex; 
    #d: Complex; 
    // Note that the values of y and z are swapped to account
    // for the fact that threejs uses a different notation
    // This *should* allow us to forget about the different
    // notation in the rest of the code
    #blochV: [number, number, number];

    constructor() {
        super()
        this.#a = $derived(this._mat[0][0]);
        this.#b = $derived(this._mat[0][1]);
        this.#c = $derived(this._mat[1][0]);
        this.#d = $derived(this._mat[1][1]);

        
        this.#blochV= $derived([
        2*this.#b.re,
        2*this.#a.re - 1,
        2*this.#b.im
    ])
    }
    get blochV(){
        return this.#blochV  as [number, number, number];
    }

    get phase(){
        return 1; 
    }

    set a(value: Complex){
        this._mat[0][0] = value;
    }
    set b(value: Complex){
        this._mat[0][1] = value;
    }
    set c(value: Complex){
        this._mat[1][0] = value;
    }
    set d(value: Complex){
        this._mat[1][1] = value;
    }

    get a(){
        return this.#a;
    }
    get b(){
        return this.#b;
    }
    get c(){
        return this.#c;
    }
    get d(){
        return this.#d;
    }
}