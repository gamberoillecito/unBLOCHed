<script lang="ts">
	import { FancyMatrix } from './Model.svelte';
	import { type Attachment } from 'svelte/attachments';
	import { type MathfieldElement } from 'mathlive';
	import { getContext } from 'svelte';
	import { MatrixParam } from './Model.svelte';
    import * as Popover from "$lib/components/ui/popover/index.js";
    import {Button, buttonVariants, type ButtonVariant} from '$lib/components/ui/button/index.js';
    import SquarePen from '@lucide/svelte/icons/square-pen'
    import Info from '@lucide/svelte/icons/info';
	interface Props {
		matrix: FancyMatrix;
	}

	let { matrix }: Props = $props();
	let FM: FancyMatrix = matrix;

	// Initialize the mathfield to edit the matrix parameters
	function paramAttachment(param: MatrixParam): Attachment {
		return (element) => {
			let mf = element as MathfieldElement;
			mf.value = `\\small{${param.latexLabel} = \\placeholder[${param.name}]{${param.latexValue}}}`;
			mf.addEventListener('input', () => {
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
				console.log(FM.isConsistent);
			});
		};
	}
</script>

<Popover.Root>
	<!-- The trigger is itself a button but with a different style. Take the style from the button styles and apply to it -->
	<Popover.Trigger class={`m-0 h-10 w-6 rounded-none rounded-e-md ${buttonVariants.variants.variant.outline}`}>
		{#if FM.parameterArray.length === 0}
			<Info class="size-4 m-auto"/>
		{:else}
			<SquarePen class="size-4 m-auto"/>
		{/if}
	</Popover.Trigger>
	<Popover.Content>
		<math-field readonly {@attach (mf: MathfieldElement)=> {
			mf.value = `${FM.label} = {${FM.latexMult == '1' ? '' : FM.latexMult}}\\begin{bmatrix}{${FM.latexMat[0][0]}} & {${FM.latexMat[0][1]}}\\\\ {${FM.latexMat[1][0]}} & {${FM.latexMat[1][1]}}\\end{bmatrix}`
		}}></math-field>
        {#each FM.parameterArray as param, index}
            {#if param.userEditable}
                <math-field {@attach paramAttachment(param)} readonly></math-field>
            {/if}
        {/each}
	</Popover.Content>
</Popover.Root>
