import type { Complex } from 'mathjs';
import { FancyMatrix } from './FancyMatrix.svelte';
import { MatrixParam, type ComplexMatRxC, MatrixValidity, math, dagger, newComplexMat2x2 } from './ModelUtility.svelte';


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
            return new MatrixValidity(false, "Not unitary");
        }
        return new MatrixValidity(true);
    }

    get rotationAngle(): number {
        let O = math.matrix(this._mat);
        let e_ia = math.complex(math.sqrt(math.det(O)));
        e_ia.im *= -1;

        let argAcos = math.multiply(e_ia, math.divide(math.trace(O), 2)) as Complex;
        let theta = math.multiply(math.acos(argAcos), 2) as number;

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

        if (math.isZero(theta)) {
            return null;
        }

        let rotVect: number[] = [];
        for (let p of paulis) {
            let num = math.multiply(e_ia, math.trace(math.multiply(O, p))) as Complex;
            let den = math.multiply(math.complex('2i'), math.sin(theta / 2)) as Complex;
            // den2 is an attempt at simplify the denominator by substituting the value of theta (done by wolfram:
            // https://www.wolframalpha.com/input?i=sin%28%282*acos%28exp%28-i+alpha%29+*+B%2F2%29%29%2F2%29)
            let den2 = math.sqrt(math.subtract(1, math.complex(math.multiply(1 / 4, math.exp(2) as number, e_ia, math.trace(O) / 2) as Complex)) as Complex);
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
