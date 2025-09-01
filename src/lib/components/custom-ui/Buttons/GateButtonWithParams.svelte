<script lang="ts">
	import type { DensityMatrix, GateMatrix } from '$lib/components/Model.svelte';
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
	}
	let { DM, history, gate, disabled, canvasContainer, withParams }: Props = $props();
</script>

{#if withParams}
	<div class="flex gap-0">
		<ApplyGateButton {DM} {history} {gate} {disabled} {canvasContainer} />
		<MatrixInfoInput matrix={gate}></MatrixInfoInput>
	</div>
{:else}
	<ApplyGateButton {DM} {history} {gate} {disabled} {canvasContainer} />
{/if}
