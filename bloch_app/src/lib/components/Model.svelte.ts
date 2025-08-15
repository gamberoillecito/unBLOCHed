import { ComputeEngine } from '@cortex-js/compute-engine';
import {
    type Complex, 
    create,
    all,
    mod,
    multiply,
} from 'mathjs'

const config = {
    absTol: 1e-10,
}
const math = create(all, config)
export type ComplexMat2x2 = [[Complex, Complex], [Complex, Complex]];


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

function dagger(mat:ComplexMat2x2|math.Matrix) {
    return math.conj(math.transpose(mat))
}

/**
 * Creates a new 2x2 complex matrix from a flat array of 4 entries.
 * @param entries An array of 4 numbers, strings, or Complex values.
 * @returns A ComplexMat2x2 or null if the input is invalid.
 */
function newComplexMat2x2(entries: (string|Complex|number)[]): ComplexMat2x2|null {
    if (!Array.isArray(entries) || entries.length !== 4) {
        return null;
    }
    let mat: ComplexMat2x2 = [
        [math.complex(entries[0]), math.complex(entries[1])],
        [math.complex(entries[2]), math.complex(entries[3])]
    ];
    return mat;
}

export class MatrixParam {
    name: string;
    latexValue: string;
    latexLabel: string;
    userEditable: boolean;

    constructor(name: string, latexValue: string, latexLabel: string, userEditable: boolean) {
        this.name = name;
        this.latexValue = latexValue; 
        this.latexLabel = latexLabel;
        this.userEditable = userEditable;
    }

    clone() : MatrixParam {
        return new MatrixParam(this.name, this.latexValue, this.latexLabel, this.userEditable)
    }
}

// This class manages both the matematical and latex aspects
// of a 2x2 matrix for bidirectional syncing with DynamicMatrix.svelte
export class FancyMatrix {
    protected _latexMult: string; // Latex multiplier in front of the matrix
    protected _mat: ComplexMat2x2; // The "math" matrix for calculations
    protected _latexMat: (string)[][]; // The latex version of the matrix elements for display
    protected _parameter_array: MatrixParam[]; 
    protected _label: string;
    protected _labelWParams: string;
    isConsistent: boolean; // Set by the "view" to specify to others that this matrix is not consistent with what is on display
    userMessage: string|null; // Any message for the user concerning this matrix
    ce: ComputeEngine;

