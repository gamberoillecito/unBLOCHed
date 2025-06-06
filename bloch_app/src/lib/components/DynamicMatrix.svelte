<script lang="ts">

import type { Attachment } from 'svelte/attachments';
import type {MathfieldElement } from "mathlive";
import { getContext } from 'svelte';
	import { DensityMatrix } from './Model.svelte';
	import { ComputeEngine } from '@cortex-js/compute-engine';

    let DM: DensityMatrix = getContext('densityMatrix');

	const myAttachment: Attachment = (element) => {
		let mf = element as MathfieldElement;
        mf.value = '\\placeholder[mult]{1}\\begin{bmatrix}\\placeholder[m00]{1} & \\placeholder[m01]{0}\\\\ \\placeholder[m10]{0} & \\placeholder[m11]{1}\\end{bmatrix}';
        $inspect(DM)

        $effect(()=>{
            for (let i = 0; i < 2; i++){
                for (let j = 0; j < 2; j++){
                    let newValue: string = DM.latexMat[i][j];
                    mf.setPromptValue(`m${i}${j}`, newValue, {})
                }
            }
            mf.setPromptValue(`mult`, DM.latexMult, {})
        })

        mf.addEventListener('change', ()=>{

            for (let i = 0; i < 2; i++){
                for (let j = 0; j < 2; j++){
                    let promptValue = mf.getPromptValue(`m${i}${j}`);
                    DM.setLatex(promptValue, i, j)
                }
            }
            DM.setMultLatex(mf.getPromptValue('mult'));
            let ce = new ComputeEngine();
            ce.latexDictionary = [
                ...ce.latexDictionary,
                {
                    latexTrigger: '\\placeholder',
                    // @ts-ignore
                    parse: (parser) => {
                    parser.parseOptionalGroup();
                    return parser.parseGroup() ?? ['Error', "'missing'"];
                    },
                },
                ];
            let converted = ce.parse(mf.value).N();
            // console.info(converted)
            converted.evaluate().print();
            let matrix = ce.parse(mf.value).evaluate().json;
            console.info(matrix);
        })
		return () => {
			console.log('cleaning up');
		};
	};
</script>

<math-field {@attach myAttachment} ></math-field>