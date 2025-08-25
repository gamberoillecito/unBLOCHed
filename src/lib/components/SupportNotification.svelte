<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import Title from '$lib/components/Title.svelte'
    import GitHubIcon from './custom-ui/GitHubIcon.svelte';
    console.log(typeof(GitHubIcon));
    
	interface Props {
		title: string;
	}
	
	let {
		title
	}:Props = $props();
</script>

<div class="prose">
	<h5>
		{title} Do you like <Title subtitle={false}/>?
	</h5>
	<div class="flex flex-row gap-3 items-center">
		<article class="prose-sm">
			If you do, give it a <b>star</b> on GitHub! 
		</article>
		<Button variant='outline'><GitHubIcon/></Button>
	</div>
</div>