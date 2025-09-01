<script lang="ts">
	import type { DensityMatrix, GateMatrix } from '$lib/components/Model.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { BlochHistory } from '$lib/components/BlochHistory.svelte';
	import LatexButton from './LatexButton.svelte';
	import { isZero, equal, multiply, pi } from 'mathjs';
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	import { flashCanvas } from './buttonUtility';

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
	}
	let { DM, history, gate, disabled, canvasContainer }: Props = $props();
</script>

<!-- Button that, when clicked, applies a gate -->

<Tooltip.Provider>
	<Tooltip.Root>
		<LatexButton
			onclick={() => {
				let initialDM = DM.clone();
				DM.apply_gate(gate);
				history.addElement(initialDM, DM, gate);

				flashCanvas(canvasContainer);
			}}
			label={gate.label}
			disabled={disabled || !gate.isConsistent}
			variant={'default'}
			tooltip={true}
		/>
		{#if isZero(gate.rotationAngle) || equal(gate.rotationAngle, multiply(2, pi))}
			<Tooltip.Content class="bg-muted text-muted-foreground border-1"
				>{@html marked.parse('Gate results in a $0$ or $2\\pi$ rotation')}</Tooltip.Content
			>
		{/if}
	</Tooltip.Root>
</Tooltip.Provider>
