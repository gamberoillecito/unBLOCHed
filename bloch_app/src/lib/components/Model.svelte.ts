import { ComputeEngine } from '@cortex-js/compute-engine';
import {
    complex,
    type Complex, 
    multiply as matmul,
    matrix,
    clone,
    equal,
    transpose,
    conj,
    isNumber,
    typeOf,
    trace,
    deepEqual,
    Matrix,
    eigs,
    hasNumericValue,
    isNegative,
    identity,
    
} from 'mathjs'


export type ComplexMat2x2 = [[Complex, Complex], [Complex, Complex]];

export class MatrixError extends(Error) {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, MatrixError.prototype);
    }
}

class MatrixValidity {
    isValid: boolean;
    message: string;

    constructor(valid: boolean, message: string=''){
        this.isValid = valid;
        this.message = message
    }
}
export function print_mat(mat: ComplexMat2x2) {
    console.log(`[${mat[0][0]}, ${mat[0][1]},\n${mat[1][0]}, ${mat[1][1]}]`)
}

function dagger(mat:ComplexMat2x2|Matrix) {
    return conj(transpose(mat))
}

// This class manages both the matematical and latex aspects
// of a 2x2 matrix for bidirectional syncing with DynamicMatrix.svelte
export class FancyMatrix {
    protected _latexMult: string; // Latex multiplier in front of the matrix
    protected _mat: ComplexMat2x2; // The "math" matrix for calculations
    protected _latexMat: (string)[][]; // The latex version of the matrix elements for display
    ce: ComputeEngine;

    constructor(latexMat: string[][], latexMult: string){
        this.ce = new ComputeEngine();
        // We need to tell the ComputeEngine how to
        // deal with placeholders (not really necessary for now
        // since we strip them away in DynamicMatrix.svelte)
        this.ce.latexDictionary = [
            ...this.ce.latexDictionary,
            {
                latexTrigger: '\\placeholder',
                // @ts-ignore
                parse: (parser) => {
                parser.parseOptionalGroup();
                return parser.parseGroup() ?? ['Error', "'missing'"];
                },
            },
        ];
        let generatedMatrix = this.generateMatrixFromLatex(latexMat, latexMult);
        let res = this.validateMatrix(generatedMatrix);
        if (!res.isValid) {
            latexMult = this.fallbackLatexMult();
            latexMat = this.fallbackLatexMat();
            generatedMatrix = this.generateMatrixFromLatex(latexMat, latexMult);
            console.error(`The provided parameters would result in an invalid matrix: ${res.message}`);
            
        }
        this._mat= $state(generatedMatrix);

        this._latexMult = latexMult; 
        this._latexMat = $state(latexMat);
    }
    // Fallback values to set the matrix in case something breaks when initializing the class
    protected fallbackLatexMat(): string[][]{
        return [['0', '0'], ['0', '0']];
    }
    protected fallbackLatexMult(): string {
        return  '1';
    }

    // Updates _mat if it is a new valid matrix
    setMatrixValue(newMat:ComplexMat2x2) : MatrixValidity {
        let res = this.validateMatrix(newMat);
        
        if (res.isValid) {
            // If the value of a matrix element I have to invalidate the
            // multiplier and apply it to each element
            this._latexMult = '1';
            for (let i = 0; i < 2; i++){
                for (let j = 0; j < 2; j++){
                    let newElement = newMat[i][j];
                    // Do not update if value is unchanged
                    if (equal(newElement, this._mat[i][j])){
                        continue
                    }
                    this._mat[i][j] = newElement
                    this._latexMat[i][j] = newElement.toString();
                }
            } 
        }
        return res;
    }

    // Update element i,j to value and reflect the changes in the latex
    setValue(value: Complex, i: number, j:number) : MatrixValidity {
        let newMat = this._mat.map(row => row.map(el => clone(el))) as ComplexMat2x2;
        
        newMat[i][j] = value;
        return this.setMatrixValue(newMat);
    }


    setMatrixFromLatex(newLatexMat: (string)[][], mult: string) : MatrixValidity {
        // If a multiplier is present in the matrix, use it to calculate
        // the real value of the matrix element
        // The element of the latex matrix ignores the presence of the multiplier
        // let complete_expr = `(${mult}) * (${latex})`; 
        // console.info(complete_expr);
        
        // First we have to compute the resulting "math" matrix to check if it would be
        // valid
        let newMat = this.generateMatrixFromLatex(newLatexMat, mult);
        let res = this.validateMatrix(newMat);
        if (res.isValid){
            for (let i = 0; i < 2; i++){
                for (let j = 0; j < 2; j++){
                    this._mat[i][j] = newMat[i][j]
                    this._latexMat[i][j] = newLatexMat[i][j];
                }
            }
            this._latexMult = mult;
        }
        return res;
    }

