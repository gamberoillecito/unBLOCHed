
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
{@render children()}
