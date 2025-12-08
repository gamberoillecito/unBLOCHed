import { FancyMatrix } from "$lib/model/FancyMatrix.svelte";
import { MatrixParam, newComplexMat2x2 } from "$lib/model/ModelUtility.svelte";
import { QuantumOperation } from "$lib/model/QuantumOperation";

const pParam = [new MatrixParam('p', '0.8', 'p', true)]

export const bitFlip = new QuantumOperation(
    [
        {
            latexMat: [
                ['1', '0'],
                ['0', '1']
            ],
            latexMult: '\\sqrt{p}',
            label: 'E_0'
        },
        {
            latexMat: [
                ['0', '1'],
                ['1', '0']
            ],
            latexMult: '\\sqrt{1-p}',
            label: 'E_1'
        }
    ],
    pParam.map((x) => (x.clone()))
)