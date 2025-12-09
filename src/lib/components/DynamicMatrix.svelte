<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import 'mathlive';
	import type { MathfieldElement } from 'mathlive';
	import { getContext } from 'svelte';
	import { FancyMatrix } from '$lib/model/FancyMatrix.svelte';
	import { deepEqual } from 'mathjs';
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	import ErrorPopover from './custom-ui/ErrorPopover.svelte';
	import ApplyUndoButton from './custom-ui/Buttons/ApplyUndoButton.svelte';

	interface Props {
		FM: FancyMatrix;
		instantUpdate: boolean;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onChangeCallback?: (FM: FancyMatrix, oldFM: FancyMatrix, ...args: any[]) => void;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onChangeArguments?: any;
	}

	let { FM, instantUpdate = false, onChangeCallback, onChangeArguments }: Props = $props();

	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));

	let updateMatrixButton: HTMLElement | null = $state(null);
	let updateMatrixButtonEnabled: boolean = $state(false);

	// Initial latex value to be set inside the MathfieldElement
	let initialValue = FM.generateLatexString();
	// let initialValue = `${FM.label} = \\placeholder[mult]{${FM.latexMult}}\\begin{bmatrix}\\placeholder[m00]{${FM.latexMat[0][0]}} & \\placeholder[m01]{${FM.latexMat[0][1]}}\\\\ \\placeholder[m10]{${FM.latexMat[1][0]}} & \\placeholder[m11]{${FM.latexMat[1][1]}}\\end{bmatrix}`;
	let undoChangesButton: HTMLElement | null = $state(null);
	let undoChangesButtonEnabled: boolean = $state(false);

	const popoversContext = getContext('popoversContext') as { preventOpening: boolean };

	if (FM.parameterArray.find((p) => p.userEditable) && !instantUpdate) {
		console.error('Matrices with user editable parameters must be instantUpdate');
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
		let matrix: string[][] = [];
		for (let i = 0; i < FM.nRows; i++) {
			matrix.push([]);
			for (let j = 0; j < FM.nCols; j++) {
				let promptValue = mf.getPromptValue(`m${i}${j}`);
				matrix[i].push(promptValue);
			}
		}
		let mult = mf.getPromptValue('mult');
		return [matrix, mult];
	}
	/**
	 * This function is run as soon as the element is loaded and sets up the reactivity of the element
	 */
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

			for (let i = 0; i < FM.nRows; i++) {
				for (let j = 0; j < FM.nCols; j++) {
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
			updateMatrixButtonEnabled = false;
			undoChangesButtonEnabled = false;
		});

		/**
		 * Whenever we receive user input on the page we need to check if the
		 * current input generates a valid matrix and enable/disable the
		 * update button accordingly
		 */
		mf.addEventListener('input', (ev) => {
			console.log(mf.value);
			
			// Generate a matrix starting from latex and validate it
			let parsed = parseMatrixField(mf);
			let res = FM.validateMatrix(FM.generateMatrixFromLatex(...parsed));
			// updateMatrixButtonEnabled = res.isValid;
			FM.userMessage = res.message;

			if (instantUpdate && res.isValid) {
				// Save the state previous to updating for the callback function
				let oldFM = FM.clone();
				FM.setMatrixFromLatex(...parsed);

				if (res.isValid && onChangeCallback !== undefined) {
					onChangeCallback(FM.clone(), oldFM, ...onChangeArguments);
				}
			}
			// if the displayed value is different with respect to
			// one actually in the Fancy matrix we have to set the matrix
			// as invalid (user wouldn't know the real value)
			let displayed_matrix = FM.generateMatrixFromLatex(...parseMatrixField(mf));
			let matrices_equal = deepEqual(FM.mat, displayed_matrix) as unknown as boolean;

			FM.isConsistent = res.isValid && matrices_equal;
			updateMatrixButtonEnabled = !matrices_equal && res.isValid;
			undoChangesButtonEnabled = !matrices_equal;

			// Listen for presses on the ENTER key and respond as if the user clicked the
			// updateMatrixButton
			if ((ev as InputEvent).inputType === 'insertLineBreak') {
				ev.preventDefault();

				if (updateMatrixButtonEnabled) {
					updateMatrixButton?.click();
				}
			}
		});

		// Prevent the user from leavin math mode (it happens for example when pressing ESC)
		mf.addEventListener('mode-change', (ev) => {
			ev.preventDefault();
		});

		// Update the FancyMatrix when the button is pressed
		updateMatrixButton?.addEventListener('click', () => {
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
		});
		// The undo button overrides the current displayed value
		// and substitutes it with the actual latex value of the
		// FancyMatrix
		undoChangesButton?.addEventListener('click', () => {
			for (let i = 0; i < FM.nRows; i++) {
				for (let j = 0; j < FM.nCols; j++) {
					let newValue: string = FM.latexMat[i][j];
					mf.setPromptValue(`m${i}${j}`, newValue, { silenceNotifications: true });
				}
			}
			mf.setPromptValue(`mult`, FM.latexMult, { silenceNotifications: true });
			FM.isConsistent = true;
			undoChangesButtonEnabled = false;
		});

		return () => {};
	};
</script>

<!--
@component
A reactive matrix input component using `math-field` for displaying and editing `FancyMatrix` objects. It handles real-time validation, user input, and state updates.

**Props:**
- `FM: FancyMatrix`
  The reactive `FancyMatrix` instance to be displayed and edited.

- `instantUpdate: boolean`
  If `true`, the matrix updates on every valid input. If `false`, an "Apply" button must be clicked to commit changes.

- `onChangeCallback?: (newFM: FancyMatrix, oldFM: FancyMatrix, ...args: any[]) => void`
  An optional callback function that fires after a successful matrix update. It receives the new matrix, the old matrix, and any additional arguments. Notice that `newFM` and `oldFM` are provided automatically by the component and the the value of the matrix after and before the update, respectively.

- `onChangeArguments?: any`
  Optional arguments to be passed to the `onChangeCallback` after the `newFM` and `oldFM` parameters.

**Usage:**
The component can be configured for manual or instant updates.

```svelte
<script lang="ts">
  import DynamicMatrix from './DynamicMatrix.svelte';
  import { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
  import { BlochHistory } from '$lib/model/BlochHistory.svelte';

  let dm = $state(new DensityMatrix());
  let history = $state(new BlochHistory());

  function handleUpdate(newMatrix, oldMatrix, history) {
    // Add the change to the history log
    history.addElement(oldMatrix, newMatrix);
  }
</script>

// Manual updates
<DynamicMatrix
	FM={dm}
	instantUpdate={false}
	onChangeCallback={handleUpdate}
	onChangeArguments={history}
/>

// Instant updates
<DynamicMatrix FM={dm} instantUpdate={true} />
```
-->

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
			bind:updateButton={updateMatrixButton}
			updateButtonEnabled={updateMatrixButtonEnabled}
			{undoChangesButtonEnabled}
		/>
	{/if}
	<!-- <MatrixParameterInput matrix={FM} ></MatrixParameterInput> -->
	<!-- <p> {FM.userMessage} </p> -->
</div>

