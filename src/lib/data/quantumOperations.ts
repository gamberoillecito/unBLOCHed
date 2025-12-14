import { FancyMatrix } from "$lib/model/FancyMatrix.svelte";
import { MatrixParam, newComplexMat2x2, math, ce } from "$lib/model/ModelUtility.svelte";
import { QuantumOperation } from "$lib/model/QuantumOperation.svelte";

const pParam = [new MatrixParam('p', '0.5', 'p', false, (newLatexValue) => {
    const parsedVal = ce.parse(newLatexValue).N().value;
    
    if (math.typeOf(parsedVal) !== 'number') {
        return [false, 'Invalid input']
    }
    if (math.smallerEq(math.number(newLatexValue) , 1) as boolean && math.smallerEq(0, math.number(newLatexValue)) as boolean) {
        return [true, null]
    }
    return [false, "p must be between 0 and 1"]
})]
const gammaParam = [new MatrixParam('gamma', '0.5', '\\gamma', false)]

export const bitFlipCh = new QuantumOperation(
    'Bit Flip Channel',
    '',
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

export const phaseFlipCh = new QuantumOperation(
    'Phase Flip Channel',
    '',
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
                ['1', '0'],
                ['0', '-1']
            ],
            latexMult: '\\sqrt{1-p}',
            label: 'E_1'
        }
    ],
    pParam.map((x) => (x.clone()))
)

export const bitPhaseFlipCh = new QuantumOperation(
    'Bit-Phase Flip Channel',
    '',
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
                ['0', '-i'],
                ['i', '0'],
            ],
            latexMult: '\\sqrt{1-p}',
            label: 'E_1'
        }
    ],
    pParam.map((x) => (x.clone()))
)

// Nielsen Chuang p.379, eq. 8.103
export const depolarizingCh = new QuantumOperation(
    'Depolarizing Channel',
    '',
    [
        {
            latexMat: [
                ['1', '0'],
                ['0', '1']
            ],
            latexMult: '\\sqrt{1-p}',
            label: 'E_0'
        },
        {
            latexMat: [
                ['0', '-i'],
                ['i', '0']
            ],
            latexMult: '\\sqrt{\\frac{p}{3}}',
            label: 'E_1'
        },
        {
            latexMat: [
                ['1', '0'],
                ['0', '-1']
            ],
            latexMult: '\\sqrt{\\frac{p}{3}}',
            label: 'E_2'
        },
        {
            latexMat: [
                ['0', '1'],
                ['1', '0'],
            ],
            latexMult: '\\sqrt{\\frac{p}{3}}',
            label: 'E_3'
        }
    ],
    pParam.map((x) => (x.clone()))
)

export const amplitudeDamping = new QuantumOperation(
    'Amplitude damping',
    '',
    [
        {
            latexMat: [
                ['1', '0'],
                ['0', '\\sqrt{1-\\gamma}']
            ],
            latexMult: '1',
            label: 'E_0'
        },
        {
            latexMat: [
                ['0', '\\sqrt{\\gamma}'],
                ['0', '0']
            ],
            latexMult: '1',
            label: 'E_1'
        }
    ],
    gammaParam.map((x) => (x.clone()))
)
export const noiseChannels = [bitFlipCh, phaseFlipCh, bitPhaseFlipCh, depolarizingCh, amplitudeDamping]
// export const noiseChannels = [bitFlipCh, phaseFlipCh]