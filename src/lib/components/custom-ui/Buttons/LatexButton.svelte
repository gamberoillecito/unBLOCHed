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

	const btnClass = `p-auto aspect-square ${size === 'small' ? 'w-[2rem] h-[2rem] ' : 'h-10 min-w-10 '} rounded-none ${round === 'left' ? 'rounded-s-md' : round === 'right' ? 'rounded-r-md' : round === 'full' ? '!rounded-md' : ''}`;
	const labelSpanClasses = 'pointer-events-none flex flex-row items-center';
</script>

<!--
@component
A button that renders a LaTeX string as its label. It supports different sizes, corner rounding for use in button groups, and can optionally act as a tooltip trigger.

**Props:**
- `onclick: (arg: any) => void`
  The function to execute when the button is clicked.

- `label: string`
  The LaTeX string to be rendered as the button's content.

- `disabled: boolean`
  If `true`, the button is disabled and cannot be clicked.

- `variant?: ButtonVariant` (optional)
  The visual style of the button (e.g., 'default', 'destructive', 'secondary').

- `tooltip?: boolean` (default: `false`)
  If `true`, the button is rendered as a `Tooltip.Trigger` instead of a standard `Button`.

- `round?: 'none' | 'left' | 'right' | 'full'` (default: `'left'`)
  Controls which corners of the button are rounded, useful for creating button groups.

- `size?: 'default' | 'small'` (default: `'default'`)
  The size of the button.

**Usage:**
The component can be used as a standalone button or as part of a tooltip.

```svelte
<script lang="ts">
  import LatexButton from './LatexButton.svelte';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';

  function handleClick() {
    console.log('Button clicked!');
  }
</script>

// Standard button
<LatexButton label={'\\sigma_x'} onclick={handleClick} disabled={false} variant={'secondary'} />

// Used as a tooltip trigger
<Tooltip.Root>
	<LatexButton label={'H'} onclick={() => {}} disabled={false} tooltip={true} />
	<Tooltip.Content>
		<p>Hadamard Gate</p>
	</Tooltip.Content>
</Tooltip.Root>
``` -->

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
