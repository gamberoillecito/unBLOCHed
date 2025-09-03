<script lang="ts">
	import type { DensityMatrix, GateMatrix } from '$lib/components/Model.svelte';
	import { BlochHistory } from '$lib/components/BlochHistory.svelte';
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
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
		disabled?: boolean;
		canvasContainer: HTMLDivElement;
		secondaryButton?: boolean;
	}
	let { DM, history, matrix, disabled = false, canvasContainer, secondaryButton=true}: Props = $props();
</script>

<div class="inline-flex gap-0 w-fit">
    <LatexButton
        onclick={() => {
            history.addElement(DM, matrix);
            DM.setMatrixFromLatex(matrix.latexMat, matrix.latexMult);
            flashCanvas(canvasContainer);
        }}
        label={matrix.label}
        {disabled}
		round={secondaryButton ? 'left' : 'full'}
    />
	{#if secondaryButton}
		<MatrixInfoInput {matrix}></MatrixInfoInput>
	{/if}
</div>