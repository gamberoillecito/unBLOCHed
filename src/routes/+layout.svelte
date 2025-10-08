<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import '@fontsource-variable/ar-one-sans';
	let { children } = $props();
</script>

<ModeWatcher />
<Toaster
	toastOptions={{
		unstyled: true,
		class: "my-toaster",
		classes: {
			toast:
				'flex flex-row border-1 border-primary gap-2 px-4 py-2 h-fit items-end justify-items-start shadow-xl rounded-md bg-card fg-card w-fit w-xs max-w-[500px] justify-around',
			title: 'prose dark:prose-invert grow m-t-0 font-semibold',
			description: 'prose-sm grow font-light',
			actionButton: `${buttonVariants.variants.variant.default} size-fit p-1 -translate-y-[1em] w-fit text-sm md:text-xs font-medium`,
			icon: 'size-4 col-span-1 shrink self-start translate-y-[0.5em]',
			closeButton:
				`my-close-button absolute top-0 right-0 size-6 md:size-4 flex items-center justify-center z-1 rounded-tr-md rounded-bl-md hover:opacity-50 border-b-2 border-l-2 border-primary!  bg-card`
		}
	}}
	closeButton
/>

<!-- CSS styles for katex to render formulas correctly -->
<svelte:head>
	<title>unBLOCHed</title>
	<meta
		name="description"
		content="Interactive and intuitive Bloch sphere simulator, fully open source."
	/>

	<link href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" rel="preload" as="style">
	
	<meta property="og:title" content="unBLOCHed" />
    <meta property="og:description" content="Interactive and intuitive Bloch sphere simulator, fully open source." />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="unBLOCHed" />
    <!-- Use an absolute URL for best results (replace /og-image.png with your image path) -->
    <meta property="og:image" content="https://repository-images.githubusercontent.com/860586143/96886da8-900a-492d-aca7-75d8e09b539a" />
    <meta property="og:image:alt" content="unBLOCHed — Bloch sphere simulator screenshot" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="unBLOCHed" />
    <meta name="twitter:description" content="Interactive and intuitive Bloch sphere simulator, fully open source." />
    <meta name="twitter:image" content="https://repository-images.githubusercontent.com/860586143/96886da8-900a-492d-aca7-75d8e09b539a" />
	<script
		defer
		src="https://cloud.umami.is/script.js"
		data-website-id="0ee63b18-31fe-4396-9051-84766149f498"
	></script>
</svelte:head>
{@render children()}

<style>

	:global(math-field::part(menu-toggle)) {
		display: none;
	}
	:global(math-field::part(virtual-keyboard-toggle)) {
		display: none;
	}
	:global(math-field) {
		/* background-color: var(--color-background); */
		background-color: inherit;
		color: var(--color-foreground);
	}

</style>
