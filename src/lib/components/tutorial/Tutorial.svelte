<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import comingSoon from '$lib/markdown/tutorial_pages/coming_soon.md?raw';

	import ScrollArea from '../ui/scroll-area/scroll-area.svelte';
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	import Section from './tutorials_md/Section.svx';
	import { type TutorialPageProps } from '$lib/components/tutorial/tutorialUtils';
	import type { Component } from 'svelte';
	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));

	const modules = import.meta.glob('./tutorials_md/*.svx');
	let components: Component[] = [];
	interface Props {
		tutorialProps: TutorialPageProps;
	}
	let { tutorialProps }: Props = $props();

	const tutorialList = [
		{
			mdContent: comingSoon,
			title: 'Almost ready'
		}
		// {
		// 	mdContent: tutorial1,
		// 	title: 'Qubits'
		// },
		// {
		// 	mdContent: tutorial2,
		// 	title: 'Bloch Sphere'
		// },
		// {
		// 	mdContent: tutorial3,
		// 	title: 'States'
		// },
		// {
		// 	mdContent: tutorial4,
		// 	title: 'Gates'
		// }
	];

	$inspect(tutorialProps);
	let mio = $derived(components[0]);
</script>

{#snippet tabContent(title: string, mdContent: string)}
	<Tabs.Content value={title} class="bg-card mx-4 my-2 min-h-0 flex-1 rounded-xl border shadow-sm">
		<ScrollArea class="h-full w-full">
			<article class="prose dark:prose-invert max-h-full w-full px-6 py-4">
				<Section {...tutorialProps} />
			</article>
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
