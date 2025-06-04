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

export class DensityMatrix {
    #latexMult: string;
    #mat: ComplexMat2x2;
    latexMat: (string)[][];
    #a: Complex; 
    #b: Complex; 
    #c: Complex; 
    #d: Complex; 
    #blochV: [number, number, number];
    // Note that the values of y and z are swapped to account
    // for the fact that threejs uses a different notation
    // This *should* allow us to forget about the different
    // notation in the rest of the code

    ce: ComputeEngine;

    constructor(){
        this.ce = new ComputeEngine();
        this.#mat= $state([
            [complex(1), complex(0)], 
            [complex(0), complex(0)]
        ]);
        this.#latexMult = '1';
        this.#a = $derived(this.#mat[0][0]);
        this.#b = $derived(this.#mat[0][1]);
        this.#c = $derived(this.#mat[1][0]);
        this.#d = $derived(this.#mat[1][1]);

        this.latexMat = $state(this.#mat.map(row => row.map(el => el.toString())));
        
        this.#blochV= $derived([
        2*this.#b.re,
        2*this.#a.re - 1,
        2*this.#b.im
    ])
    }

    setValue(value: Complex, i: number, j:number) {
        this.#mat[i][j] = value;
        this.latexMat[i][j] = value.toString();
        this.#latexMult = '1';
        // If the value of a matrix element I have to invalidate the
        // multiplier and apply it to each element
        for (let i = 0; i < 2; i++){
            for (let j = 0; j < 2; j++){
                this.latexMat[i][j] = this.#mat[i][j].toString();
            }
        }
    }

    setMultLatex(latex: string){
        this.#latexMult = latex;
        let eval_mult = this.ce.parse(latex).N();
        let mult = complex(eval_mult.re, eval_mult.im);
        for (let i = 0; i < 2; i++){
            for (let j = 0; j < 2; j++){
                this.#mat[i][j]= matmul(this.#mat[i][j], mult) as Complex;
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
        this.#mat[i][j] = complex(converted.re, converted.im);
        this.latexMat[i][j] = latex;
    }

    // apply_gate(gate_mat: ComplexMat2x2 ) {
    apply_gate(gate_mat: ComplexMat2x2) {
        // let gate_mat:ComplexMat2x2 =  [
        // [complex(0), complex(1)], 
        // [complex(1), complex(0)]]

        console.log("apply gate")
        console.log("this.mat")
        print_mat(this.#mat);
        console.log("gate_mat")
        print_mat(gate_mat);
        let gate_dag = dagger(gate_mat)
        this.#mat = matmul(gate_mat, matmul(this.#mat, gate_dag)) as ComplexMat2x2;
    }



    get mat(){
        return this.#mat;
    }
    // set mat(){
    //     return this.#mat;
    // }

    get latexMult(){
        return this.#latexMult;
    }

    get blochV(){
        return this.#blochV  as [number, number, number];
    }

    get phase(){
        return 1; 
    }

    set a(value: Complex){
        this.#mat[0][0] = value;
    }
    set b(value: Complex){
        this.#mat[0][1] = value;
    }
    set c(value: Complex){
        this.#mat[1][0] = value;
    }
    set d(value: Complex){
        this.#mat[1][1] = value;
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
