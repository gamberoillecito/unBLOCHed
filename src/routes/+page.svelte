<script lang="ts">
	import App from '$lib/components/App.svelte';
	import CircleQuestionMark from '@lucide/svelte/icons/message-circle-question';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import Tutorial from '$lib/components/Tutorial.svelte';
	import { createRawSnippet, onMount } from 'svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import 'mathlive/static.css';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import Title from '$lib/components/Title.svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import Info from '@lucide/svelte/icons/info';
	import Welcome from '$lib/components/Welcome.svelte';
	import { preferences } from '$lib/preferences';
	import { get } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import SupportNotification from '$lib/components/SupportNotification.svelte';
	import CustomToast from '$lib/components/custom-ui/CustomToast.svelte';
	import GitHubIcon from '$lib/components/custom-ui/GitHubIcon.svelte';

	let showWelcomeAtStart = get(preferences).showWelcomeAtStart;
	let tutorialVisible = $state(false);
	let loaded = $state(false);

	let innerWidth = $state(0);

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
		loaded = true;
		if (showWelcomeAtStart) {
			welcomeMessageOpen = true;
		}

		toast('Do you like unBLOCHed?', {
			icon: GitHubIcon,
			action: {
				label: 'GitHub',
				onClick: () => {}
			},
			description: 'Give it a star!',
			duration: 99999
		});
		toast('Do you like unBLOCHed?', {
			icon: GitHubIcon,
			action: {
				label: 'GitHub',
				onClick: () => {}
			},
			description: 'Give it a star!',
			duration: 99999
		});
	});

	const isDesktop = new MediaQuery('(min-width: 768px)');
</script>

<svelte:window bind:innerWidth />

<Welcome bind:open={welcomeMessageOpen} />

<!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mathlive/mathlive-static.css" /> -->
<div class="flex h-svh flex-col overflow-hidden">
	<!-- Header -->
	<div
		class="bg-foreground flex w-[100%] flex-row-reverse items-center justify-between p-2 px-6 text-center text-xl text-(--background) lg:flex-row lg:text-left lg:text-2xl"
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
				onclick={() => {
					welcomeMessageOpen = !welcomeMessageOpen;
				}}
				aria-label="info about website"
			>
				<Info />
			</Button>
		</div>
		<Toggle
			variant="outline"
			bind:pressed={tutorialVisible}
			class="hidden lg:flex {loaded ? '' : 'opacity-0'}"
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
		<Resizable.PaneGroup direction="horizontal">
			<Resizable.Pane minSize={resizablePanelMin}>
				<div class="bg-background @container h-full min-h-0 w-full flex-1">
					<App />
				</div>
			</Resizable.Pane>
			{#if tutorialVisible}
				<Resizable.Handle withHandle />
				<Resizable.Pane minSize={resizablePanelMin}>
					<div class="bg-background @container h-full min-h-0 w-full flex-1 p-2">
						<Tutorial />
					</div>
				</Resizable.Pane>
			{/if}
		</Resizable.PaneGroup>
	{/if}
	<!-- Footer -->
</div>
