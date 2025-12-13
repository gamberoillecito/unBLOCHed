import type Dice_2 from '@lucide/svelte/icons/dice-2';
import { type ComplexMatRxC, dagger, math, MatrixParam, MatrixValidity, newComplexMat2x2, print_mat } from './ModelUtility.svelte';
import { FancyMatrix, type FancyMatrixParams } from './FancyMatrix.svelte';
import { update } from 'three/examples/jsm/libs/tween.module.js';

export class QuantumOperation {
    #operationElements: FancyMatrix[]
    #sharedParameters: MatrixParam[]
    #name: string
    #latexLabel: string
    #isConsistent: boolean
    #userMessage: string | null

    constructor(name: string, latexLabel: string, FMParams: FancyMatrixParams[], sharedParameters: MatrixParam[] = []) {
        this.#name = name
        this.#latexLabel = latexLabel
        this.#sharedParameters = sharedParameters

        this.#isConsistent = $state(true);
        this.#userMessage = $state(null);
        FMParams.map(constructorParams => constructorParams['parameters'])

        this.#operationElements = FMParams.map(params => {
            const { latexMat, latexMult, label, mat, nRows, nCols } = params;
            return new FancyMatrix(latexMat, latexMult, label, this.#sharedParameters, mat, nRows, nCols);
        })

        for (let ek of this.#operationElements) {
            ek.parameterArray = this.#sharedParameters
        }
        if (!this.isComplete()) {
            console.error(`The elements for ${this.name} do not generate a complete operator`);
        }

    }
    //** Returns `true` if the elements of the quantum operation satisfy equation 8.14 of Nielsen-Chuang
    // (with the <= since we also accept non-trace preserving operations)
    // */
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

    //**
    // This function forcefully overwrites the operation elements of the QuantumOperation
    // and returns a boolean indicating wether the quantum opereation is left in a valid state or not.
    // It should not be used on user-facing QuantumOperations but it is needed to check if a clone of 
    // a user-facing QuantumOperation is still valid after editing it in some way (e.g. changing the values
    // of some parameters) */
    overwriteOperationElements(newElements: FancyMatrix[]) {
        this.#operationElements = newElements;
        return this.validate();
    }

    get name() {
        return this.#name;
    }

    get latexLabel() {
        return this.#latexLabel;
    }

    get parameters() {
        return this.#sharedParameters;
    }

    get isConsistent() {
        return this.#isConsistent;
    }

    get userMessage() {
        return this.#userMessage;
    }

    setParameter(name: string, newLatexValue: string): boolean {

        const paramOfInterest = this.#sharedParameters.find(x => x.name == name)
        if (!paramOfInterest) {
            console.error(`Parameter ${name} is not present in ${this.name}`);
            return false;
        }

        paramOfInterest.latexValue = newLatexValue

        for (let ek of this.#operationElements) {
            const res = ek.setParameterLatex(name, newLatexValue);
            console.log(res);

            if (!res.isValid) {
                this.#isConsistent = false;
                this.#userMessage = 'Invalid input';
                return false;
            }
        }
        this.#isConsistent = true;
        this.#userMessage = null;
        return true;


        // const updatedParams = this.#sharedParameters.map(x => {
        //     if (x.name != name) { return x }
        //     else {
        //         let newx = x.clone();
        //         newx.latexValue = newLatexValue;
        //         return newx
        //     }
        // })
        // const testQO = new QuantumOperation('test', 'test', [], updatedParams);

        // const success = testQO.overwriteOperationElements(this.operationElements);
        // if (success) {
        //     this.#sharedParameters = updatedParams
        //     return true;
        // }
        // else {
        //     return false;
        // }
    }
}