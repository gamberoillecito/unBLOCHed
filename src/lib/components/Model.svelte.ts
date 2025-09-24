import { ComputeEngine } from '@cortex-js/compute-engine';
import {
    type Complex,
    create,
    all,
    complex,
} from 'mathjs'
import { mul } from 'three/tsl';

const config = {
    absTol: 1e-10,
}
const math = create(all, config)
// export type ComplexMat2x2<2,2> = [[Complex, Complex], [Complex, Complex]];
// export type ComplexMat2x2<2,2> = Array<Array<Complex>>
type ComplexMatRxC<R extends number, C extends number> = Complex[][] & { length: R;[index: number]: { length: C; } };
type ComplexMat = Complex[][];

class MatrixValidity {
    isValid: boolean;
    message: string;

    constructor(valid: boolean, message: string = '') {
        this.isValid = valid;
        this.message = message
    }
}
export function print_mat(mat: ComplexMatRxC<2, 2>) {
    console.log(`[${mat[0][0]}, ${mat[0][1]},\n${mat[1][0]}, ${mat[1][1]}]`)
}

function dagger(mat: ComplexMat | math.Matrix) {
    return math.conj(math.transpose(mat))
}

/**
 * Creates a new 2x2 complex matrix from a flat array of 4 entries.
 * @param entries An array of 4 numbers, strings, or Complex values.
 * @returns A ComplexMat2x2<2,2> or null if the input is invalid.
 */
