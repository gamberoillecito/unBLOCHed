<script lang="ts">
	import { Button, buttonVariants, type ButtonVariant } from '$lib/components/ui/button/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { convertLatexToMarkup } from 'mathlive';
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));

	interface Props {
		onclick: (arg: any) => void;
		label: string;
		disabled: boolean;
		variant?: ButtonVariant;
		tooltip?: boolean;
		round?: 'none' | 'left' | 'right' | 'full';
		size?: 'default' | 'small';
	}
	let {
		onclick,
		label,
		disabled,
		variant,
		tooltip = false,
		round = 'left',
		size = 'default'
	}: Props = $props();
	console.log(size);
	

	const btnClass = `p-auto aspect-square ${size === 'small' ? 'w-[2rem] h-[2rem] ' : 'h-10 min-w-10 '} rounded-none ${round === 'left' ? 'rounded-s-md' : round === 'right' ? 'rounded-r-md' : round === 'full' ? '!rounded-md' : ''}`;
	const labelSpanClasses = "pointer-events-none flex flex-row items-center"
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
			// el.innerHTML = `<span class="pointer-events-none">${convertLatexToMarkup(label)}</span>`;
			el.innerHTML = `<span class="${labelSpanClasses}">${convertLatexToMarkup(label)}</span>`;
		}}
	></Button>
{:else}
	<Tooltip.Trigger
		class={btnClass + ' ' + buttonVariants({ variant: variant })}
		aria-label="latex button"
		{disabled}
		{onclick}
		{@attach (el: HTMLElement) => {
			el.innerHTML = `<span class="${labelSpanClasses}">${convertLatexToMarkup(label)}</span>`;
		}}
	></Tooltip.Trigger>
{/if}
