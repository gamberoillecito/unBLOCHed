<script lang="ts">
    import "mathlive/fonts.css"
    import type { Attachment } from 'svelte/attachments';
    import "mathlive"
    import type {MathfieldElement } from "mathlive";
    import { getContext } from 'svelte';
	import { FancyMatrix, DensityMatrix, MatrixParam, print_mat } from './Model.svelte';
	import { deepEqual } from 'mathjs';
	import MatrixParameterInput from "./MatrixInfoInput.svelte";
    import {Button, buttonVariants, type ButtonVariant} from '$lib/components/ui/button/index.js';
    import Trash from '@lucide/svelte/icons/trash';
    import Save from '@lucide/svelte/icons/save';
    import CircleCheckBig from '@lucide/svelte/icons/circle-check-big'
    import CircleX from '@lucide/svelte/icons/circle-x';
    import { marked } from 'marked';
    import markedKatex from 'marked-katex-extension';
	import ErrorPopover from "./custom-ui/ErrorPopover.svelte";
	interface Props {
		matrixContext: string;
        instantUpdate: boolean;
        onChangeCallback?: (FM:FancyMatrix, oldFM: FancyMatrix, args:any) => void;
        onChangeArguments?: any;
	}

	let {
        matrixContext,
        instantUpdate = false,
        onChangeCallback,
        onChangeArguments
    }: Props = $props();
    
	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));

    let FM: FancyMatrix = getContext(matrixContext);
    let updateMatrixButton: HTMLElement|null = $state(null);
    let updateMatrixButtonEnabled: boolean = $state(false);
    // Initial latex value to be set inside the MathfieldElement
    let initialValue = `${FM.label} = \\placeholder[mult]{${FM.latexMult}}\\begin{bmatrix}\\placeholder[m00]{${FM.latexMat[0][0]}} & \\placeholder[m01]{${FM.latexMat[0][1]}}\\\\ \\placeholder[m10]{${FM.latexMat[1][0]}} & \\placeholder[m11]{${FM.latexMat[1][1]}}\\end{bmatrix}`;
    let undoChangesButton: HTMLElement|null = $state(null);
    let undoChangesButtonEnabled: boolean = $state(false);
    
	const popoversContext = getContext('popoversContext') as {preventOpening: boolean};


    if (FM.parameterArray.find(p => p.userEditable) && !instantUpdate) {
        console.error("Matrices with user editable parameters must be instantUpdate")
    }
    
    /**
     * Given a properly shaped mathfield, it returns a list with a 2x2 matrix
     * of strings containing the latex entries of the matrix, followd by a string
     * containing the multiplier of the matrix.
     * mf.value must have the following format:
     * ${FM.label} = \\placeholder[mult]{${m}}\\begin{bmatrix}\\placeholder[m00]{${a}} & \\placeholder[m01]{${b}}\\\\ \\placeholder[m10]{${c}} & \\placeholder[m11]{${d}\\end{bmatrix}
     * where `m` is the multiplier of the matrix and `a,b,c,d` are the entries
    */
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
    /**
     * This function is run as soon as the element is loaded and sets up the reactivity of the element
    */
	const mfAttachment: Attachment = (element) => {
		let mf = element as MathfieldElement;
        
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
            undoChangesButtonEnabled = false;
        })

        /**
         * Whenever we receive user input on the page we need to check if the
         * current input generates a valid matrix and enable/disable the
         * update button accordingly
        */
        mf.addEventListener('input', (ev)=> {
            
            // Generate a matrix starting from latex and validate it
            let parsed = parseMatrixField(mf);
            let res = FM.validateMatrix(FM.generateMatrixFromLatex(...parsed));
            // updateMatrixButtonEnabled = res.isValid;
            FM.userMessage = res.message;
            
            if (instantUpdate && res.isValid) {
                // Save the state previous to updating for the callback function
                let oldFM = FM.clone();
                FM.setMatrixFromLatex(...parsed)
                
                if (res.isValid && onChangeCallback !== undefined) {
                    onChangeCallback(FM.clone(), oldFM, onChangeArguments );
                }
                
            }
            // if the displayed value is different with respect to
            // one actually in the Fancy matrix we have to set the matrix
            // as invalid (user wouldn't know the real value)
            let displayed_matrix = FM.generateMatrixFromLatex(...parseMatrixField(mf));
            let matrices_equal = deepEqual(FM.mat, displayed_matrix) as unknown as boolean;
            
            FM.isConsistent = res.isValid &&  matrices_equal;
            updateMatrixButtonEnabled = !matrices_equal && res.isValid;
            undoChangesButtonEnabled = !matrices_equal;
            

            // Listen for presses on the ENTER key and respond as if the user clicked the
            // updateMatrixButton
            if ((ev as InputEvent).inputType === "insertLineBreak") {
                updateMatrixButton?.click();
            }
        })
        
        // Prevent the user from leavin math mode (it happens for example when pressing ESC)
        mf.addEventListener('mode-change', (ev)=>{ev.preventDefault();})
        
        // Update the FancyMatrix when the button is pressed
        updateMatrixButton?.addEventListener('click', ()=>{
            // Update all the latex fields with the new value
            // TODO : optimize to avoid useless overrides
            let parsed = parseMatrixField(mf);
            // Save the state previous to updating for the callback function
            let oldFM = FM.clone();
            let res = FM.setMatrixFromLatex(...parsed);
            FM.isConsistent = res.isValid;
            // If the update was successful call the onChangeCallback function
            if (res.isValid && onChangeCallback !== undefined) {
                onChangeCallback(FM.clone(), oldFM, onChangeArguments);
            }
            
        })
        // The undo button overrides the current displayed value
        // and substitutes it with the actual latex value of the
        // FancyMatrix
        undoChangesButton?.addEventListener('click', ()=>{
            for (let i = 0; i < 2; i++){
                for (let j = 0; j < 2; j++){
                    let newValue: string = FM.latexMat[i][j];
                    mf.setPromptValue(`m${i}${j}`, newValue, {})
                }
            }
            mf.setPromptValue(`mult`, FM.latexMult, {})
            FM.isConsistent = true;
        })



		return () => {
		};
	};

</script>

<style>
:global(math-field::part(menu-toggle)) {
  display: none;
}
:global(math-field::part(virtual-keyboard-toggle)) {
    display: none;
}
</style>

<div class="flex">

    <ErrorPopover
        isOpen={!FM.isConsistent && FM.userMessage != '' && !popoversContext.preventOpening}
        popoverContent={FM.userMessage}
    >
    {#snippet trigger()}
        <math-field {@attach mfAttachment} readonly aria-label="matrix input"></math-field>
    {/snippet}

    </ErrorPopover>
    <!-- Buttons that needs to be disabled if instantUpdate is true -->
    <div class={`${instantUpdate ? 'hidden ':''} flex flex-col justify-around`} > 
        
        <Button class="size-6" variant="ghost"
            bind:ref={updateMatrixButton} 
            disabled={!updateMatrixButtonEnabled}
            name="apply changes"
        >
            <!-- <Save /> -->
            <CircleCheckBig/>
        </Button>
        <Button class="size-6" variant="ghost"
            bind:ref={undoChangesButton} 
            disabled={!undoChangesButtonEnabled}
            name="restore"
        >
            <!-- <Trash />-->
            <CircleX class="stroke-destructive"/>
        </Button>
    </div>
    <!-- <MatrixParameterInput matrix={FM} ></MatrixParameterInput> -->
    <!-- <p> {FM.userMessage} </p> -->
</div>