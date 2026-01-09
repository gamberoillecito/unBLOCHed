import { FancyMatrix } from './FancyMatrix.svelte';
import { MatrixParam, type ComplexMatRxC, math, newComplexMat2x2, MatrixValidity } from './ModelUtility.svelte';


export class StateVector extends FancyMatrix {
    constructor(latexMat: string[][], latexMult: string, label: string, params: MatrixParam[] = [], mat?: ComplexMatRxC<2, 1>) {
        super(latexMat, latexMult, label, params, mat, 2, 1);
    }

    protected fallbackLatexMat(): string[][] {
        return [['1'], ['0']];
    }

    getDM() {
        const vec = math.matrix(this._mat);
        const DM = math.multiply(vec, math.transpose(vec));
        return newComplexMat2x2([DM.get([0, 0]), DM.get([0, 1]), DM.get([1, 0]), DM.get([1, 1])]) as ComplexMatRxC<2, 1>;
    }

    // Nielsen Chuang chapter 1.2
    validateMatrix(newMat: ComplexMatRxC<2, 1>): MatrixValidity {
        const preliminary_validation = super.validateMatrix(newMat);
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
            totalProb += math.square(newMat[i][0].toPolar().r);
        }

        const valid = math.equal(totalProb, 1) as boolean;
        return new MatrixValidity(valid, valid ? '' : 'State vector must be normalized');
    }

}
