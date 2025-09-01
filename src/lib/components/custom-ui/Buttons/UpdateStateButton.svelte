<script lang="ts">
	import type { DensityMatrix, GateMatrix } from '$lib/components/Model.svelte';
	import { BlochHistory } from '$lib/components/BlochHistory.svelte';
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	import ApplyGateButton from './ApplyGateButton.svelte';
	import MatrixInfoInput from '$lib/components/MatrixInfoInput.svelte';
    import LatexButton from './LatexButton.svelte';
	import { flashCanvas } from './buttonUtility';

	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));

	interface Props {
		DM: DensityMatrix;
		history: BlochHistory;
		matrix: DensityMatrix;
		disabled: boolean;
		canvasContainer: HTMLDivElement;
	}
	let { DM, history, matrix, disabled, canvasContainer}: Props = $props();
</script>

<div class="flex gap-0">
    <LatexButton
        onclick={() => {
            history.addElement(DM, matrix);
            DM.setMatrixFromLatex(matrix.latexMat, matrix.latexMult);
            flashCanvas(canvasContainer);
        }}
        label={matrix.label}
        {disabled}
    />
    <MatrixInfoInput {matrix}></MatrixInfoInput>
</div>