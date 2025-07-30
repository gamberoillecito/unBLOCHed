<script lang="ts">
	import App from '$lib/components/App.svelte';
	import CircleQuestionMark from '@lucide/svelte/icons/message-circle-question';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import Button from '$lib/components/ui/button/button.svelte';

  let tutorialVisible = $state(false);
</script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mathlive/mathlive-static.css" />
<div class="flex h-svh flex-col">
	<!-- Header -->
	<div
		class="bg-foreground text-(--background) w-[100%] flex-none items-center justify-between p-2 text-center text-xl lg:flex lg:pl-6 lg:text-left lg:text-2xl"
	>
		<span class=""
			><span class="font-normal">un</span><span class="font-semibold">BLOCH</span><span
				class="font-normal">ed</span
			> <span class="font-light">- Bloch sphere simulator</span></span
		>
    <Button variant="secondary" class="hidden lg:flex" onclick={()=>{tutorialVisible = !tutorialVisible}}>

      <CircleQuestionMark />
      Tutorial
    </Button>
	</div>
	<!-- Body -->
	<Resizable.PaneGroup direction="horizontal">
		<Resizable.Pane>
      <div class="@container h-full w-full">
        <App />
      </div>      
    </Resizable.Pane>
    {#if tutorialVisible}
      <Resizable.Handle  withHandle/>
      <Resizable.Pane>Two</Resizable.Pane>
    {/if}
	</Resizable.PaneGroup>
	<!-- Footer -->
</div>
