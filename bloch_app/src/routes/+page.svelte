<script lang="ts">
	import App from '$lib/components/App.svelte';
	import CircleQuestionMark from '@lucide/svelte/icons/message-circle-question';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { Toggle } from "$lib/components/ui/toggle/index.js";
	import Tutorial from '$lib/components/Tutorial.svelte';
  import {onMount} from 'svelte'
  import ProvaML from '$lib/components/ProvaML.svelte'
  let tutorialVisible = $state(false);
  onMount(()=>{
    window.scrollY = 300;
    window.MathfieldElement.soundsDirectory = null;
  })
  
  
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=AR+One+Sans:wght@400..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
</style>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mathlive/mathlive-static.css" />
<div class="flex h-svh overflow-hidden flex-col ">
	<!-- Header -->
	<div
		class="bg-foreground text-(--background) w-[100%] flex-none items-center justify-between p-2 text-center text-xl lg:flex lg:pl-6 lg:text-left lg:text-2xl"
	>
  <button onclick={()=>{console.log("click")}}>prova</button>
		<span class=""
			><span class="font-normal">un</span><span class="font-semibold">BLOCH</span><span
				class="font-normal">ed</span
			> <span class="font-light">- Bloch sphere simulator</span></span
		>
    <Toggle variant="outline" bind:pressed={tutorialVisible} class="hidden lg:flex">

      <CircleQuestionMark />
      Tutorial
    </Toggle>
	</div>
	<!-- Body -->
	<Resizable.PaneGroup direction="horizontal">
		<Resizable.Pane>
      <div class="@container h-full w-full flex-1 min-h-0">
        <App />
      </div>      
    </Resizable.Pane>
    {#if tutorialVisible}
      <Resizable.Handle  withHandle/>
      <Resizable.Pane>
      <div class="@container h-full w-full flex-1 min-h-0 p-2">
        <Tutorial/>
      </div>      
      </Resizable.Pane>
    {/if}
	</Resizable.PaneGroup>
	<!-- Footer -->
</div>

