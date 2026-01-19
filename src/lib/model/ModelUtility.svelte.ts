import { ComputeEngine } from '@cortex-js/compute-engine';
import {
    type Complex,
    create,
    all,
} from 'mathjs'

const config = {
    absTol: 1e-10,
}
export const math = create(all, config)
// export type ComplexMat2x2<2,2> = [[Complex, Complex], [Complex, Complex]];
// export type ComplexMat2x2<2,2> = Array<Array<Complex>>
export type ComplexMatRxC<R extends number, C extends number> = Complex[][] & { length: R;[index: number]: { length: C; } };
export type ComplexMat = Complex[][];

export const ce = new ComputeEngine();
ce.latexDictionary = [
    ...ce.latexDictionary,
    { parse: 'gamma', latexTrigger: '\\gamma' },
];
console.log(ce.latexDictionary);


export class MatrixValidity {
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
export function print_vec(mat: ComplexMat) {
    console.log(`[${mat[0][0]},\n${mat[1][0]}]`)
}

export function dagger(mat: ComplexMat | math.Matrix) {
    return math.conj(math.transpose(mat))
}

/**
 * Creates a new 2x2 complex matrix from a flat array of 4 entries.
 * @param entries An array of 4 numbers, strings, or Complex values.
 * @returns A ComplexMat2x2<2,2> or null if the input is invalid.
 */
export function newComplexMat2x2(entries: (string | Complex | number)[]): ComplexMatRxC<2, 2> | null {
    if (!Array.isArray(entries) || entries.length !== 4) {
        return null;
    }
    const mat: ComplexMatRxC<2, 2> = [
        [math.complex(entries[0]), math.complex(entries[1])],
        [math.complex(entries[2]), math.complex(entries[3])]
    ];
    return mat;
}

/**
 * Represents a parameter for a `FancyMatrix`.
 * 
 * @class MatrixParam
 * @property {string} name - The parameter name.
 * @property {string} latexLabel - The LaTeX representation of the parameter label (e.g., `p`, `\\theta`).
 * @property {boolean} userEditable - Whether the parameter can be edited by the user.
 * @property {(newLatexValue: string, newNumericValue: Complex) => boolean} [constraint] - Optional validation function that determines if a new value is allowed.
 * 
 * @description
 * When setting `latexValue`, the update is only applied if no constraint is defined, or if the constraint function returns `true`.
 * If the constraint rejects the value, `latexValue` remains unchanged.
 * The user must remember to check if constraints are respected.
 * 
 * @example
 * const param = new MatrixParam('p', '0.5', 'p', true, (val) => parseFloat(val) >= 0 && parseFloat(val) <= 1);
 * param.latexValue = '0.7'; // Accepted
 * param.latexValue = '1.5'; // Rejected, latexValue stays '0.7'
 */
export class MatrixParam {
    name: string;
    #latexValue: string;
    latexLabel: string;
    userEditable: boolean;
    constraint?: (newLatexValue: string, newNumericValue: Complex) => [boolean, string | null];
    isConsistent: boolean;
    userMessage: string | null;

    constructor(name: string, latexValue: string, latexLabel: string, userEditable: boolean, constraint?: (newLatexValue: string, newNumericValue:Complex) => [boolean, string | null]) {
        this.name = name;
        this.#latexValue = latexValue;
        this.latexLabel = latexLabel;
        this.userEditable = userEditable;
        this.constraint = constraint;
        this.isConsistent = true;
        this.userMessage = null;
    }

    get latexValue() {
        return this.#latexValue;
    }

    set latexValue(newV: string) {
        let computed = ce.parse(newV).N()
        console.log(`newV: ${newV} computed: ${computed}`);
        if (this.constraint === undefined) {

            this.#latexValue = newV;
            this.isConsistent = true;
            this.userMessage = null;
        }
        else {
            const parsedVal = ce.parse(newV).N();
            const num = math.complex(parsedVal.re, parsedVal.im)
            const [valid, message] = this.constraint(newV, num);
            this.isConsistent = valid;
            this.userMessage = message;
            if (valid) {
                this.#latexValue = newV;
            }
        }
    }

    clone(): MatrixParam {
        return new MatrixParam(this.name, this.#latexValue, this.latexLabel, this.userEditable, this.constraint)
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

