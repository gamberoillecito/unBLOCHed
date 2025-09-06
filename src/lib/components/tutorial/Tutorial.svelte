<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	import { ScrollArea } from '$lib/components/ui/scroll-area/index';
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	import Section from './tutorials_md/Section.svx';
	import QubitsTutorial from './tutorials_md/Qubits.svx';
	import StatesTutorial from './tutorials_md/States.svx';
	import GatesTutorial from './tutorials_md/Gates.svx';
	import MStatesTutorial from './tutorials_md/MixedStates.svx';
	import MeasureTutorial from './tutorials_md/Measure.svx';
	import { type TutorialPageProps } from '$lib/components/tutorial/tutorialUtils';
	import { onMount, type Component } from 'svelte';
	import { preferences } from '$lib/preferences';
	import { get } from 'svelte/store';
	import { Button, buttonVariants, type ButtonVariant } from '$lib/components/ui/button/index.js';
	import Switch from '../ui/switch/switch.svelte';
	import Label from '../ui/label/label.svelte';
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import Toggle from '../ui/toggle/toggle.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));

	const prefs = get(preferences).tutorial;

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
	];
	onMount(() => {
		if (!prefs.chapter) {
			preferences.update((x) => ({
				...x,
				tutorial: { ...x.tutorial, chapter: tutorialList[0].title }
			}));
		}
		if (!prefs.lastScrollTop) {
			preferences.update((x) => ({ ...x, tutorial: { ...x.tutorial, lastScrollTop: 0 } }));
		}
		if (!prefs.open) {
			preferences.update((x) => ({ ...x, tutorial: { ...x.tutorial, open: false } }));
		}
		if (!prefs.rememberReadingPosition) {
			preferences.update((x) => ({
				...x,
				tutorial: { ...x.tutorial, rememberReadingPosition: true }
			}));
		}
	});
	let currentChapter = $state(
		prefs?.chapter !== undefined ? prefs?.chapter : tutorialList[0].title
	);

	let rememberReadingPos = $state(prefs.rememberReadingPosition);
	$inspect(rememberReadingPos);
	$effect(() => {
		preferences.update((x) => ({
			...x,
			tutorial: { ...x.tutorial, rememberReadingPosition: rememberReadingPos }
		}));
	});
</script>

{#snippet tabContent(title: string, TutorialContent: Component)}
	<Tabs.Content value={title} class="bg-card mx-4 my-2 min-h-0 flex-1 rounded-lg border shadow-sm">
		<ScrollArea
			class="h-full w-full"
			{@attach (el: HTMLElement) => {
				/** Element that contains the scrollable text*/
				let viewport = el.querySelector('[data-slot="scroll-area-viewport"]');
				if (title === prefs?.chapter) {
					/** Wait a couple of seconds and then scroll to the last reading position*/
					
					if (prefs?.rememberReadingPosition ?? true) {
						setTimeout(() => {
							viewport?.scrollTo({
								left: 0,
								top: prefs?.lastScrollTop ?? 0,
								behavior: 'smooth'
							});
						}, 1000);
					}
				}
				setTimeout(() => {
					viewport?.addEventListener('scroll', () => {
						preferences.update((x) => ({
							...x,
							tutorial: { ...x.tutorial, lastScrollTop: viewport?.scrollTop }
						}));
					});
				}, 5000);
			}}
		>
			<article class="prose dark:prose-invert max-h-full w-full px-6 py-4">
				<TutorialContent {...tutorialProps} />
			</article>
		</ScrollArea>
	</Tabs.Content>
{/snippet}
<div class="relative h-full w-full">
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

	<div class="absolute top-0 left-0">
		<Tooltip.Provider>
			<Tooltip.Root delayDuration={1200}>
				<Tooltip.Trigger>
					<button
						type="button"
						class="relative flex h-[2.5rem] w-[3rem] items-center justify-center focus:outline-none"
						aria-pressed={rememberReadingPos}
						onclick={() => (rememberReadingPos = !rememberReadingPos)}
						aria-label="remember last reading position"
					>
						<Bookmark
							class="absolute top-1 left-1 m-auto size-6 transition-colors duration-150
                {rememberReadingPos ? 'fill-foreground ' : ''}
                stroke-foreground hover:scale-105"
						/>
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content class="bg-card text-card-foreground" side="top"
					>Remember reading position</Tooltip.Content
				>
			</Tooltip.Root>
		</Tooltip.Provider>
	</div>
</div>
