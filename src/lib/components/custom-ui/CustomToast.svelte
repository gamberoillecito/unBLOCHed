<script lang="ts">
	import { Button,  } from '$lib/components/ui/button/index.js';
	import { type Snippet } from 'svelte';
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));

	interface Props {
		title?: string | Snippet;
		description?: string | Snippet;
		action?: string | Snippet;
		actionCallback?: () => void;
	}

	let { title, description, action, actionCallback }: Props = $props();
</script>

<div class="prose dark:prose-invert">
	<h5>
		{#if typeof title === 'string'}
			// eslint-disable-next-line svelte/no-at-html-tags
			{@html marked.parse(title)}
		{:else if title}
			{@render title()}
		{/if}
	</h5>
	<div class="flex flex-row items-center gap-3">
		<article class="prose-sm">
			{#if typeof description === 'string'}
				{@html marked.parse(description)}
			{:else if description}
				{@render description()}
			{/if}
		</article>
		{#if action}
			<Button
				onclick={() => {
					actionCallback?.() ;
				}}
			>
				{#if typeof action === 'string'}
					{@html marked.parse(action)}
				{:else}
					{@render action()}
				{/if}
			</Button>
		{/if}
	</div>
</div>
