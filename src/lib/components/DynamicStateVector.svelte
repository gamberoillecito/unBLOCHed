<script lang="ts">
	import 'mathlive';
	import type { MathfieldElement } from 'mathlive';
	import type { Attachment } from 'svelte/attachments';
	import { getContext } from 'svelte';
	import { FancyMatrix } from './Model.svelte';
	import ErrorPopover from './custom-ui/ErrorPopover.svelte';
	import ApplyUndoButton from './custom-ui/Buttons/ApplyUndoButton.svelte';

	const popoversContext = getContext('popoversContext') as { preventOpening: boolean };
    
	const initialValue = 'x';
	let updateVectorButton: HTMLElement | null = $state(null);
	let updateVectorButtonEnabled: boolean = $state(false);
	// Initial latex value to be set inside the MathfieldElement
	let undoChangesButton: HTMLElement | null = $state(null);
	let undoChangesButtonEnabled: boolean = $state(false);
	let instantUpdate = false;

	let FM = new FancyMatrix(
		[
			['', ''],
			['', '']
		],
		'1',
		'',
		[]
	);

	function parseMatrixField(mf: MathfieldElement): [string[][], string] {
		let matrix: string[][] = [];
		for (let i = 0; i < 2; i++) {
			matrix.push([]);
			for (let j = 0; j < 2; j++) {
				let promptValue = mf.getPromptValue(`m${i}${j}`);
				matrix[i].push(promptValue);
			}
		}
		let mult = mf.getPromptValue('mult');
		return [matrix, mult];
	}

	const mfAttachment: Attachment = (element) => {
		let mf = element as MathfieldElement;

		// Default value of the matrix input
		mf.value = initialValue;

		// Prevent menu from opening when user right-clicks
		mf.menuItems = [];

		// Whenever the latex content of the FancyMatrix changes we need to update
		// what appears on screen accordingly
		$effect(() => {
			// WARNING: the code used here is repeated also below in the undo button
			// event listener. Don't be tempted to put it in a separate function
			// otherwise this effect will not work anymore

			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					let newValue: string = FM.latexMat[i][j];
					let currentValue = mf.getPromptValue(`m${i}${j}`);
					if (newValue != currentValue) {
						mf.setPromptValue(`m${i}${j}`, newValue, { silenceNotifications: true });
					}
				}
			}
			if (FM.latexMult != mf.getPromptValue('mult')) {
				mf.setPromptValue(`mult`, FM.latexMult, { silenceNotifications: true });
			}
			updateVectorButtonEnabled = false;
			undoChangesButtonEnabled = false;
		});

		/**
		 * Whenever we receive user input on the page we need to check if the
		 * current input generates a valid matrix and enable/disable the
		 * update button accordingly
		 */
		mf.addEventListener('input', (ev) => {
			// Generate a matrix starting from latex and validate it
			let parsed = parseMatrixField(mf);
			let res = FM.validateMatrix(FM.generateMatrixFromLatex(...parsed));
			// updateMatrixButtonEnabled = res.isValid;
			FM.userMessage = res.message;

			if (instantUpdate && res.isValid) {
				// Save the state previous to updating for the callback function
				let oldFM = FM.clone();
				FM.setMatrixFromLatex(...parsed);

				// CHECK
				// if (res.isValid && onChangeCallback !== undefined) {
				//     onChangeCallback(FM.clone(), oldFM, onChangeArguments );
				// }
			}
			// if the displayed value is different with respect to
			// one actually in the Fancy matrix we have to set the matrix
			// as invalid (user wouldn't know the real value)

			// CHECK
			// let displayed_matrix = FM.generateMatrixFromLatex(...parseMatrixField(mf));
			// let matrices_equal = deepEqual(FM.mat, displayed_matrix) as unknown as boolean;
			// FM.isConsistent = res.isValid &&  matrices_equal;
			// updateMatrixButtonEnabled = !matrices_equal && res.isValid;
			// undoChangesButtonEnabled = !matrices_equal;

			// Listen for presses on the ENTER key and respond as if the user clicked the
			// updateMatrixButton
			// CHECK
			// if ((ev as InputEvent).inputType === "insertLineBreak") {
			//     updateMatrixButton?.click();
			// }
		});

		// Prevent the user from leavin math mode (it happens for example when pressing ESC)
		mf.addEventListener('mode-change', (ev) => {
			ev.preventDefault();
		});

		// Update the FancyMatrix when the button is pressed
		updateVectorButton?.addEventListener('click', () => {
			// Update all the latex fields with the new value
			// TODO : optimize to avoid useless overrides
			let parsed = parseMatrixField(mf);
			// Save the state previous to updating for the callback function
			let oldFM = FM.clone();
			let res = FM.setMatrixFromLatex(...parsed);
			FM.isConsistent = res.isValid;
			// If the update was successful call the onChangeCallback function
            // TODO
			// if (res.isValid && onChangeCallback !== undefined) {
			// 	onChangeCallback(FM.clone(), oldFM, onChangeArguments);
			// }
		});
		// The undo button overrides the current displayed value
		// and substitutes it with the actual latex value of the
		// FancyMatrix
		undoChangesButton?.addEventListener('click', () => {
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					let newValue: string = FM.latexMat[i][j];
					mf.setPromptValue(`m${i}${j}`, newValue, {});
				}
			}
			mf.setPromptValue(`mult`, FM.latexMult, {});
			FM.isConsistent = true;
		});

		return () => {};
	};
</script>

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
	{#if !instantUpdate}
		<ApplyUndoButton
			bind:undoChangesButton
			bind:updateButton={updateVectorButton}
			updateButtonEnabled={updateVectorButtonEnabled}
			{undoChangesButtonEnabled}
		/>
	{/if}
	<!-- <MatrixParameterInput matrix={FM} ></MatrixParameterInput> -->
	<!-- <p> {FM.userMessage} </p> -->
</div>

