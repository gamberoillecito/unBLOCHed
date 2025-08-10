
<script lang="ts">
	import '../app.css';
	import { Toaster } from "$lib/components/ui/sonner";

	let { children } = $props();
</script>

<Toaster
	toastOptions={{
		unstyled: true,
		class: 'w-fit flex flex-row border-1 gap-2 px-4 py-3  align-baseline shadow-sm rounded-md bg-card fg-card'
	}}
/>

<!-- CSS styles for katex to render formulas correctly -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn" crossorigin="anonymous">
{@render children()}
