<script lang="ts">
    import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import { MediaQuery } from "svelte/reactivity";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import Title from '$lib/components/Title.svelte';
  import welcomemd from '$lib/markdown/welcome_en.md?raw';
	import * as Alert from './ui/alert/index.js';
  import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone'
  import { preferences }from '$lib/preferences';
  import { get } from 'svelte/store';
	import Toggle from './ui/toggle/toggle.svelte';
	import Checkbox from './ui/checkbox/checkbox.svelte';
	import Label from './ui/label/label.svelte';
	import { onMount } from 'svelte';
	const markedKatexOptions = {
		throwOnError: false,
	};
  interface Props{
    open: boolean;
  };

  let {
    open = $bindable(true),
  } : Props = $props();
	marked.use(markedKatex(markedKatexOptions));

	const isDesktop = new MediaQuery("(min-width: 768px)");
  
  const DESCRIPTION = "This website allows you to experiment with a 'real' Bloch sphere and learn more about Quantum"
  let showWelcomeAtStart = $state(true);

  onMount(()=>{
    showWelcomeAtStart = get(preferences).showWelcomeAtStart ?? true;
  })
  $effect(()=> {
    preferences.set({showWelcomeAtStart: showWelcomeAtStart});
    console.log(`aggiornato ${showWelcomeAtStart}`);
    
  })
  
</script>

{#snippet welcomeContent()}
  <article class="prose-sm lg:columns-2 dark:prose-invert m-auto lg:m-2">
    {@html marked.parse(welcomemd)}
  </article>
{/snippet}

{#if isDesktop.current}
  <Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[600px] sm:max-h-[70%] z-10000">
      <Dialog.Header>
        <Dialog.Title class="font-light">Welcome to <Title subtitle={false}/>!</Dialog.Title>
        <Dialog.Description>
        {DESCRIPTION}
        </Dialog.Description>
      </Dialog.Header>
      <div class="bg-red">
        {@render welcomeContent()}
      </div>
      <Dialog.Footer>
          <Checkbox id="showWelcomeMessage" bind:checked={showWelcomeAtStart}/>
          <Label for="showWelcomeMessage">Show this message next time</Label>
      </Dialog.Footer>
    </Dialog.Content>
    
  </Dialog.Root>
{:else}
  <Drawer.Root bind:open>
    <Drawer.Content class="pb-4 px-2">
      <Drawer.Header class="text-left">
        <Drawer.Title class="font-light">Welcome to <Title subtitle={false}/>!</Drawer.Title>
        <Drawer.Description>
          {DESCRIPTION}
        </Drawer.Description>
      </Drawer.Header>
      {@render welcomeContent()}
    <Drawer.Footer>
      <Alert.Root variant="destructive">
        <MonitorSmartphone/>
        <Alert.Title>
          This website works best on larger screens
        </Alert.Title>
        <Alert.Description>
          Please view it on a computer for a better experience
        </Alert.Description>
      </Alert.Root >
      <div class="font-destructive">
      </div>
    </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Root>
{/if}