    // Given a matrix of latex strings and a latex multiplier, returns the corresponding
    // "math" matrix
    generateMatrixFromLatex(newLatexMat: (string)[][], mult: string) : ComplexMat2x2 {

        let newMat = newLatexMat.map((row)=>row.map((el) => {
            let converted = this.ce.parse(el).N();
            return complex(converted.re, converted.im);
        }
        )) as ComplexMat2x2;

        let eval_mult = this.ce.parse(mult).N();
        let computedMult = complex(eval_mult.re, eval_mult.im);
        for (let i = 0; i < 2; i++){
            for (let j = 0; j < 2; j++){
                newMat[i][j]= matmul(newMat[i][j], computedMult) as Complex;
            }
        }   
        return newMat;
    }

    validateMatrix(newMat: ComplexMat2x2) : MatrixValidity {
        for (let i = 0; i < 2; i++){
            for (let j = 0; j < 2; j++){
                let el = newMat[i][j]
                
                if (
                    typeOf(el) != 'Complex' ||
                    el.valueOf() == 'Infinity'
                    ){
                    
                    return new MatrixValidity(false, `Element (${i}, ${j}) is not a number`);
                }
            } 
        }
        return new MatrixValidity(true, '');
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
    
    T() : ComplexMat2x2{
        /**
         * Returns the Transpose of mat
         */

        return transpose(this._mat)
    }


}

export class DensityMatrix extends FancyMatrix {
    #a: Complex; 
    #b: Complex; 
    #c: Complex; 
    #d: Complex; 
    // Note that the values of y and z are swapped to account
    // for the fact that threejs uses a different notation
    // This **should** allow us to forget about the different
    // notation in the rest of the code
    #blochV: [number, number, number];

    constructor(latexMat: string[][], latexMult: string) {
        super(latexMat, latexMult);
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
        
    protected fallbackLatexMat(): string[][]{
        return [['1', '0'], ['0', '0']];
    }
    get blochV(){
        return this.#blochV  as [number, number, number];
    }

    get phase(){
        return 1; 
    }

    // Validation perfomed according to Theorem 2.5 Nilsen-Chuang
    validateMatrix(newMat: ComplexMat2x2) : MatrixValidity {
        let preliminary_validation = super.validateMatrix(newMat); 
        if (preliminary_validation.isValid){
            // Convert the matrix to mathjs object to
            // make operations easier
            let mat = matrix(newMat);

            // (1) Unitary trace
            if (trace(matmul(mat, mat)) > 1){
                return new MatrixValidity(false, 'Not unitary trace')
            }

            // // Hermitian
            // if (!deepEqual(mat, dagger(mat))) {
            //     return new MatrixValidity(false, 'Not Hermitian')
            // }

            // (2) Positive semidefinite
            let ei = eigs(mat).values.valueOf() as number[];
            
            for (let v of ei) {
                // Cannot have complex eigenvalues
                // (This check should be superfluous)
                if (!hasNumericValue(v) || isNegative(v)) {
                    return new MatrixValidity(false, 'Not a positive operator')
                }
                    
            }


            return new MatrixValidity(true);
        }
        return preliminary_validation
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

    // Applies the given gate to the DensityMatrix
    apply_gate(GM: GateMatrix) {
        // this._mat = matmul(gate_mat, matmul(this._mat, gate_mat.T())) as ComplexMat2x2;
        let gate_mat = GM.mat
        let gate_dag = dagger(gate_mat)
        this._mat = matmul(gate_mat, matmul(this._mat, gate_dag)) as ComplexMat2x2;
    }
}

export class GateMatrix extends FancyMatrix {
    constructor(latexMat: string[][], latexMult: string) {
        super(latexMat, latexMult);
    }
    protected fallbackLatexMat(): string[][]{
        return [['1', '0'], ['0', '1']];
    }

    validateMatrix(newMat: ComplexMat2x2) : MatrixValidity {
        let preliminary_validation = super.validateMatrix(newMat); 
        if (!preliminary_validation.isValid){
            return preliminary_validation;
        }
        // Check if the matrix is unitary Nilsen-Chuang pag.18
        //" Amazingly, this unitarity constraint is the only constraint on quantum gates. Any
        //  unitary matrix specifies a valid quantum gate! "
        let mTm = matmul(newMat, dagger(newMat));
        if (!deepEqual(mTm, identity(2))) {
            return new MatrixValidity(false, "Not unitary")
        }
        return new MatrixValidity(true);
    }

}