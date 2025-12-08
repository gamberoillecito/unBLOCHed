import type Dice_2 from '@lucide/svelte/icons/dice-2';
import { type ComplexMatRxC, math, MatrixParam } from './ModelUtility.svelte';
import { FancyMatrix, type FancyMatrixParams } from './FancyMatrix.svelte';

export class QuantumOperation {
    #operationElements: FancyMatrix[]
    #parameters: MatrixParam[]

    constructor(FMParams: FancyMatrixParams[], sharedParameters: MatrixParam[] = []) {
        this.#parameters = sharedParameters
        FMParams.map(constructorParams => constructorParams['parameters'] )
        this.#operationElements = FMParams.map(params => {
            const { latexMat, latexMult, label, mat, nRows, nCols } = params;
            return new FancyMatrix(latexMat, latexMult, label, this.#parameters, mat, nRows, nCols);
        })
        
        for (let ek of this.#operationElements) {
            ek.parameterArray = this.#parameters
        }
    }

    isComplete() {
        let sum = math.zeros(2, 2) as math.Matrix
        for (let ek of this.#operationElements) {
            const m = math.matrix(ek.mat)
            sum = math.add(sum, m)
        }

        if (!math.equal(sum, math.identity(2, 2))) {
            return false
        }

        return true
    }

    validate() {
        return this.isComplete()
    }

    get operationElements() {
        return this.#operationElements
    }

}