    constructor(latexMat: string[][], latexMult: string, label: string, parameters: MatrixParam[] = [], mat?: ComplexMat2x2){
        this.ce = new ComputeEngine();
        this._label = label;
        this.isConsistent = $state(true);
        this.userMessage = $state(null); 
        this._parameter_array = parameters;
        for (let p of this._parameter_array) {
            this.ce.box(p.name).value = p.latexValue;
        }
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
        if (!res.isValid && !mat) {
            latexMult = this.fallbackLatexMult();
            latexMat = this.fallbackLatexMat();
            generatedMatrix = this.generateMatrixFromLatex(latexMat, latexMult);
            console.error(`${this.label}: The provided parameters would result in an invalid matrix: ${res.message}`);
        }
        // If a mat (ComplexMat2x2) was passed as a parameter we trust the caller and use it as this._mat
        // This feature is used by the clone function to create an instance of the class with exactly the same values
        // It prevents the check on latexMat in cases where we truncated the values and this would result in an invalid matrix
        this._mat= $state(mat ? mat.map(row => row.map(x => math.complex(x))) as ComplexMat2x2 : generatedMatrix);

        this._latexMult = latexMult; 
        // I use map because I want to "loose" the reference from the original passed value
        // to prevent scenarios where who initiates an instance of the class passing a matrix
        // is able to edit this._latexMat by changing the value of the original matrix
        this._latexMat = $state(latexMat.map(row => row.map(x => x)));

        this._labelWParams = this.label;
        let editableParams = this.parameterArray.filter(x => x.userEditable)
        if (this.parameterArray.length > 0 && editableParams.length > 0){
            this._labelWParams += '(';
            for (let i = 0; i < editableParams.length; i++) {
                this._labelWParams += editableParams[i].latexLabel;
                if (i !== editableParams.length - 1) {
                    this._labelWParams += ", ";
                }
            }
            this._labelWParams += ')';
        }
        
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
                    if (math.equal(newElement, this._mat[i][j])){
                        continue
                    }
                    this._mat[i][j] = newElement
                    this._latexMat[i][j] = math.round(newElement, 2).toString();
                }
            } 
        }
        return res;
    }

    // Update element i,j to value and reflect the changes in the latex
    setValue(value: Complex, i: number, j:number) : MatrixValidity {
        let newMat = this._mat.map(row => row.map(el => math.clone(el))) as ComplexMat2x2;
        
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
            this.isConsistent = true;
        }
        return res;
    }

    // Given a matrix of latex strings and a latex multiplier, returns the corresponding
    // "math" matrix
    generateMatrixFromLatex(newLatexMat: (string)[][], mult: string) : ComplexMat2x2 {

        let newMat = newLatexMat.map((row)=>row.map((el) => {

            for (let p of this._parameter_array) {
                this.ce.box(p.name).value = this.ce.parse(p.latexValue).N();
                
            }
            let converted = this.ce.parse(el).N();
            // console.log(converted);
            
            
            return math.complex(converted.re, converted.im);
        }
        )) as ComplexMat2x2;

        let eval_mult = this.ce.parse(mult).N();
        let computedMult = math.complex(eval_mult.re, eval_mult.im);
        for (let i = 0; i < 2; i++){
            for (let j = 0; j < 2; j++){
                newMat[i][j]= math.multiply(newMat[i][j], computedMult) as Complex;
            }
        }   
        return newMat;
    }

    validateMatrix(newMat: ComplexMat2x2) : MatrixValidity {
        for (let i = 0; i < 2; i++){
            for (let j = 0; j < 2; j++){
                let el = newMat[i][j]
                
                if (
                    math.typeOf(el) != 'Complex' ||
                    el.valueOf() == 'Infinity'
                    ){
                    
                    return new MatrixValidity(false, `Invalid input`);
                }
            } 
        }
        return new MatrixValidity(true, '');
    }

    setParameterLatex(paramName: string, latexValue: string){
        let targetParam = this._parameter_array.find(p => p.name == paramName);
        if (targetParam) {
            targetParam.latexValue = latexValue;
        }
        else {
            console.error(`Wrong matrix parameter name ${paramName}`)
        }
        let res = this.setMatrixFromLatex(this._latexMat, this._latexMult);
        return res;
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
    
    get parameterArray() {
        return this._parameter_array;
    }

    get label(): string {
        return this._label;
    }
    
    get labelWParams(): string {
        return this._labelWParams;
    }
    protected T() : ComplexMat2x2{
        /**
         * Returns the Transpose of mat
         */

        return math.transpose(this._mat)
    }

    clone(): this {
        // I have to reconstruct a latex matrix without any approximation
        // let completeLateMat = this._mat.map(row => row.map( x => x.toString()))
        // constructor(latexMat: string[][], latexMult: string, label: string, parameters: MatrixParam[] = []){
        let cl = new (this.constructor as new (latexMat: string[][], latexMult: string, label: string, parameters: MatrixParam[], mat? :ComplexMat2x2) => this)(this._latexMat, this._latexMult, this.label, this._parameter_array, this._mat);
        cl.isConsistent = this.isConsistent;
        cl.userMessage = this.userMessage;
        return cl;
        // const copy = Object.create(Object.getPrototypeOf(this));
        // Object.assign(copy, this);
    }
    
    copy(FM: this) {
        this._label = FM._label;
        this._latexMat = FM.latexMat;
        this._latexMult = FM.latexMult;
        this._mat = FM.mat;
        this._parameter_array = FM.parameterArray;
        this.isConsistent = FM.isConsistent;
        this.userMessage = FM.userMessage;
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
    // #blochV: [number, number, number];

    constructor(latexMat: string[][], latexMult: string, label: string, params: MatrixParam[] = [], mat?: ComplexMat2x2) {
        super(latexMat, latexMult, label, params, mat);
        this.#a = $derived(this._mat[0][0]);
        this.#b = $derived(this._mat[1][0]);
        this.#c = $derived(this._mat[0][1]);
        this.#d = $derived(this._mat[1][1]);

        
    //     this.#blochV= $derived([
    //     2*this.#b.re,
    //     2*this.#a.re - 1,
    //     2*this.#b.im
    // ])
    }
        
    protected fallbackLatexMat(): string[][]{
        return [['1', '0'], ['0', '0']];
    }
    // https://faculty.csbsju.edu/frioux/q-intro/BlochVectorEntropy.pdf
    get blochV(): [number, number, number]{
        // return this.#blochV  as [number, number, number];
        let pauliX = newComplexMat2x2([0, 1, 1, 0]);
        let pauliY = newComplexMat2x2([0, '-i', 'i', 0]);
        let pauliZ = newComplexMat2x2([1, 0, 0, -1]);
        // Note that the values of y and z are swapped to account
        // for the fact that threejs uses a different notation
        // This **should** allow us to forget about the different
        // notation in the rest of the code
        let paulis: ComplexMat2x2[] = [pauliX!, pauliZ!, pauliY!];
        let blochV = [];
        for (let p of paulis) {
            blochV.push(math.trace(math.multiply(this._mat, p)));
        }
        return blochV as [number, number, number];
    }

    get phi(){
        const phi = math.atan2(this.#b.im, this.#b.re);
        return (phi + 2 * Math.PI) % (2 * Math.PI);
    }

    // Validation perfomed according to Theorem 2.5 Nielsen-Chuang
    // Added also check to see if it is Hermitian but I'm not sure it is needed (
    // although without this check the matrix rho =[[1,0], [1,0]] results valid)
    // https://mathworld.wolfram.com/PositiveDefiniteMatrix.html
    validateMatrix(newMat: ComplexMat2x2) : MatrixValidity {
        let preliminary_validation = super.validateMatrix(newMat); 
        if (preliminary_validation.isValid){
            // Convert the matrix to mathjs object to
            // make operations easier
            let mat = math.matrix(newMat);


            // Hermitian
            if (!math.deepEqual(mat, dagger(mat))) {
                return new MatrixValidity(false, 'Not Hermitian')
            }

            // (2) Positive semidefinite
            let ei = math.eigs(mat).values.valueOf() as Complex[];
            
            for (let v of ei) {
                v = math.complex(v);
                
                if (math.isZero(v.im)) { // not complex
                    if (math.smallerEq(v.re, 1)  && math.largerEq(v.re, 0)){ //between 0 and 1
                        continue
                    }
                }

                // If complex, the imaginary part should be 0
                // if (typeOf(v) == 'Complex'){
                //     if (compare(v.im, 0) == 0) {
                //         console.log(`${v} is a complex`);
                //         continue;
                //     }
                // }
                // else if (typeOf(v) == 'number') {
                //     if (compare(v, 1) != 1 && isPositive(v as unknown as number)) {
                //         console.log(`${v} is a number`);
                        
                //         continue
                //     }
                // }
                console.log(math.typeOf(v));
                console.log(math.largerEq(v.re, 0));
                
                console.log(v)
                return new MatrixValidity(false, 'Not a positive operator')
                
                
                
            }

            // (1) Unitary trace
            let Tr = math.trace(math.multiply(mat, mat)) as unknown as Complex ;
            
            if (!math.isZero(Tr.im)) {
                console.log(Tr);
                console.log(math.typeOf(Tr));
                
                
                console.error(`The matrix has imaginary trace ${Tr}, this should be caught by the other checks`)
                return new MatrixValidity(false, 'Negative eigenvalues, please report this to the developer')
            }

            if (math.compare(Tr.re, 1) == 1){
                return new MatrixValidity(false, `$\\operatorname{Tr}[\\rho^2] > 1$`)
            }


            return new MatrixValidity(true);
        }
        return preliminary_validation
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
        let newMat = math.multiply(gate_mat, math.multiply(this._mat, gate_dag)) as ComplexMat2x2;
        let res = this.setMatrixValue(newMat);
        
    }

    L(){
        return math.sqrt(this.blochV[0]^2 + this.blochV[1]^2 + this.blochV[2]^2)
    }
}

export class FakeDensityMatrix extends DensityMatrix {
    private _phi: number;
    private _theta: number;
    private _length: number;
    constructor(latexMat: string[][], latexMult: string, label: string, params: MatrixParam[] = [], mat?: ComplexMat2x2) {
        super(latexMat, latexMult, label, params, mat);
        this._phi = $state(0);
        this._theta = $state(0);
        this._length = $state(1);
    }
    
    get phi() {
        return this._phi;
    }

    set phi(p: number) {
        this._phi = math.mod(p, math.multiply(2, math.pi));
    }

    get theta() {
        return this._theta;
    }

    set theta(t: number) {
        this._theta = math.mod(t, math.multiply(2, math.pi));
    }
    
    get length() {
        return this._length;
    }
    
    
    set length(v : number) {
        this._length = math.min(math.max(v, 0), 1);
    }
    

        
    get blochV() : [number, number, number] {
        const x = this.length * Math.sin(this.theta) * Math.cos(this.phi);
        const y = this.length * Math.sin(this.theta) * Math.sin(this.phi);
        const z = this.length * Math.cos(this.theta);
        console.log([x,z,y]);
        return [x, z, y];
    }
}

export class GateMatrix extends FancyMatrix {
    constructor(latexMat: string[][], latexMult: string, label: string, params: MatrixParam[] = [], mat?: ComplexMat2x2) {
        super(latexMat, latexMult, label, params, mat);
    }
    protected fallbackLatexMat(): string[][]{
        return [['1', '0'], ['0', '1']];
    }

    validateMatrix(newMat: ComplexMat2x2) : MatrixValidity {
        let preliminary_validation = super.validateMatrix(newMat); 
        if (!preliminary_validation.isValid){
            return preliminary_validation;
        }
        // Check if the matrix is unitary Nielsen-Chuang pag.18
        //" Amazingly, this unitarity constraint is the only constraint on quantum gates. Any
        //  unitary matrix specifies a valid quantum gate! "
        let mTm = math.multiply(newMat, dagger(newMat));
        if (!math.deepEqual(mTm, math.identity(2))) {
            return new MatrixValidity(false, "Not unitary")
        }
        return new MatrixValidity(true);
    }

    get rotationAngle() : number {
        let O = math.matrix(this._mat);
        let e_ia = math.complex(math.sqrt(math.det(O)));
        e_ia.im *= -1;

        let argAcos = math.multiply(e_ia, math.divide(math.trace(O), 2)) as Complex;
        let theta = math.multiply(math.acos(argAcos), 2) as number;
        
        return theta;
    }
    
    // Based on this answer
    // https://quantumcomputing.stackexchange.com/a/16538
    get rotationAxis() : [number, number, number]|null {
        let pauliX = newComplexMat2x2([0, 1, 1, 0]);
        let pauliY = newComplexMat2x2([0, '-i', 'i', 0]);
        let pauliZ = newComplexMat2x2([1, 0, 0, -1]);
        // Note that the values of y and z are swapped to account
        // for the fact that threejs uses a different notation
        // This **should** allow us to forget about the different
        // notation in the rest of the code
        let paulis: ComplexMat2x2[] = [pauliX!, pauliZ!, pauliY!];

        let O = math.matrix(this._mat);
        let e_ia = math.complex(math.sqrt(math.det(O)));
        e_ia.im *= -1;

        let theta = this.rotationAngle;

        let rotVect: number[] = [];
        for (let p of paulis) {
            let num = math.multiply(e_ia, math.trace(math.multiply(O, p))) as Complex;
            let den = math.multiply(math.complex('2i'), math.sin(theta/2)) as Complex;
            // den2 is an attempt at simplify the denominator by substituting the value of theta (done by wolfram:
            // https://www.wolframalpha.com/input?i=sin%28%282*acos%28exp%28-i+alpha%29+*+B%2F2%29%29%2F2%29)
            let den2 = math.sqrt(math.subtract(1, math.complex(math.multiply(1/4, math.exp(2) as number, e_ia, math.trace(O)/2) as Complex)) as Complex)
            rotVect.push(math.divide(num, den) as number);
        }
        
        if (math.isZero(rotVect[0]) && 
            math.isZero(rotVect[1]) && 
            math.isZero(rotVect[2])){
            return null;
        }
        return rotVect as [number, number, number];
    }

}
export class GatePath {
    startingPoint: [number, number, number];
    axis: [number, number, number];
    angle: number;
    
    constructor(startingPoint: [number, number, number], axis: [number, number, number], angle: number){
        this.startingPoint = startingPoint;
        this.axis = axis;
        this.angle = angle;
    }
}