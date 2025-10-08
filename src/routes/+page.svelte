<script lang="ts">
	import App from '$lib/components/App.svelte';
	import CircleQuestionMark from '@lucide/svelte/icons/message-circle-question';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import Tutorial from '$lib/components/tutorial/Tutorial.svelte';
	import {  onMount } from 'svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import 'mathlive/static.css';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';
	import { Button  } from '$lib/components/ui/button/index.js';
	import Title from '$lib/components/Title.svelte';
	import Info from '@lucide/svelte/icons/info';
	import Welcome from '$lib/components/Welcome.svelte';
	import { preferences } from '$lib/preferences';
	import { get } from 'svelte/store';
	import { scheduleNotifications } from '$lib/notifications';
	import type { TutorialPageProps } from '$lib/components/tutorial/tutorialUtils';
	import Shrimp from '@lucide/svelte/icons/shrimp';

	let showWelcomeAtStart = get(preferences).showWelcomeAtStart ?? true;
	// Get user preferences regarding the state of the sidebar with the tutorial and keep them
	// up to date every time the tutorial is opened or closed so that when the user comes back
	// will find the tutorial in the same state as they left it
	let tutorialVisible = $state(get(preferences).tutorial?.open ?? false);
	$effect(() => {
		preferences.update((x) => ({ ...x, tutorial: { ...x.tutorial, open: tutorialVisible } }));
	});

	/**Wether the page has fully loaded*/
	let loaded = $state(false);

	let innerWidth = $state(0);

	/**Minimum width of the tutorial panel*/
	let resizablePanelMin = $derived(Math.ceil((300 / innerWidth) * 100));

	let welcomeMessageOpen = $state(false);
	const loadingSentencesArray = [
		'Initializing <em>qubit</em>',
		'Inflating <em>Bloch sphere</em>',
		'Opening <em>gates</em>'
	];
	onMount(() => {
		window.scrollY = 300;
		window.MathfieldElement.soundsDirectory = null;
		window.mathVirtualKeyboard.layouts = {
			label: 'Basic',
			rows: [
				['[undo]', '[redo]'],
				[
					'[7]',
					'[8]',
					'[9]',
					'[+]',
					{ label: '[separator]', width: 0.5 },
					'\\theta',
					'\\alpha',
					'\\varphi',
					'\\pi',
					'e',
					'i'
				],
				[
					'[4]',
					'[5]',
					'[6]',
					'[-]',
					{ label: '[separator]', width: 0.5 },
					'[(]',
					'[)]',
					'\\sqrt{#0}',
					{ latex: '\\frac{#@}{#?}', class: 'small' },
					'#@^{#?}',
					'e^{i#0}'
				],
				[
					'[1]',
					'[2]',
					'[3]',
					'\\cdot',
					{ label: '[separator]', width: 0.5 },
					'[',
					']',

					'[separator]',
					'[separator]',
					{ label: '[backspace]', width: 2 }
				],
				[
					{ label: '[0]', width: 2 },
					'[.]',
					'/',
					{ label: '[separator]', width: 0.5 },
					'\\lbrace',
					'\\rbrace',
					'[separator]',
					'[separator]',
					'[left]',
					'[right]'
				]
			]
		};
		loaded = true;
		// Show a welcome message respecting user preferences
		if (showWelcomeAtStart) {
			welcomeMessageOpen = true;
		}
		// Schedule notifications for later for the user not to bombard user with information at startup
		scheduleNotifications();
	});

	let tutorialProps = $state({}) as TutorialPageProps;

</script>

<svelte:window bind:innerWidth />

<Welcome bind:open={welcomeMessageOpen} />

<!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mathlive/mathlive-static.css" /> -->
<div class="flex h-svh flex-col overflow-hidden">
	<!-- Header -->
	<div
		class="bg-foreground flex w-[100%] flex-row-reverse items-center justify-between p-2 px-6 text-center text-xl text-(--background) md:flex-row md:text-left md:text-2xl"
	>
		<Button onclick={toggleMode} variant="secondary" size="sm" class="group scale-80 md:scale-100">
			<MoonIcon
				class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all delay-300 duration-500 dark:scale-0 dark:-rotate-180"
			/>
			<SunIcon
				class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-180 !transition-all delay-300 duration-500 dark:scale-100 dark:rotate-0"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
		<div>
			<!-- The line with title is a hacky way to change the title style using CSS, 
			if using svelte media queries it gets calculated only after part of the content has loaded -->
			<Title subtitle={false} /> <span class="hidden lg:inline"><Title title={false} /></span>
			<!-- <Toggle bind:pressed={welcomeMessageOpen} class={buttonVariants.variants.variant.link}>
				<Info />
			</Toggle> -->
			<Button
				variant="ghost"
				size="default"
				onclick={() => {
					welcomeMessageOpen = !welcomeMessageOpen;
				}}
				aria-label="info about website"
				class="group scale-80 hover:bg-white/0 md:scale-100"
			>
				<Info
					class="h-[1.2rem] w-[1.2rem]  scale-100 rotate-0 !transition-all delay-3000 duration-500 group-hover:scale-0 group-hover:-rotate-180"
				/>
				<Shrimp
					class="stroke-background absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-180 !transition-all delay-3000 duration-500 group-hover:scale-100 group-hover:rotate-0"
				/>
			</Button>
		</div>
		<Toggle
			variant="outline"
			bind:pressed={tutorialVisible}
			class="{tutorialVisible ? 'max-md:order-first' : 'hidden'}  md:flex {loaded
				? ''
				: 'opacity-0'}"
		>
			<CircleQuestionMark />
			Tutorial
		</Toggle>
	</div>
	<!-- Body -->
	{#if !loaded}
		<div
			class="bg-muted flex h-full w-full animate-pulse flex-col place-content-center items-center"
		>
			<LoaderCircle class="h animate-spin" />
			<p class="animate-small-ping">
				{@html loadingSentencesArray[1]}
			</p>
		</div>
	{:else}
		<Resizable.PaneGroup direction="horizontal" autoSaveId='tutorialPane'>
			<Resizable.Pane minSize={resizablePanelMin}>
				<div class="bg-background @container h-full min-h-0 w-full flex-1">
					<App bind:tutorialProps />
				</div>
			</Resizable.Pane>
			{#if tutorialVisible}
				<Resizable.Handle withHandle />
				<Resizable.Pane minSize={resizablePanelMin}>
					<div class="bg-background @container h-full min-h-0 w-full flex-1 p-2">
						<Tutorial {tutorialProps} />
					</div>
				</Resizable.Pane>
			{/if}
		</Resizable.PaneGroup>
	{/if}
	<!-- Footer -->
</div>
