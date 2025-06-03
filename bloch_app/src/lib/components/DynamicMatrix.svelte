<script lang="ts">

import type { Attachment } from 'svelte/attachments';
import type {MathfieldElement } from "mathlive";
import { getContext, setContext } from 'svelte';
import { onMount } from 'svelte';
	import { DensityMatrix, type ComplexMat2x2 } from './Model.svelte';
	import { complex, number } from 'mathjs';
	import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
	import { ComputeEngine } from '@cortex-js/compute-engine';

    let DM: DensityMatrix = getContext('densityMatrix');

    // dynMat.setLatexElements([['a', 'b'],['c', 'd']])
	const myAttachment: Attachment = (element) => {
		let mf = element as MathfieldElement;
        mf.value = '\\placeholder[mult]{1}\\cdot\\begin{bmatrix}\\placeholder[m00]{1} & \\placeholder[m01]{0}\\\\ \\placeholder[m10]{0} & \\placeholder[m11]{1}\\end{bmatrix}';
        $inspect(DM)

        $effect(()=>{
            for (let i = 0; i < 2; i++){
                for (let j = 0; j < 2; j++){
                    let newValue: string = DM.latexMat[i][j];
                    mf.setPromptValue(`m${i}${j}`, newValue, {})
                }
            }
        })

        mf.addEventListener('change', ()=>{
            // let tempMat: ComplexMat2x2 = [[complex(), complex()],[complex(), complex()]];

            for (let i = 0; i < 2; i++){
                for (let j = 0; j < 2; j++){
                    // tempMat[i][j] = complex(mf.getPromptValue(`m${i}${j}`))
                    let promptValue = mf.getPromptValue(`m${i}${j}`);
                    DM.setLatex(promptValue, i, j)
                }
            }
            // DM.mat = tempMat;
        })
		return () => {
			console.log('cleaning up');
		};
	};
</script>

<math-field {@attach myAttachment} ></math-field>