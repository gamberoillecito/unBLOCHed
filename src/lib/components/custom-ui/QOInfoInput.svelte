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
	import { onMount } from 'svelte';

	interface Props {
		DM: DensityMatrix;
		QO: QuantumOperation;
		history: BlochHistory;
		canvasContainer: HTMLDivElement;
		openItem: string;
	}

	let { DM, QO, history, canvasContainer, openItem = $bindable() }: Props = $props();
	let loaded = $state(false);
	onMount(() => {
		loaded = true;
	});
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
	<Accordion.Trigger class="group no-underline!">
		<div class="flex flex-row items-center! gap-4">
			<!-- The if is necessary to prevent duplication of the page for reason that I don't understand -->
			{#if loaded}
				<Button
					size="sm"
					variant="outline"
					class="peer"
					disabled={!QO.isConsistent}
					onclick={(e: Event) => {
						let initialDM = DM.clone();
						DM.apply_quantum_operation(QO);
						history.addElement(initialDM, DM, null, true);

						flashCanvas(canvasContainer);
						e.stopPropagation();
					}}><Play /></Button
				>
			{/if}
			<span class="group-hover:underline peer-hover:no-underline">{QO.name}</span>
		</div>
	</Accordion.Trigger>
	<Accordion.Content>
		<div class="flex flex-wrap justify-around @lg:max-w-100">
			{#each QO.operationElements as FM}
				<div class="flex w-fit justify-center">
					<ReadonlyFancyMatrix {FM} useExtendedLabel={false} debug={false} />
				</div>
			{/each}
		</div>
		<div class="pl-3">
			{#each QO.parameters as param}
				<!-- the isOpen condition takes into account also if the current Accordion.Item is open or not because we want
			 to hide the Popover when the current item is closed -->
				<ErrorPopover
					isOpen={!QO.isConsistent && openItem === QO.name}
					popoverContent={QO.userMessage}
					dismissable={false}
				>
					{#snippet trigger()}
						<ParameterInput
							{param}
							callback={(paramName: string, paramValue: string) => {
								QO.setParameter(paramName, paramValue);
							}}
						/>
					{/snippet}
				</ErrorPopover>
			{/each}
		</div>
	</Accordion.Content>
</Accordion.Item>
