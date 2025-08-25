<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { onMount, type Component } from 'svelte';
	import { toast } from 'svelte-sonner';
    import GitHubIcon from './custom-ui/GitHubIcon.svelte';
    console.log(typeof(GitHubIcon));
    
	onMount(() => {
		toast('Do you like this website?', {
			description: "If you do, star it on GitHub. If you don't, let me know how to improve it!",
            action: {
                label: GitHubIcon as Component,
                onClick: ()=> console.log('Ciao')
            },
            duration: 99999
		});
	});
</script>
