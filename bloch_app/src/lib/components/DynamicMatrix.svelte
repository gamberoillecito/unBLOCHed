<script lang="ts">

import type { Attachment } from 'svelte/attachments';
import type {MathfieldElement } from "mathlive";
import { getContext, setContext } from 'svelte';
import { onMount } from 'svelte';
	import { DensityMatrix, type ComplexMat2x2 } from './Model.svelte';
	import { complex, number } from 'mathjs';
	import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
	import { ComputeEngine } from '@cortex-js/compute-engine';


    let ce = new ComputeEngine();
    function setLatex(latex:string, DM: DensityMatrix, i: number, j:number) {
        let converted = ce.parse(latex).N();
        DM.mat[i][j] = complex(converted.re, converted.im)
    }


    function setLatexElements(node:MathfieldElement, latex: string[][]) {
        if (!node){
            return
        }
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                console.log(`${latex[i][j]}`)
                node.setPromptValue(`m${i}${j}`, latex[i][j], {})
            }
        }
    }

    let DM: DensityMatrix = getContext('densityMatrix')
    setLatex('2i+\\pi', DM, 1,1)

    // dynMat.setLatexElements([['a', 'b'],['c', 'd']])
	const myAttachment: Attachment = (element) => {
		let mf = element as MathfieldElement;
        mf.value = '\\placeholder[mult]{1}\\cdot\\begin{bmatrix}\\placeholder[m00]{1} & \\placeholder[m01]{0}\\\\ \\placeholder[m10]{0} & \\placeholder[m11]{1}\\end{bmatrix}';
        $inspect(DM.mat)

        $effect(()=>{
            for (let i = 0; i < 2; i++){
                for (let j = 0; j < 2; j++){
                    mf.setPromptValue(`m${i}${j}`, DM.mat[i][j].toString(), {})
                }
            }
        })

        mf.addEventListener('change', ()=>{
            let tempMat: ComplexMat2x2 = [[complex(), complex()],[complex(), complex()]];

            for (let i = 0; i < 2; i++){
                for (let j = 0; j < 2; j++){
                    tempMat[i][j] = complex(mf.getPromptValue(`m${i}${j}`))
                }
            }
            DM.mat = tempMat;
        })
		return () => {
			console.log('cleaning up');
		};
	};
</script>

<math-field {@attach myAttachment} ></math-field>