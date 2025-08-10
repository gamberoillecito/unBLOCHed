<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import tutorial1 from '$lib/tutorial_pages/tutorial_1_en.md?raw';
	import tutorial2 from '$lib/tutorial_pages/tutorial_2_en.md?raw';
	import tutorial3 from '$lib/tutorial_pages/tutorial_3_en.md?raw';
	import tutorial4 from '$lib/tutorial_pages/tutorial_4_en.md?raw';
	import ScrollArea from './ui/scroll-area/scroll-area.svelte';
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));

	const tutorialList = [
		{
			mdContent: tutorial1,
			title: 'Qubits'
		},
		{
			mdContent: tutorial2,
			title: 'Bloch Sphere'
		},
		{
			mdContent: tutorial3,
			title: 'States'
		},
		{
			mdContent: tutorial4,
			title: 'Gates'
		}
	];
</script>

{#snippet tabContent(title: string, mdContent: string)}
	<Tabs.Content value={title} class="bg-card mx-4 my-2 min-h-0 flex-1 rounded-xl border shadow-sm">
		<ScrollArea class="h-full w-full">
			<article
				class="prose max-h-full w-full px-6 py-4"
				{@attach (p) => {
					p.innerHTML = marked.parse(mdContent) as string;
				}}
			></article>
		</ScrollArea>
	</Tabs.Content>
{/snippet}

<Tabs.Root value={tutorialList[0].title} class="flex h-full min-h-0 flex-col items-center">
	<Tabs.List>
		{#each tutorialList as tut}
			<Tabs.Trigger value={tut.title}>{tut.title}</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{#each tutorialList as tut}
		{@render tabContent(tut.title, tut.mdContent)}
	{/each}
</Tabs.Root>
