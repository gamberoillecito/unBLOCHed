<script lang="ts">
	import App from '$lib/components/App.svelte';
	import CircleQuestionMark from '@lucide/svelte/icons/message-circle-question';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import Tutorial from '$lib/components/Tutorial.svelte';
	import { onMount } from 'svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import 'mathlive/static.css';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';

	let tutorialVisible = $state(false);
	let loaded = $state(false);

	let innerWidth = $state(0);

	let resizablePanelMin = $derived(Math.ceil((300 / innerWidth) * 100));
	const loadingSentencesArray = [
		'Initializing <em>qubit</em>',
		'Inflating <em>Bloch sphere</em>',
		'Opening <em>gates</em>'
	];
	onMount(() => {
		window.scrollY = 300;
		window.MathfieldElement.soundsDirectory = null;
		loaded = true;
	});
</script>

<svelte:window bind:innerWidth />
<svelte:head>
	<title>unBLOCHed</title>
	<meta name="description" content="Interactive and intuitive Bloch spehere simulator " />
</svelte:head>

<!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mathlive/mathlive-static.css" /> -->
<div class="flex h-svh flex-col overflow-hidden">
	<!-- Header -->
	<div
		class="bg-foreground text-(--background) w-[100%] flex-none items-center justify-between p-2 text-center text-xl lg:flex lg:pl-6 lg:text-left lg:text-2xl"
	>
		<Button onclick={toggleMode} variant="secondary" size="sm" class="group ">
			<MoonIcon
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 !transition-all duration-300 dark:-rotate-90 dark:scale-0"
			/>
			<SunIcon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 !transition-all duration-300 dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
		<span class=""
			><span class="font-normal">un</span><span class="font-semibold">BLOCH</span><span
				class="font-normal">ed</span
			> <span class="font-light">- Bloch sphere simulator</span></span
		>
		{#if loaded}
			<Toggle variant="outline" bind:pressed={tutorialVisible} class="hidden lg:flex">
				<CircleQuestionMark />
				Tutorial
			</Toggle>
		{/if}
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
				<div class="@container bg-background h-full min-h-0 w-full flex-1">
					<App />
				</div>
			</Resizable.Pane>
			{#if tutorialVisible}
				<Resizable.Handle withHandle />
				<Resizable.Pane minSize={resizablePanelMin}>
					<div class="@container bg-background h-full min-h-0 w-full flex-1 p-2">
						<Tutorial />
					</div>
				</Resizable.Pane>
			{/if}
		</Resizable.PaneGroup>
	{/if}
	<!-- Footer -->
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=AR+One+Sans:wght@400..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
</style>
