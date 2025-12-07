import type Dice_2 from '@lucide/svelte/icons/dice-2';
import { type ComplexMatRxC, math } from './ModelUtility.svelte';

class QuantumOperation {
    private operationElements: ComplexMatRxC<2,2>[]
    
    constructor(operationElements: ComplexMatRxC<2, 2>[]) {
        this.operationElements = operationElements
    }

    isComplete() {
        let sum =  math.zeros(2,2) as math.Matrix
        for (let ek of this.operationElements) {
            const m = math.matrix(ek)
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


}