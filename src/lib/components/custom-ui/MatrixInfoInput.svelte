<script lang="ts">
	import { FancyMatrix } from '$lib/model/FancyMatrix.svelte';
	import { getContext } from 'svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import SquarePen from '@lucide/svelte/icons/square-pen';
	import Info from '@lucide/svelte/icons/info';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import ErrorPopover from '$lib/components/custom-ui/ErrorPopover.svelte';
	import ReadonlyFancyMatrix from './ReadonlyFancyMatrix.svelte';
	import ParameterInput from './ParameterInput.svelte';
	interface Props {
		matrix: FancyMatrix;
		size?: 'default' | 'small';
	}

	let { matrix, size = 'default' }: Props = $props();
	let FM: FancyMatrix = matrix;
	let mainPopoverOpen = $state(false);
	let secondaryPopoverOpen = $derived(mainPopoverOpen && !FM.isConsistent);
	const popoversContext = getContext('popoversContext') as { preventOpening: boolean };
	$effect(() => {
		if (popoversContext) {
			popoversContext.preventOpening = secondaryPopoverOpen;
		}
	});
</script>

<!--
@component
Renders a popover button that allows viewing and editing the parameters of a `FancyMatrix` object. It displays an "info" icon for non-parameterized matrices and an "edit" icon for those with editable parameters.

**Props:**
- `matrix: FancyMatrix`
  The reactive `FancyMatrix` instance to be displayed and edited.

- `size?: 'default' | 'small'` (default: `'default'`)
  The size of the trigger button.
-->

<Popover.Root bind:open={mainPopoverOpen}>
	<!-- The trigger is itself a button but with a different style. Take the style from the button styles and apply to it -->
	<Popover.Trigger
		aria-label={FM.parameterArray.length === 0 ? 'info' : 'edit'}
		class={`m-0 ${size === 'small' ? 'h-[2rem]' : 'h-10'} w-6 rounded-none rounded-e-md ${buttonVariants.variants.variant.outline}`}
	>
		{#if FM.editableParameterArray.length === 0}
			<Info class="m-auto size-4" />
		{:else}
			<SquarePen class="m-auto size-4" />
		{/if}
	</Popover.Trigger>
	<Popover.Content class="w-fit px-3 py-2">
		<div class="flex flex-col items-start">
			<ErrorPopover
				isOpen={secondaryPopoverOpen}
				popoverContent={FM.userMessage}
				dismissable={true}
			>
				{#snippet trigger()}
					<ReadonlyFancyMatrix {FM} />
				{/snippet}
			</ErrorPopover>
			{#if FM.parameterArray.filter((x) => x.userEditable).length > 0}
				<Separator />
			{/if}
			<div class="flex w-full flex-row place-content-around">
				{#each FM.parameterArray as param}
					{#if param.userEditable}
						<ParameterInput {FM} {param} />
					{/if}
				{/each}
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
