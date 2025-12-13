<script lang="ts">
	import ErrorPopover from '$lib/components/custom-ui/ErrorPopover.svelte';
	import ReadonlyFancyMatrix from './ReadonlyFancyMatrix.svelte';
	import ParameterInput from './ParameterInput.svelte';
	import type { QuantumOperation } from '$lib/model/QuantumOperation.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
	interface Props {
		DM: DensityMatrix;
		QO: QuantumOperation;
	}

	let { DM, QO }: Props = $props();
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
		onclick={() => {
			DM.apply_quantum_operation(QO);
			console.log('Applied ' + QO.name);
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
