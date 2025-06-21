<script lang="ts">
    import "mathlive/fonts.css"
    import type { Attachment } from 'svelte/attachments';
    import "mathlive";
    import type {MathfieldElement } from "mathlive";
    import { getContext } from 'svelte';
	import { FancyMatrix, DensityMatrix, MatrixParam, print_mat } from './Model.svelte';
	import { deepEqual } from 'mathjs';
	interface Props {
		matrixContext: string;
        validMatrix: boolean;
        instantUpdate: boolean;
	}

	let {
        matrixContext,
        validMatrix = $bindable(),
        instantUpdate = false,
    }: Props = $props();

    let FM: FancyMatrix = getContext(matrixContext);
    let updateMatrixButton: Element;
    let updateMatrixButtonEnabled: boolean = $state(false);
    // Initial latex value to be set inside the MathfieldElement
    let initialValue = `${FM.label} = \\placeholder[mult]{${FM.latexMult}}\\begin{bmatrix}\\placeholder[m00]{${FM.latexMat[0][0]}} & \\placeholder[m01]{${FM.latexMat[0][1]}}\\\\ \\placeholder[m10]{${FM.latexMat[1][0]}} & \\placeholder[m11]{${FM.latexMat[1][1]}}\\end{bmatrix}`;
    let undoChangesButton: Element;
    let undoChangesButtonEnabled: boolean = $state(false);

    let matrixError = $state('');

    if (FM.parameterArray.find(p => p.userEditable) && !instantUpdate) {
        console.error("Matrices with user editable parameters must be instantUpdate")
    }
    

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
        console.log('counter');
        
        // Default value of the matrix input
        mf.value = initialValue;

        // Whenever the latex content of the FancyMatrix changes we need to update
        // what appears on screen accordingly
        $effect(()=>{
            // WARNING: the code used here is repeated also below in the undo button
            // event listener. Don't be tempted to put it in a separate function
            // otherwise this effect will not work anymore
            
            for (let i = 0; i < 2; i++){
                for (let j = 0; j < 2; j++){
                    let newValue: string = FM.latexMat[i][j];
                    let currentValue = mf.getPromptValue(`m${i}${j}`);
                    if (newValue != currentValue){
                        
                        mf.setPromptValue(`m${i}${j}`, newValue, {silenceNotifications: true})
                    }
                }
            }
            if (FM.latexMult != mf.getPromptValue('mult')){
                mf.setPromptValue(`mult`, FM.latexMult, {silenceNotifications: true})
            }
            updateMatrixButtonEnabled = false;
            
        })

        // Whenever we receive user input on the page we need to check if the
        // current input generates a valid matrix and enable/disable the
        // update button accordingly
        mf.addEventListener('input', ()=> {

            // Generate a matrix starting from latex and validate it
            let parsed = parseMatrixField(mf);
            let res = FM.validateMatrix(FM.generateMatrixFromLatex(...parsed));
            // updateMatrixButtonEnabled = res.isValid;
            matrixError = res.message;
            
            if (instantUpdate && res.isValid) {
                FM.setMatrixFromLatex(...parsed)
            }
            // if the displayed value is different with respect to
            // one actually in the Fancy matrix we have to set the matrix
            // as invalid (user wouldn't know the real value)
            let displayed_matrix = FM.generateMatrixFromLatex(...parseMatrixField(mf));
            let matrices_equal = deepEqual(FM.mat, displayed_matrix) as unknown as boolean;
            print_mat(displayed_matrix)
            print_mat(FM.mat)
            
            validMatrix = res.isValid &&  matrices_equal;
            updateMatrixButtonEnabled = !matrices_equal && res.isValid;
            undoChangesButtonEnabled = !matrices_equal;

        })
        
        // Update the FancyMatrix when the button is pressed
        updateMatrixButton.addEventListener('click', ()=>{
            // Update all the latex fields with the new value
            // TODO : optimize to avoid useless overrides
            let parsed = parseMatrixField(mf);
            let res = FM.setMatrixFromLatex(...parsed);
            validMatrix = res.isValid;
            
        })
        // The undo button overrides the current displayed value
        // and substitutes it with the actual latex value of the
        // FancyMatrix
        undoChangesButton.addEventListener('click', ()=>{
            for (let i = 0; i < 2; i++){
                for (let j = 0; j < 2; j++){
                    let newValue: string = FM.latexMat[i][j];
                    mf.setPromptValue(`m${i}${j}`, newValue, {})
                }
            }
            mf.setPromptValue(`mult`, FM.latexMult, {})
            
        })


		return () => {
			console.log('cleaning up');
		};
	};

    // Initialize the mathfield to edit the matrix parameters
	function paramAttachment(param: MatrixParam) :Attachment {
        return (element) => {
            let mf = element as MathfieldElement; 
            mf.value = `${param.latexLabel} = \\placeholder[${param.name}]{${param.latexValue}}`;
            mf.addEventListener('input', ()=> {

                let paramsNames = mf.getPrompts();
                if (paramsNames.length != 1){
                    console.error(`Matrix parameter contains more than one prompt: ${paramsNames}`)
                    return;
                }
                let paramName = paramsNames[0];
                let paramValue = mf.getPromptValue(paramName);
                let res = FM.setParameterLatex(paramName, paramValue);
                matrixError = res.message;
                validMatrix = res.isValid; 
            })
        }
    }
</script>

<style>
math-field::part(menu-toggle) {
  display: none;
}
math-field::part(virtual-keyboard-toggle) {
    display: none;
}
</style>

<div>
    <!-- Buttons that needs to be disabled if instantUpdate is true -->
    <div style={`display:${instantUpdate ? 'none':''}`}> 
        <button 
            bind:this={updateMatrixButton} 
            disabled={!updateMatrixButtonEnabled}
        >Update</button>
        <button 
            bind:this={undoChangesButton} 
            disabled={!undoChangesButtonEnabled}
        >Undo</button>
    </div>
    <math-field {@attach myAttachment} readonly></math-field>
    {#each FM.parameterArray as param, index }
        {#if param.userEditable}
        <math-field {@attach paramAttachment(param)} readonly></math-field>
        {/if}
    {/each}
    <p> {matrixError} </p>
</div>