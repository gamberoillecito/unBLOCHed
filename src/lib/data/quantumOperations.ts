import { FancyMatrix } from "$lib/model/FancyMatrix.svelte";
import { MatrixParam, newComplexMat2x2 } from "$lib/model/ModelUtility.svelte";
import { QuantumOperation } from "$lib/model/QuantumOperation";

const pParam = [new MatrixParam('p', '0.5', 'p', true)]
const gammaParam = [new MatrixParam('gamma', '0.5', '\\gamma', true)]

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
            label: 'E_2'
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