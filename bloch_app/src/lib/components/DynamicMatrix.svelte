<script lang="ts">
    import type { Attachment } from 'svelte/attachments';
    import type {MathfieldElement } from "mathlive";
    import { getContext } from 'svelte';
	import { FancyMatrix, DensityMatrix } from './Model.svelte';
	import { deepEqual } from 'mathjs';

	interface Props {
		matrixContext: string;
        validMatrix: boolean;
        label: string;
	}

	let {
        matrixContext,
        validMatrix = $bindable(),
        label
    }: Props = $props();

    let FM: FancyMatrix = getContext(matrixContext);
    let updateMatrixButton: Element;
    let updateMatrixButtonDisabled: boolean = $state(false);
    let matrixError = $state('');

    function parseMatrixField(mf: MathfieldElement): [string[][], string] {
        let matrix: string[][] = []
        for (let i = 0; i < 2; i++){
            matrix.push([]);
            for (let j = 0; j < 2; j++){
                let promptValue = mf.getPromptValue(`m${i}${j}`);
                matrix[i].push(promptValue);
            }
        }
        let mult = mf.getPromptValue('mult');
        return [matrix, mult]
    }
    // This function is run as soon as the element is loaded and
    // sets up the reactivity of the element
	const myAttachment: Attachment = (element) => {
		let mf = element as MathfieldElement;

        // Default value of the matrix input
        mf.value = `${label} = \\placeholder[mult]{${FM.latexMult}}\\begin{bmatrix}\\placeholder[m00]{${FM.latexMat[0][0]}} & \\placeholder[m01]{${FM.latexMat[0][1]}}\\\\ \\placeholder[m10]{${FM.latexMat[1][0]}} & \\placeholder[m11]{${FM.latexMat[1][1]}}\\end{bmatrix}`;

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

        // Whenever we receive user input on the page we need to check if the
        // current input generates a valid matrix and enable/disable the
        // update button accordingly
        mf.addEventListener('input', ()=> {

            // Generate a matrix starting from latex and validate it
            let parsed = parseMatrixField(mf);
            let res = FM.validateMatrix(FM.generateMatrixFromLatex(...parsed));
            updateMatrixButtonDisabled = !res.isValid;
            matrixError = res.message;
            validMatrix = true;
            // if the displayed value is different with respect to
            // one actually in the Fancy matrix we have to set the matrix
            // as invalid (user wouldn't know the real value)
            let displayed_matrix = FM.generateMatrixFromLatex(...parseMatrixField(mf));
            let matrices_equal = deepEqual(FM.mat, displayed_matrix) as unknown as boolean;
            validMatrix = validMatrix &&  matrices_equal
            updateMatrixButtonDisabled = matrices_equal;

        })
        
        // Update the FancyMatrix when the button is pressed
        updateMatrixButton.addEventListener('click', ()=>{
            // Update all the latex fields with the new value
            // TODO : optimize to avoid useless overrides
            let parsed = parseMatrixField(mf);
            let res = FM.setMatrixFromLatex(...parsed);
            validMatrix = res.isValid;
            console.log(validMatrix);
            
        })
		return () => {
			console.log('cleaning up');
		};
	};
</script>

<div>
    <button bind:this={updateMatrixButton} disabled={updateMatrixButtonDisabled}>Update</button>
    <math-field {@attach myAttachment} ></math-field>
    <p> {matrixError} </p>
</div>