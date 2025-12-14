<script lang="ts">
	import type { GateMatrix } from '$lib/model/GateMatrix.svelte';
	import type { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { BlochHistory } from '$lib/model/BlochHistory.svelte';
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
		secondaryButton?: boolean;
		size: 'default' | 'small';
	}
	let {
		DM,
		history,
		gate,
		disabled,
		canvasContainer,
		secondaryButton = true,
		size = 'default'
	}: Props = $props();
</script>

<!--
@component
A button that applies a quantum gate to the density matrix `DM`. It uses a `LatexButton` for its primary action and is wrapped in a tooltip that can display information about the gate's rotation.

**Props:**
- `DM: DensityMatrix` - The main reactive `DensityMatrix` to which the gate will be applied.
- `history: BlochHistory` - The history object to log the state change after the gate application.
- `gate: GateMatrix` - The `GateMatrix` to apply.
- `disabled: boolean` - If `true`, the button is disabled.
- `canvasContainer: HTMLDivElement` - A reference to the canvas container element, which is flashed upon click.
- `secondaryButton?: boolean` (default: `true`) - If `true`, the button is styled to be part of a group (rounded on one side).
- `size: 'default' | 'small'` - The size of the button.
-->

<Tooltip.Provider delayDuration={0}>
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
			variant='default'
			tooltip={true}
			round={secondaryButton ? 'left' : 'full'}
			{size}
		/>
		{#if isZero(gate.rotationAngle) || equal(gate.rotationAngle, multiply(2, pi))}
			<Tooltip.Content class="bg-muted text-muted-foreground border-1"
				>{@html marked.parse('Gate results in a $0$ or $2\\pi$ rotation')}</Tooltip.Content
			>
		{/if}
	</Tooltip.Root>
</Tooltip.Provider>
