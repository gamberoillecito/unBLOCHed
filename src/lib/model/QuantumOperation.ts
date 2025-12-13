import type Dice_2 from '@lucide/svelte/icons/dice-2';
import { type ComplexMatRxC, dagger, math, MatrixParam, newComplexMat2x2, print_mat } from './ModelUtility.svelte';
import { FancyMatrix, type FancyMatrixParams } from './FancyMatrix.svelte';

export class QuantumOperation {
    #operationElements: FancyMatrix[]
    #parameters: MatrixParam[]
    #name: string
    #latexLabel: string

    constructor(name: string, latexLabel: string, FMParams: FancyMatrixParams[], sharedParameters: MatrixParam[] = []) {
        this.#name = name
        this.#latexLabel = latexLabel
        this.#parameters = sharedParameters
        FMParams.map(constructorParams => constructorParams['parameters'])
        this.#operationElements = FMParams.map(params => {
            const { latexMat, latexMult, label, mat, nRows, nCols } = params;
            return new FancyMatrix(latexMat, latexMult, label, this.#parameters, mat, nRows, nCols);
        })

        for (let ek of this.#operationElements) {
            ek.parameterArray = this.#parameters
        }
        if (!this.isComplete) {
            console.error(`The elements for ${this.name} do not generate a complete operator`);
        }
        console.log(`${this.name} is complete? ${this.isComplete()}`);
         
    }
    //** Returns `true` if the elements of the quantum operation satisfy equation 8.14 of Nielsen-Chuang
    // (with the <= since we also accept non-trace preserving operations) */
    isComplete() {
        let sum = math.zeros(2, 2) as math.Matrix
        for (let ek of this.#operationElements) {
            const m = math.matrix(ek.mat)
            const mDag = dagger(m)
            sum = math.add(sum, math.multiply(mDag, m))
        }

        // I have no idea why I need to override the types ...
        const math_type_hack = sum as unknown as math.MathJsChain<math.Complex>
        if (math.smallerEq(math.re(math_type_hack) as unknown as math.Matrix, math.identity(2, 2))) {
            return true
        }

        return false 
    }

    validate() {
        return this.isComplete()
    }

    get operationElements() {
        return this.#operationElements
    }

    get name() {
        return this.#name
    }

    get latexLabel() {
        return this.#latexLabel
    }

    get parameters() {
        return this.#parameters
    }
}