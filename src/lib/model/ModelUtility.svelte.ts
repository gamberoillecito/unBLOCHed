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
export const math = create(all, config)
// export type ComplexMat2x2<2,2> = [[Complex, Complex], [Complex, Complex]];
// export type ComplexMat2x2<2,2> = Array<Array<Complex>>
export type ComplexMatRxC<R extends number, C extends number> = Complex[][] & { length: R;[index: number]: { length: C; } };
export type ComplexMat = Complex[][];

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

