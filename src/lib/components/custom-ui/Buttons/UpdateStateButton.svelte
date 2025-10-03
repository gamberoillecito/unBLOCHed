<script lang="ts">
	import type { GateMatrix } from '$lib/model/GateMatrix.svelte';
	import type { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
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
		size?: 'default' | 'small';
	}
	let {
		DM,
		history,
		matrix,
		disabled = false,
		canvasContainer,
		secondaryButton = true,
		size = 'default'
	}: Props = $props();
</script>

<div class="inline-flex w-fit gap-0">
	<LatexButton
		onclick={() => {
			history.addElement(DM, matrix);
			DM.setMatrixFromLatex(matrix.latexMat, matrix.latexMult);
			flashCanvas(canvasContainer);
		}}
		label={matrix.label}
		{disabled}
		round={secondaryButton ? 'left' : 'full'}
		{size}
	/>
	{#if secondaryButton}
		<MatrixInfoInput {matrix}></MatrixInfoInput>
	{/if}
</div>
