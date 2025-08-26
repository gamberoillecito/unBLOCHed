<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { Button, buttonVariants, type ButtonVariant } from '$lib/components/ui/button/index.js';
	let { children } = $props();
</script>

<ModeWatcher />
<Toaster
	toastOptions={{
		unstyled: true,
		classes: {
			toast:
				'flex flex-row border-1 gap-2 px-4 py-3 items-end justify-items-start shadow-sm rounded-md bg-card fg-card w-fit min-w-[200px] max-w-[500px] justify-between',
			title: 'prose dark:prose-invert grow m-t-0',
			description: 'prose-sm grow',
			actionButton: `${buttonVariants.variants.variant.secondary} size-fit p-1 -translate-y-[1em] w-fit text-sm md:text-xs font-medium`,
			icon: 'size-4 col-span-1 shrink self-start translate-y-[0.5em]',
			closeButton: 'absolute top-0 left-0 size-6 p-auto  border-2 border-white'
		}, 

	}}
	
/>

<!-- CSS styles for katex to render formulas correctly -->
<svelte:head>
	<title>unBLOCHed</title>
	<meta name="description" content="Interactive and intuitive Bloch spehere simulator" />
	<script
		defer
		src="https://cloud.umami.is/script.js"
		data-website-id="0ee63b18-31fe-4396-9051-84766149f498"
	></script>
</svelte:head>
{@render children()}

<style>
	@import url('https://fonts.googleapis.com/css2?family=AR+One+Sans:wght@400..700&display=swap');

	@import url('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css');
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
