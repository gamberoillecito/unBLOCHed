<script lang="ts">
	import ErrorPopover from '$lib/components/custom-ui/ErrorPopover.svelte';
	import ReadonlyFancyMatrix from './ReadonlyFancyMatrix.svelte';
	import ParameterInput from './ParameterInput.svelte';
	import type { QuantumOperation } from '$lib/model/QuantumOperation.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { BlochHistory } from '$lib/model/BlochHistory.svelte';
	import type { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
	import { flashCanvas } from './Buttons/buttonUtility';
	interface Props {
		DM: DensityMatrix;
		QO: QuantumOperation;
		history: BlochHistory;
		canvasContainer: HTMLDivElement;
	}

	let { DM, QO, history, canvasContainer }: Props = $props();
</script>

<!--
@component
TODO
**Props:**
- `matrix: FancyMatrix`
  The reactive `FancyMatrix` instance to be displayed and edited.

- `size?: 'default' | 'small'` (default: `'default'`)
  The size of the trigger button.
-->

<div>
	<Button
		disabled={!QO.isConsistent}
		onclick={() => {
			console.log('Applied ' + QO.name);
			let initialDM = DM.clone();
			DM.apply_quantum_operation(QO);
			history.addElement(initialDM, DM, null, true);

			flashCanvas(canvasContainer);
		}}>{QO.name}</Button
	>
	{#each QO.operationElements as FM}
		<ReadonlyFancyMatrix {FM} useExtendedLabel={false} debug={true} />
	{/each}
	{#each QO.parameters as param}
		<ErrorPopover isOpen={!QO.isConsistent} popoverContent={QO.userMessage} dismissable={false}>
			{#snippet trigger()}
				<ParameterInput
					{param}
					callback={(paramName: string, paramValue: string) => {
						console.log(paramName);
						console.log(paramValue);
						QO.setParameter(paramName, paramValue);
					}}
				/>
			{/snippet}
		</ErrorPopover>
		<p>{QO.isConsistent}</p>
	{/each}
</div>
