
<script lang="ts">
	import '../app.css';
	import { Toaster } from "$lib/components/ui/sonner";
	import { ModeWatcher } from "mode-watcher";
	let { children } = $props();

</script>
<ModeWatcher />
<Toaster
	toastOptions={{
		unstyled: true,
		class: 'w-fit flex flex-row border-1 gap-2 px-4 py-3  align-baseline shadow-sm rounded-md bg-card fg-card'
	}}
/>

<!-- CSS styles for katex to render formulas correctly -->
<svelte:head>
	<title>unBLOCHed</title>
	<meta name="description" content="Interactive and intuitive Bloch spehere simulator " />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn" crossorigin="anonymous">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
	<link href="https://fonts.googleapis.com/css2?family=AR+One+Sans:wght@400..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
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