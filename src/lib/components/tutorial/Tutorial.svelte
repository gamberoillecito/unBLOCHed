<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	import ScrollArea from '../ui/scroll-area/scroll-area.svelte';
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	import Section from './tutorials_md/Section.svx';
	import QubitsTutorial from './tutorials_md/Qubits.svx';
	import StatesTutorial from './tutorials_md/States.svx';
	import GatesTutorial from './tutorials_md/Gates.svx';
	import MStatesTutorial from './tutorials_md/MixedStates.svx';
	import MeasureTutorial from './tutorials_md/Measure.svx';
	import { type TutorialPageProps } from '$lib/components/tutorial/tutorialUtils';
	import type { Component } from 'svelte';
	import { preferences } from '$lib/preferences';
	import { get } from 'svelte/store';
	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));

	const prefs = get(preferences).tutorial;

	let components: Component[] = [];
	interface Props {
		tutorialProps: TutorialPageProps;
	}
	let { tutorialProps }: Props = $props();
	const tutorialList = [
		{
			content: QubitsTutorial,
			title: 'Qubits'
		},
		{
			content: StatesTutorial,
			title: 'States'
		},
		{
			content: GatesTutorial,
			title: 'Gates'
		},
		{
			content: MStatesTutorial,
			title: 'Mixed States'
		},
		{
			content: MeasureTutorial,
			title: 'Measures'
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

	let currentChapter = $state(prefs?.chapter !== '' ? prefs?.chapter : tutorialList[0].title);
</script>

{#snippet tabContent(title: string, TutorialContent: Component)}
	<Tabs.Content value={title} class="bg-card mx-4 my-2 min-h-0 flex-1 rounded-lg border shadow-sm">
		<ScrollArea class="h-full w-full">
			<article class="prose dark:prose-invert max-h-full w-full px-6 py-4">
				<TutorialContent {...tutorialProps} />
			</article>
		</ScrollArea>
	</Tabs.Content>
{/snippet}

<Tabs.Root
	bind:value={currentChapter}
	class="flex h-full min-h-0 flex-col items-center"
	onValueChange={() => {
		preferences.update((x) => ({ ...x, tutorial: { ...x.tutorial, chapter: currentChapter } }));
	}}
>
	<Tabs.List>
		{#each tutorialList as tut}
			<Tabs.Trigger value={tut.title}>{tut.title}</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{#each tutorialList as tut}
		{@render tabContent(tut.title, tut.content)}
	{/each}
</Tabs.Root>