function newComplexMat2x2(entries: (string | Complex | number)[]): ComplexMatRxC<2, 2> | null {
    if (!Array.isArray(entries) || entries.length !== 4) {
        return null;
    }
    let mat: ComplexMatRxC<2, 2> = [
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

    clone(): MatrixParam {
        return new MatrixParam(this.name, this.latexValue, this.latexLabel, this.userEditable)
    }
}

// This class manages both the matematical and latex aspects
// of a 2x2 matrix for bidirectional syncing with DynamicMatrix.svelte
export class FancyMatrix {
    protected _latexMult: string; // Latex multiplier in front of the matrix
    protected _mat: ComplexMat; // The "math" matrix for calculations
    protected _latexMat: (string)[][]; // The latex version of the matrix elements for display
    protected _parameter_array: MatrixParam[];
    protected _label: string;
    protected _labelWParams: string;
    //** Equal to _label bydefault, can be set by children classes to something else e.g. rho(|0>) for DensityMatrix */
    protected _extendedLabel: string;
    protected _nRows: number;
    protected _nCols: number;

    isConsistent: boolean; // Set by the "view" to specify to others that this matrix is not consistent with what is on display
    userMessage: string | null; // Any message for the user concerning this matrix
    ce: ComputeEngine;

    constructor(latexMat: string[][], latexMult: string, label: string, parameters: MatrixParam[] = [], mat?: ComplexMat, nRows: number = 2, nCols: number = 2) {
        this.ce = new ComputeEngine();
        this._label = label;
        this.isConsistent = $state(true);
        this.userMessage = $state(null);
        this._parameter_array = parameters;
        this._nRows = nRows;
        this._nCols = nCols;
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
        // If a mat (ComplexMat2x2<2,2>) was passed as a parameter we trust the caller and use it as this._mat
        // This feature is used by the clone function to create an instance of the class with exactly the same values
        // It prevents the check on latexMat in cases where we truncated the values and this would result in an invalid matrix
        this._mat = $state(mat ? mat.map(row => row.map(x => math.complex(x))) as ComplexMat : generatedMatrix);

        this._latexMult = latexMult;
        // I use map because I want to "loose" the reference from the original passed value
        // to prevent scenarios where who initiates an instance of the class passing a matrix
        // is able to edit this._latexMat by changing the value of the original matrix
        this._latexMat = $state(latexMat.map(row => row.map(x => x)));

        this._labelWParams = this.label;
        let editableParams = this.parameterArray.filter(x => x.userEditable)
        if (this.parameterArray.length > 0 && editableParams.length > 0) {
            this._labelWParams += '(';
            for (let i = 0; i < editableParams.length; i++) {
                this._labelWParams += editableParams[i].latexLabel;
                if (i !== editableParams.length - 1) {
                    this._labelWParams += ", ";
                }
            }
            this._labelWParams += ')';

        }
        this._extendedLabel = this.labelWParams;

    }
    // Fallback values to set the matrix in case something breaks when initializing the class
    protected fallbackLatexMat(): string[][] {
        // Create an nRows x nCols matrix filled with "0"
        return Array.from({ length: this._nRows }, () =>
            Array.from({ length: this._nCols }, () => '0')
        );
    }
    protected fallbackLatexMult(): string {
        return '1';
    }

    // Updates _mat if it is a new valid matrix
    setMatrixValue(newMat: ComplexMat): MatrixValidity {
        let res = this.validateMatrix(newMat);

        if (res.isValid) {
            // If the value of a matrix element I have to invalidate the
            // multiplier and apply it to each element
            this._latexMult = '1';
            for (let i = 0; i < this._nRows; i++) {
                for (let j = 0; j < this._nCols; j++) {
                    let newElement = newMat[i][j];
                    // Do not update if value is unchanged
                    if (math.equal(newElement, this._mat[i][j])) {
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
    setValue(value: Complex, i: number, j: number): MatrixValidity {
        let newMat = this._mat.map(row => row.map(el => math.clone(el))) as ComplexMat;

        newMat[i][j] = value;
        return this.setMatrixValue(newMat);
    }


    setMatrixFromLatex(newLatexMat: (string)[][], mult: string): MatrixValidity {
        // If a multiplier is present in the matrix, use it to calculate
        // the real value of the matrix element
        // The element of the latex matrix ignores the presence of the multiplier
        // let complete_expr = `(${mult}) * (${latex})`; 
        // console.info(complete_expr);

        // First we have to compute the resulting "math" matrix to check if it would be
        // valid
        let newMat = this.generateMatrixFromLatex(newLatexMat, mult);
        let res = this.validateMatrix(newMat);
        if (res.isValid) {
            for (let i = 0; i < this._nRows; i++) {
                for (let j = 0; j < this._nCols; j++) {
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
    generateMatrixFromLatex(newLatexMat: (string)[][], mult: string): ComplexMat {

        let newMat = newLatexMat.map((row) => row.map((el) => {

            for (let p of this._parameter_array) {
                this.ce.box(p.name).value = this.ce.parse(p.latexValue).N();

            }
            let converted = this.ce.parse(el).N();
            // console.log(converted);


            return math.complex(converted.re, converted.im);
        }
        )) as ComplexMat;

        let eval_mult = this.ce.parse(mult).N();
        let computedMult = math.complex(eval_mult.re, eval_mult.im);
        for (let i = 0; i < this._nRows; i++) {
            for (let j = 0; j < this._nCols; j++) {
                // console.log(`(${i}, ${j}) -> ${newMat[i][j]}`);

                newMat[i][j] = math.multiply(newMat[i][j], computedMult) as Complex;
            }
        }
        return newMat;
    }

    validateMatrix(newMat: ComplexMat): MatrixValidity {
        for (let i = 0; i < this._nRows; i++) {
            for (let j = 0; j < this._nCols; j++) {
                let el = newMat[i][j]

                if (
                    math.typeOf(el) != 'Complex' ||
                    el.valueOf() == 'Infinity'
                ) {

                    return new MatrixValidity(false, `Invalid input`);
                }
            }
        }
        return new MatrixValidity(true, '');
    }

    setParameterLatex(paramName: string, latexValue: string) {
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

    get mat() {
        return this._mat;
    }
    get latexMat() {
        return this._latexMat;
    }
    get latexMult() {
        return this._latexMult;
    }

    get parameterArray() {
        return this._parameter_array;
    }

    get label(): string {
        return this._label;
    }
    set label(val: string) {
        this._label = val
    }

    get extendedLabel(): string {
        return this._extendedLabel;
    }
    set extendedLabel(val: string) {
        this._extendedLabel = val
    }


    get labelWParams(): string {
        return this._labelWParams;
    }

    get nRows() {
        return this._nRows;
    }

    get nCols() {
        return this._nCols;
    }

    protected T(): ComplexMat {
        /**
         * Returns the Transpose of mat
         */

        return math.transpose(this._mat)
    }

    clone(): this {
        // I have to reconstruct a latex matrix without any approximation
        // let completeLateMat = this._mat.map(row => row.map( x => x.toString()))
        // constructor(latexMat: string[][], latexMult: string, label: string, parameters: MatrixParam[] = []){
        let cl = new (this.constructor as new (latexMat: string[][], latexMult: string, label: string, parameters: MatrixParam[], mat?: ComplexMat) => this)(this._latexMat, this._latexMult, this.label, this._parameter_array, this._mat);
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
        this._extendedLabel = FM._extendedLabel;
        this._mat = FM.mat;
        this._parameter_array = FM.parameterArray;
        this.isConsistent = FM.isConsistent;
        this.userMessage = FM.userMessage;
        this._labelWParams = FM.labelWParams;
        this.ce = FM.ce;
    }

    generateLatexString(readOnly = false) {
        // returns the appropriate value depending on wheter the
        // generated latex should give a readonly field or a field with placeholders
        // v is the value to display and name is the name of the placeholder
        function valueFormatter(v: string, name: string) {
            if (readOnly) {
                return v;
            }
            return `\\placeholder[${name}]{${v}}`
        }
        let base = `${this.extendedLabel} = `
        let multString = (readOnly && this.latexMult == '1') ? '' : `${valueFormatter(this.latexMult, 'mult')}`;
        base += multString;
        base += ` \\begin{bmatrix}`;
        for (let i = 0; i < this.nRows; i++) {
            for (let j = 0; j < this.nCols; j++) {
                base += `${valueFormatter(this.latexMat[i][j], `m${i}${j}`)}`;
                if (j < this.nCols - 1) {
                    base += ` & `;
                }
            }

            if (i < this.nRows - 1) {
                base += ` \\\\ `;
            }
        }
        base += '\\end{bmatrix}'
        return base;

    }

}

export class DensityMatrix extends FancyMatrix {
    #a: Complex;
    #b: Complex;
    #c: Complex;
    #d: Complex;
    _SV: StateVector;
    // Note that the values of y and z are swapped to account
    // for the fact that threejs uses a different notation
    // This **should** allow us to forget about the different
    // notation in the rest of the code
    // #blochV: [number, number, number];

    constructor(latexMat: string[][], latexMult: string, label: string, params: MatrixParam[] = [], mat?: ComplexMatRxC<2, 2>) {
        super(latexMat, latexMult, label, params, mat);
        this._extendedLabel = `\\rho^{${label}}`;
        this.#a = $derived(this._mat[0][0]);
        this.#b = $derived(this._mat[1][0]);
        this.#c = $derived(this._mat[0][1]);
        this.#d = $derived(this._mat[1][1]);
        // Create new state vector with the truncated latex display
        let sv = this.getStateVector()
        // //////// //
        // WARNING: //
        // //////// //
        // A bit of an hack necessary when creating a new DM which represents a mixed state (e.g. done when adding
        // a mixed state to the history). If the state is mixed then the associated state vector defaults to |0>.
        // I think this is better than having to deal with `null` StateVectors inside DensityMatrix since we
        // are making sure that when the state is mixed the StateVector display is hidden
        this._SV = new StateVector(sv ? sv.map(row => row.map(x => math.round(x, 2).toString())): [['1'], ['0']], '1', this.label, undefined, this.getStateVector() as ComplexMatRxC<2, 1>);
    }

    protected fallbackLatexMat(): string[][] {
        return [['1', '0'], ['0', '0']];
    }
    // https://faculty.csbsju.edu/frioux/q-intro/BlochVectorEntropy.pdf
    get blochV(): [number, number, number] {
        // return this.#blochV  as [number, number, number];
        let pauliX = newComplexMat2x2([0, 1, 1, 0]);
        let pauliY = newComplexMat2x2([0, '-i', 'i', 0]);
        let pauliZ = newComplexMat2x2([1, 0, 0, -1]);
        // Note that the values of y and z are swapped to account
        // for the fact that threejs uses a different notation
        // This **should** allow us to forget about the different
        // notation in the rest of the code
        let paulis: ComplexMatRxC<2, 2>[] = [pauliX!, pauliY!, pauliZ!];
        let blochV = [];
        for (let p of paulis) {
            blochV.push(math.trace(math.multiply(this._mat, p)));
        }
        return blochV as [number, number, number];
    }

    get phi() {
        const phi = math.atan2(this.#b.im, this.#b.re);
        return (phi + 2 * Math.PI) % (2 * Math.PI);
    }

    // According to Nielsen-Chuang page 100
    isPureState(matrix: ComplexMatRxC<2, 2> | null = null): boolean {

        let mat = math.matrix(matrix ?? this._mat);
        let TrRhoSquared = math.trace(math.multiply(mat, mat)) as unknown as Complex;
        if (math.compare(TrRhoSquared.re, 1) == 1) {
            return false;
        }
        return true;

    }

    // Validation perfomed according to Theorem 2.5 Nielsen-Chuang
    // Added also check to see if it is Hermitian but I'm not sure it is needed (
    // although without this check the matrix rho =[[1,0], [1,0]] results valid)
    // https://mathworld.wolfram.com/PositiveDefiniteMatrix.html
    validateMatrix(newMat: ComplexMatRxC<2, 2>): MatrixValidity {
        let preliminary_validation = super.validateMatrix(newMat);
        if (preliminary_validation.isValid) {
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
                    if (math.smallerEq(v.re, 1) && math.largerEq(v.re, 0)) { //between 0 and 1
                        continue
                    }
                }

                return new MatrixValidity(false, 'Not a positive operator')

            }

            // (1) Unitary trace
            let Tr = math.trace(mat) as unknown as Complex;

            if (!math.isZero(Tr.im)) {
                // console.log(Tr);
                // console.log(math.typeOf(Tr));


                console.error(`The matrix has imaginary trace ${Tr}, this should be caught by the other checks`)
                return new MatrixValidity(false, 'Negative eigenvalues, please report this to the developer')
            }

            if (!math.equal(Tr.re, 1)) {
                return new MatrixValidity(false, `$\\operatorname{tr}[\\rho] \\neq 1$`)
            }


            return new MatrixValidity(true);
        }
        return preliminary_validation
    }

    copy(FM: this): void {
        super.copy(FM);
        this.updateSV();
    }

    get a() {
        return this.#a;
    }
    get b() {
        return this.#b;
    }
    get c() {
        return this.#c;
    }
    get d() {
        return this.#d;
    }

    // Applies the given gate to the DensityMatrix
    apply_gate(GM: GateMatrix) {
        // this._mat = matmul(gate_mat, matmul(this._mat, gate_mat.T())) as ComplexMat2x2<2,2>;
        let gate_mat = GM.mat
        let gate_dag = dagger(gate_mat)
        let newMat = math.multiply(gate_mat, math.multiply(this._mat, gate_dag)) as ComplexMatRxC<2, 2>;
        let res = this.setMatrixValue(newMat);

    }

    L() {
        return math.sqrt(this.blochV[0] ^ 2 + this.blochV[1] ^ 2 + this.blochV[2] ^ 2)
    }

    get SV() {
        return this._SV;
    }

    getStateVector(method: 'angles' | 'eigen' = 'eigen'): ComplexMatRxC<2, 1> | null {
        // First check if it's a pure state
        if (!this.isPureState()) {
            return null; // Can't get a state vector from a mixed state
        }

        if (method == 'angles') {
            const theta = math.acos(this.blochV[2]) as number;
            return [
                [math.complex(math.cos(theta / 2))],
                [math.complex(
                    math.multiply(
                        math.sin(theta / 2),
                        math.exp(
                            math.multiply(math.i, this.phi)
                        )
                    )
                )]]
        }
        
        else if (method == 'eigen') {
            // This method is the one adopted by Qiskit
            // https://github.com/Qiskit/qiskit/blob/stable/2.1/qiskit/quantum_info/states/densitymatrix.py#L808

            // Calculate eigendecomposition
            const eigVec = math.eigs(math.matrix(this._mat)).eigenvectors;

            // Find index of eigenvalue closest to 1
            const eigVec1 = eigVec.filter(e => math.equal(1, e.value))
            if (eigVec1.length !== 1) {
                return null
            }
            // Extract the corresponding eigenvector
            const eigVecRow = eigVec1[0].vector;
            const norm = math.norm(eigVecRow);
            // Normalize the eigenvector
            const eigVecRowNorm = math.divide(eigVecRow, norm).valueOf() as number[]

            return [[math.complex(eigVecRowNorm[0])], [math.complex(eigVecRowNorm[1])]];
        }
        else {
            console.error('Invalid method');
            return null;
        }

    }

    private updateSV() {

        const v = this.getStateVector()
        if (v != null) {
            this._SV.setMatrixValue(v)
        }
    }
    setMatrixFromLatex(newLatexMat: (string)[][], mult: string): MatrixValidity {
        const res = super.setMatrixFromLatex(newLatexMat, mult);
        if (res.isValid) {
            this.updateSV();
        }
        return res

    }
    setMatrixValue(newMat: ComplexMat): MatrixValidity {
        const res = super.setMatrixValue(newMat);
        if (res.isValid) {
            this.updateSV();
        }
        return res
    }
}

export class FakeDensityMatrix extends DensityMatrix {
    private _phi: number;
    private _theta: number;
    private _length: number;
    constructor(phi: number = 0, theta: number = 0, length: number = 1) {
        let params = [
            new MatrixParam(`theta`, `0`, `\\theta`, false),
            new MatrixParam(`phi`, `0`, `\\phi`, false),
        ];
        let latexMult = '1';
        let label = '\\rho';
        let latexMat = [
            ['\\cos^2(\\frac{\\theta}{2})', '\\frac{1}{2} \\sin(\\theta) e^{-i \\phi}'],
            ['\\frac{1}{2} \\sin(\\theta) e^{i \\phi}', '\\sin^2(\\frac{\\theta}{2})']
        ]
        super(latexMat, latexMult, label, params);
        this._phi = $state(phi);
        this._theta = $state(theta);
        this._length = $state(length);
    }

    get phi() {
        return this._phi;
    }

    set phi(p: number) {
        this._phi = math.mod(p, math.multiply(2, math.pi));
        this.setParameterLatex('phi', `${this._phi}`);
    }

    get theta() {
        return this._theta;
    }

    set theta(t: number) {
        this._theta = math.mod(t, math.multiply(2, math.pi));
        this.setParameterLatex('theta', `${this._theta}`);
    }

    get length() {
        return this._length;
    }


    set length(v: number) {
        this._length = math.min(math.max(v, 0), 1);
    }



    get blochV(): [number, number, number] {
        const x = this.length * Math.sin(this.theta) * Math.cos(this.phi);
        const y = this.length * Math.sin(this.theta) * Math.sin(this.phi);
        const z = this.length * Math.cos(this.theta);
        return [x, y, z];
    }

}

export class GateMatrix extends FancyMatrix {
    constructor(latexMat: string[][], latexMult: string, label: string, params: MatrixParam[] = [], mat?: ComplexMatRxC<2, 2>) {
        super(latexMat, latexMult, label, params, mat);
    }
    protected fallbackLatexMat(): string[][] {
        return [['1', '0'], ['0', '1']];
    }

    validateMatrix(newMat: ComplexMatRxC<2, 2>): MatrixValidity {
        let preliminary_validation = super.validateMatrix(newMat);
        if (!preliminary_validation.isValid) {
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

    get rotationAngle(): number {
        let O = math.matrix(this._mat);
        let e_ia = math.complex(math.sqrt(math.det(O)));
        e_ia.im *= -1;

        let argAcos = math.multiply(e_ia, math.divide(math.trace(O), 2)) as Complex;
        let theta = math.multiply(math.acos(argAcos), 2) as number;
        console.log(theta);
        
        return theta;
    }

    // Based on this answer
    // https://quantumcomputing.stackexchange.com/a/16538
    get rotationAxis(): [number, number, number] | null {
        let pauliX = newComplexMat2x2([0, 1, 1, 0]);
        let pauliY = newComplexMat2x2([0, '-i', 'i', 0]);
        let pauliZ = newComplexMat2x2([1, 0, 0, -1]);
        // Note that the values of y and z are swapped to account
        // for the fact that threejs uses a different notation
        // This **should** allow us to forget about the different
        // notation in the rest of the code
        let paulis: ComplexMatRxC<2, 2>[] = [pauliX!, pauliY!, pauliZ!];

        let O = math.matrix(this._mat);
        let e_ia = math.complex(math.sqrt(math.det(O)));
        e_ia.im *= -1;

        let theta = this.rotationAngle;

        let rotVect: number[] = [];
        for (let p of paulis) {
            let num = math.multiply(e_ia, math.trace(math.multiply(O, p))) as Complex;
            let den = math.multiply(math.complex('2i'), math.sin(theta / 2)) as Complex;
            // den2 is an attempt at simplify the denominator by substituting the value of theta (done by wolfram:
            // https://www.wolframalpha.com/input?i=sin%28%282*acos%28exp%28-i+alpha%29+*+B%2F2%29%29%2F2%29)
            let den2 = math.sqrt(math.subtract(1, math.complex(math.multiply(1 / 4, math.exp(2) as number, e_ia, math.trace(O) / 2) as Complex)) as Complex)
            rotVect.push(math.divide(num, den) as number);
        }

        if (math.isZero(rotVect[0]) &&
            math.isZero(rotVect[1]) &&
            math.isZero(rotVect[2])) {
            return null;
        }
        return rotVect as [number, number, number];
    }

}
export class GatePath {
    startingPoint: [number, number, number];
    axis: [number, number, number];
    angle: number;

    constructor(startingPoint: [number, number, number], axis: [number, number, number], angle: number) {
        this.startingPoint = startingPoint;
        this.axis = axis;
        this.angle = angle;
    }
}

export class StateVector extends FancyMatrix {
    constructor(latexMat: string[][], latexMult: string, label: string, params: MatrixParam[] = [], mat?: ComplexMatRxC<2, 1>) {
        super(latexMat, latexMult, label, params, mat, 2, 1);
    }

    protected fallbackLatexMat(): string[][] {
        return [['1'], ['0']];
    }

    getDM() {
        let vec = math.matrix(this._mat);
        let DM = math.multiply(vec, math.transpose(vec));
        return newComplexMat2x2([DM.get([0, 0]), DM.get([0, 1]), DM.get([1, 0]), DM.get([1, 1])]) as ComplexMatRxC<2, 1>;
    }

    // Nielsen Chuang chapter 1.2
    validateMatrix(newMat: ComplexMatRxC<2, 1>): MatrixValidity {
        let preliminary_validation = super.validateMatrix(newMat);
        if (!preliminary_validation.isValid) {
            return preliminary_validation;
        }

        // Calculate totalProb correctly from the state vector
        let totalProb = 0;
        for (let i = 0; i < this._nRows; i++) {
            // totalProb += math.add(
            //     math.square(newMat[i][0].re),
            //     math.square(newMat[i][0].im)
            // );
            totalProb += math.square(newMat[i][0].toPolar().r)
        }

        let valid = math.equal(totalProb, 1) as boolean;
        return new MatrixValidity(valid, valid ? '' : 'State vector must be normalized')
    }

}