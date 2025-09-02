<script lang="ts">
	import { Button, buttonVariants, type ButtonVariant } from '$lib/components/ui/button/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { convertLatexToMarkup } from 'mathlive';

	interface Props {
		onclick: (arg: any) => void;
		label: string;
		disabled: boolean;
		variant?: ButtonVariant;
		tooltip?: boolean;
		round?: 'none' | 'left' | 'right' | 'full';
	}
	let { onclick, label, disabled, variant, tooltip = false, round = 'left' }: Props = $props();

	const btnClass = `aspect-square h-10 min-w-10 rounded-none ${round === 'left' ? 'rounded-s-md' : round === 'right' ? 'rounded-r-md' : round === "full" ? "!rounded-md" : ''}`;
</script>

<!-- Generic button with an onclick action and a latex label -->
{#if !tooltip}
	<Button
		{variant}
		class={btnClass}
		aria-label="latex button"
		{disabled}
		{onclick}
		{@attach (el: HTMLElement) => {
			el.innerHTML = `<span class="pointer-events-none">${convertLatexToMarkup(label)}</span>`;
		}}
	></Button>
{:else}
	<Tooltip.Trigger
		class={btnClass + ' ' + buttonVariants({ variant: variant })}
		aria-label="latex button"
		{disabled}
		{onclick}
		{@attach (el: HTMLElement) => {
			el.innerHTML = `<span class="pointer-events-none">${convertLatexToMarkup(label)}</span>`;
		}}
	></Tooltip.Trigger>
{/if}
