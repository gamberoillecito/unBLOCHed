<script lang="ts">
	import type { GateMatrix } from '$lib/model/GateMatrix.svelte';
	import type { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
	import { BlochHistory } from '$lib/components/BlochHistory.svelte';
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	import ApplyGateButton from './ApplyGateButton.svelte';
	import MatrixInfoInput from '$lib/components/MatrixInfoInput.svelte';

	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));

	interface Props {
		DM: DensityMatrix;
		history: BlochHistory;
		gate: GateMatrix;
		disabled: boolean;
		canvasContainer: HTMLDivElement;
		withParams: boolean;
		size?: 'default' | 'small';
	}
	let {
		DM,
		history,
		gate,
		disabled,
		canvasContainer,
		withParams,
		size = 'default'
	}: Props = $props();
</script>

{#if withParams}
	<div class="flex gap-0">
		<ApplyGateButton {DM} {history} {gate} {disabled} {canvasContainer} {size} />
		<MatrixInfoInput matrix={gate} {size}></MatrixInfoInput>
	</div>
{:else}
	<ApplyGateButton {DM} {history} {gate} {disabled} {canvasContainer} {size} />
{/if}
