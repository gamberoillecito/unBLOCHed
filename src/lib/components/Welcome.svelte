<script lang="ts">
	import { marked } from 'marked';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import markedKatex from 'marked-katex-extension';
	import { Button } from '$lib/components/ui/button/index.js';
	import Title from '$lib/components/Title.svelte';
	import welcomemd from '$lib/markdown/welcome_en.md?raw';
	import * as Alert from './ui/alert/index.js';
	import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
	import { preferences } from '$lib/preferences';
	import { get } from 'svelte/store';
	import Checkbox from './ui/checkbox/checkbox.svelte';
	import Label from './ui/label/label.svelte';
	import { onMount } from 'svelte';
	import GitHubIcon from './custom-ui/GitHubIcon.svelte';
	import DialogDrawer from './custom-ui/DialogDrawer.svelte';
	const markedKatexOptions = {
		throwOnError: false
	};
	interface Props {
		open: boolean;
	}

	let { open = $bindable(true) }: Props = $props();
	marked.use(markedKatex(markedKatexOptions));

	const DESCRIPTION =
		"This website allows you to experiment with a 'real' Bloch sphere and learn more about Quantum";
	let showWelcomeAtStart = $state(true);

	onMount(() => {
		showWelcomeAtStart = get(preferences).showWelcomeAtStart ?? true;
	});
	$effect(() => {
		preferences.update((x) => {
			return { ...x, showWelcomeAtStart: showWelcomeAtStart };
		});
	});
</script>

{#snippet welcomeContent()}
	<article class="prose-sm dark:prose-invert m-auto md:columns-2 lg:m-2">
		{@html marked.parse(welcomemd)}
	</article>
{/snippet}

{#snippet githubButton()}
	<Button
		name="github link"
		aria-label="github link"
		variant="outline"
		href="https://github.com/gamberoillecito/unBLOCHed"
		target="_blank"
	>
		<GitHubIcon />
		Find out more on GitHub
	</Button>
{/snippet}

<DialogDrawer bind:open>
	{#snippet dialogContent()}
		<Dialog.Header>
			<Dialog.Title class="font-light">Welcome to <Title subtitle={false} />!</Dialog.Title>
			<Dialog.Description>
				{DESCRIPTION}
			</Dialog.Description>
		</Dialog.Header>
		{@render welcomeContent()}
		<div class="m-auto max-w-[300px]">
			{@render githubButton()}
		</div>
		<Dialog.Footer>
			<Checkbox id="showWelcomeMessage" bind:checked={showWelcomeAtStart} />
			<Label for="showWelcomeMessage">Show this popup next time</Label>
		</Dialog.Footer>
	{/snippet}
	{#snippet drawerContent()}
		<Drawer.Header class="text-left">
			<Drawer.Title class="text-xl font-light">Welcome to <Title subtitle={false} />!</Drawer.Title>
			<Drawer.Description>
				{DESCRIPTION}
				<Alert.Root variant="warning" class="mx-auto mt-4 max-w-[95%]">
					<MonitorSmartphone />
					<Alert.Description>
						The tutorial panel is not available on smaller screens. Visit this website on your PC
						for a better experience
					</Alert.Description>
				</Alert.Root>
			</Drawer.Description>
		</Drawer.Header>
		<Drawer.Footer>
			{@render githubButton()}
			<div class="justify-start-safe mt-2 flex flex-row-reverse gap-2">
				<Checkbox id="showWelcomeMessage" bind:checked={showWelcomeAtStart} />
				<Label for="showWelcomeMessage">Show this message next time</Label>
			</div>
		</Drawer.Footer>
	{/snippet}
</DialogDrawer>
