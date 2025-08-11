
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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn" crossorigin="anonymous">
{@render children()}

<style>
:global(math-field::part(menu-toggle)) {
  display: none;
}
:global(math-field::part(virtual-keyboard-toggle)) {
    display: none;
}
:global(math-field) {
    background-color: var(--color-background);
	color: var(--color-foreground);
}

</style>