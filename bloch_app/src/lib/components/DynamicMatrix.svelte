<script lang="ts">
    import type { Attachment } from 'svelte/attachments';
    import type {MathfieldElement } from "mathlive";
    import { getContext } from 'svelte';
	import { FancyMatrix, DensityMatrix } from './Model.svelte';

	interface Props {
		matrixContext: string;
	}

	let {
        matrixContext 
    }: Props = $props();

    let FM: FancyMatrix = getContext(matrixContext);
    let updateMatrixButton: Element;
    // This function is run as soon as the element is loaded and
    // sets up the reactivity of the element
	const myAttachment: Attachment = (element) => {
		let mf = element as MathfieldElement;

        // Default value of the matrix input
        mf.value = '\\placeholder[mult]{1}\\begin{bmatrix}\\placeholder[m00]{1} & \\placeholder[m01]{0}\\\\ \\placeholder[m10]{0} & \\placeholder[m11]{1}\\end{bmatrix}';

        // Whenever the latex content of the FancyMatrix changes we need to update
        // what appears on screen accordingly
        $effect(()=>{
            for (let i = 0; i < 2; i++){
                for (let j = 0; j < 2; j++){
                    let newValue: string = FM.latexMat[i][j];
                    mf.setPromptValue(`m${i}${j}`, newValue, {})
                }
            }
            mf.setPromptValue(`mult`, FM.latexMult, {})
        })

        // Whenever we receive user input on the page we need to update
        // the FancyMatrix accordingly
        updateMatrixButton.addEventListener('click', ()=>{
            // Update all the latex fields with the new value
            // TODO : optimize to avoid useless overrides
            for (let i = 0; i < 2; i++){
                for (let j = 0; j < 2; j++){
                    let promptValue = mf.getPromptValue(`m${i}${j}`);
                    let res = FM.setLatex(promptValue, i, j);
                    if (!res.isValid){
                        alert(res.message)
                    }
                }
            }
            FM.setMultLatex(mf.getPromptValue('mult'));
           
        })
		return () => {
			console.log('cleaning up');
		};
	};
</script>

<button bind:this={updateMatrixButton}>Update</button>
<math-field {@attach myAttachment} ></math-field>