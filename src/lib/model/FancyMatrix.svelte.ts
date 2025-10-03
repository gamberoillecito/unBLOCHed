import { ComputeEngine } from '@cortex-js/compute-engine';
import type { Complex } from 'mathjs';
import { type ComplexMat, MatrixParam, math, MatrixValidity } from './ModelUtility.svelte';

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
        for (const p of this._parameter_array) {
            this.ce.box(p.name).value = p.latexValue;
        }
        // We need to tell the ComputeEngine how to
        // deal with placeholders (not really necessary for now
        // since we strip them away in DynamicMatrix.svelte)
        this.ce.latexDictionary = [
            ...this.ce.latexDictionary,
            {
                latexTrigger: '\\placeholder',
                // @ts-expect-error No type available
                parse: (parser) => {
                    parser.parseOptionalGroup();
                    return parser.parseGroup() ?? ['Error', "'missing'"];
                },
            },
        ];
        let generatedMatrix = this.generateMatrixFromLatex(latexMat, latexMult);
        const res = this.validateMatrix(generatedMatrix);
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
        const editableParams = this.parameterArray.filter(x => x.userEditable);
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
        return Array.from({ length: this._nRows }, () => Array.from({ length: this._nCols }, () => '0')
        );
    }
    protected fallbackLatexMult(): string {
        return '1';
    }

    // Updates _mat if it is a new valid matrix
    setMatrixValue(newMat: ComplexMat): MatrixValidity {
        const res = this.validateMatrix(newMat);

        if (res.isValid) {
            // If the value of a matrix element I have to invalidate the
            // multiplier and apply it to each element
            this._latexMult = '1';
            for (let i = 0; i < this._nRows; i++) {
                for (let j = 0; j < this._nCols; j++) {
                    const newElement = newMat[i][j];
                    // Do not update if value is unchanged
                    if (math.equal(newElement, this._mat[i][j])) {
                        continue;
                    }
                    this._mat[i][j] = newElement;
                    this._latexMat[i][j] = math.round(newElement, 2).toString();
                }
            }
        }
        return res;
    }

    // Update element i,j to value and reflect the changes in the latex
    setValue(value: Complex, i: number, j: number): MatrixValidity {
        const newMat = this._mat.map(row => row.map(el => math.clone(el))) as ComplexMat;

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
        const newMat = this.generateMatrixFromLatex(newLatexMat, mult);
        const res = this.validateMatrix(newMat);
        if (res.isValid) {
            for (let i = 0; i < this._nRows; i++) {
                for (let j = 0; j < this._nCols; j++) {
                    this._mat[i][j] = newMat[i][j];
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

        const newMat = newLatexMat.map((row) => row.map((el) => {

            for (const p of this._parameter_array) {
                this.ce.box(p.name).value = this.ce.parse(p.latexValue).N();

            }
            const converted = this.ce.parse(el).N();
            // console.log(converted);
            return math.complex(converted.re, converted.im);
        }
        )) as ComplexMat;

        const eval_mult = this.ce.parse(mult).N();
        const computedMult = math.complex(eval_mult.re, eval_mult.im);
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
                const el = newMat[i][j];

                if (math.typeOf(el) != 'Complex' ||
                    el.valueOf() == 'Infinity') {

                    return new MatrixValidity(false, `Invalid input`);
                }
            }
        }
        return new MatrixValidity(true, '');
    }

    setParameterLatex(paramName: string, latexValue: string) {
        const targetParam = this._parameter_array.find(p => p.name == paramName);
        if (targetParam) {
            targetParam.latexValue = latexValue;
        }
        else {
            console.error(`Wrong matrix parameter name ${paramName}`);
        }
        const res = this.setMatrixFromLatex(this._latexMat, this._latexMult);
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
        this._label = val;
    }

    get extendedLabel(): string {
        return this._extendedLabel;
    }
    set extendedLabel(val: string) {
        this._extendedLabel = val;
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
        return math.transpose(this._mat);
    }

    clone(): this {
        // I have to reconstruct a latex matrix without any approximation
        // let completeLateMat = this._mat.map(row => row.map( x => x.toString()))
        // constructor(latexMat: string[][], latexMult: string, label: string, parameters: MatrixParam[] = []){
        const cl = new (this.constructor as new (latexMat: string[][], latexMult: string, label: string, parameters: MatrixParam[], mat?: ComplexMat) => this)(this._latexMat, this._latexMult, this.label, this._parameter_array, this._mat);
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
            return `\\placeholder[${name}]{${v}}`;
        }
        let base = `${this.extendedLabel} = `;
        const multString = (readOnly && this.latexMult == '1') ? '' : `${valueFormatter(this.latexMult, 'mult')}`;
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
        base += '\\end{bmatrix}';
        return base;

    }

}
