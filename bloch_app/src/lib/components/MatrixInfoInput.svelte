<script lang="ts">
	import { FancyMatrix } from './Model.svelte';
	import { type Attachment } from 'svelte/attachments';
	import { type MathfieldElement } from 'mathlive';
	import { getContext } from 'svelte';
	import { MatrixParam } from './Model.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button, buttonVariants, type ButtonVariant } from '$lib/components/ui/button/index.js';
	import SquarePen from '@lucide/svelte/icons/square-pen';
	import Info from '@lucide/svelte/icons/info';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import ErrorPopover from '$lib/components/custom-ui/ErrorPopover.svelte';
	interface Props {
		matrix: FancyMatrix;
	}

	let { matrix }: Props = $props();
	let FM: FancyMatrix = matrix;
	let mainPopoverOpen = $state(false);
	let secondaryPopoverOpen = $derived(mainPopoverOpen && !FM.isConsistent);
	const popoversContext = getContext('popoversContext') as {preventOpening: boolean};
	$effect(()=>{popoversContext.preventOpening = secondaryPopoverOpen})
	// Initialize the mathfield to edit the matrix parameters
	function paramAttachment(param: MatrixParam): Attachment {
		return (element) => {
			let mf = element as MathfieldElement;
			mf.value = `\\small{\\placeholder[${param.name}]{${param.latexValue}}}`;
			mf.addEventListener('input', (ev: Event) => {
				let paramsNames = mf.getPrompts();
				if (paramsNames.length != 1) {
					console.error(`Matrix parameter contains more than one prompt: ${paramsNames}`);
					return;
				}
				let paramName = paramsNames[0];
				let paramValue = mf.getPromptValue(paramName);
				let res = FM.setParameterLatex(paramName, paramValue);
				FM.userMessage = res.message;
				FM.isConsistent = res.isValid;
			});
			

			// Prevent the user from leavin math mode (it happens for example when pressing ESC)
			mf.addEventListener('mode-change', (ev)=>{ev.preventDefault();})
		};
	}
</script>

<Popover.Root bind:open={mainPopoverOpen}>
	<!-- The trigger is itself a button but with a different style. Take the style from the button styles and apply to it -->
	<Popover.Trigger
		name={FM.parameterArray.length === 0 ? 'info' : 'edit'}
		class={`m-0 h-10 w-6 rounded-none rounded-e-md ${buttonVariants.variants.variant.outline}`}
	>
		{#if FM.parameterArray.length === 0}
			<Info class="m-auto size-4" />
		{:else}
			<SquarePen class="m-auto size-4" />
		{/if}
	</Popover.Trigger>
	<Popover.Content class="w-fit px-3 py-2">
		<div class="flex flex-col items-start">
			<ErrorPopover isOpen={secondaryPopoverOpen} popoverContent={FM.userMessage} dismissable={true}>
				{#snippet trigger()}
					<math-field
						readonly
						{@attach (mf: MathfieldElement) => {
							mf.value = `${FM.labelWParams} = {${FM.latexMult == '1' ? '' : FM.latexMult}}\\begin{bmatrix}{${FM.latexMat[0][0]}} & {${FM.latexMat[0][1]}}\\\\ {${FM.latexMat[1][0]}} & {${FM.latexMat[1][1]}}\\end{bmatrix}`;
						}}
					></math-field>
				{/snippet}
			</ErrorPopover>
			{#if FM.parameterArray.filter((x) => x.userEditable).length > 0}
				<Separator />
			{/if}
			<div class="flex w-full flex-row place-content-around">
				{#each FM.parameterArray as param, index}
					{#if param.userEditable}
						<div class="flex flex-row gap-2">
							<Label for={param.latexLabel}
								><math-field readonly>{`\\mathbf${param.latexLabel}`}</math-field></Label
							>
							<math-field
								aria-labelledby={param.latexLabel}
								id={param.latexLabel}
								{@attach paramAttachment(param)}
								readonly
							></math-field>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
