<script lang="ts">
	import ErrorPopover from '$lib/components/custom-ui/ErrorPopover.svelte';
	import ReadonlyFancyMatrix from './ReadonlyFancyMatrix.svelte';
	import ParameterInput from './ParameterInput.svelte';
	import type { QuantumOperation } from '$lib/model/QuantumOperation.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { BlochHistory } from '$lib/model/BlochHistory.svelte';
	import type { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
	import { flashCanvas } from './Buttons/buttonUtility';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Play from '@lucide/svelte/icons/play';

	interface Props {
		DM: DensityMatrix;
		QO: QuantumOperation;
		history: BlochHistory;
		canvasContainer: HTMLDivElement;
		openItem: string;
	}

	let { DM, QO, history, canvasContainer, openItem = $bindable() }: Props = $props();
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

<Accordion.Item value={QO.name}>
	<Accordion.Trigger class="group !no-underline">
		<div class="flex flex-row !items-center gap-4">
			<Button
				size="sm"
				variant="outline"
				class="peer"
				disabled={!QO.isConsistent}
				onclick={(e: Event) => {
					console.log('Applied ' + QO.name);
					let initialDM = DM.clone();
					DM.apply_quantum_operation(QO);
					history.addElement(initialDM, DM, null, true);

					flashCanvas(canvasContainer);
					e.stopPropagation();
				}}><Play /></Button
			>
			<span class="group-hover:underline peer-hover:no-underline">{QO.name}</span>
		</div>
	</Accordion.Trigger>
	<Accordion.Content>
		<div class="flex flex-wrap">
			{#each QO.operationElements as FM}
				<div class="flex w-1/2 justify-center">
					<ReadonlyFancyMatrix {FM} useExtendedLabel={false} debug={false} />
				</div>
			{/each}
		</div>
		{#each QO.parameters as param}
			<ErrorPopover isOpen={!QO.isConsistent  && (openItem === QO.name)} popoverContent={QO.userMessage} dismissable={false}>
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
		{/each}
	</Accordion.Content>
</Accordion.Item>
