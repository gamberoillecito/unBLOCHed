<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { Snippet } from 'svelte';
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));

	interface Props {
		isOpen: boolean;
		trigger: Snippet;
		popoverContent: string | null;
		dismissable?: boolean;
	}

	let { isOpen, trigger, popoverContent, dismissable = false }: Props = $props();
</script>

<!--
@component
A specialized popover component designed to display validation or error messages. It appears above a trigger element when an error condition is met, and its content supports Markdown and KaTeX rendering.

**Props:**
- `isOpen: boolean`
  Controls the visibility of the popover. Set to `true` to show the error message.

- `trigger: Snippet`
  A Svelte snippet that contains the UI element (e.g., an input field) to which the popover should be anchored.

- `popoverContent: string | null`
  The error message to display inside the popover.

- `dismissable?: boolean` (default: `false`)
  If `true`, the user can close the popover by clicking outside or pressing the Escape key.

**Usage:**
Wrap the element that can cause an error in a snippet and pass it to the `trigger` prop. Control the popover's visibility with the `isOpen` prop.

```svelte
<script lang="ts">
  import ErrorPopover from './ErrorPopover.svelte';

  let text = $state('');
  let DM = $state(...).
</script>

{#snippet myInputTrigger()}
  <DynamicMatrix ... />
{/snippet}

<ErrorPopover
  isOpen={!DM.isConsistent}
  popoverContent={'The matrix is invalid'}
  trigger={myInputTrigger}
/>
```
-->

<Popover.Root open={isOpen}>
	<Popover.Trigger disabled>
		{@render trigger()}
	</Popover.Trigger>
	<Popover.Content
		class="bg-destructive w-fit px-2 py-1 z-9999999999"
		interactOutsideBehavior={dismissable === true ? undefined : 'defer-otherwise-ignore'}
		escapeKeydownBehavior={dismissable === true ? undefined : 'ignore'}
		side="top"
		align="center"
		trapFocus={false}
		onOpenAutoFocus={(e) => {
			e.preventDefault();
		}}
		onCloseAutoFocus={(e) => {
			e.preventDefault();
		}}
	>
		<article class="prose-sm text-destructive-foreground">
			{@html marked.parse(popoverContent ?? '') as string}
		</article>
	</Popover.Content>
</Popover.Root>
