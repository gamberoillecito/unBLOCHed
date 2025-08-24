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
	import GitHubIcon from './custom-ui/GitHubIcon.svelte';
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
  })
  
</script>

{#snippet welcomeContent()}
  <article class="prose-sm md:columns-2 dark:prose-invert m-auto lg:m-2">
    {@html marked.parse(welcomemd)}
  </article>
{/snippet}

{#snippet githubButton()}
      <Button
        name="github link"
        aria-label="github link"
        variant="outline"
        href="https://github.com/gamberoillecito/unBLOCHed"
        target="_blank"
      >
        <GitHubIcon/>
        Find out more on GitHub 
      </Button>
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
        {@render welcomeContent()}
        <div class="max-w-[300px] m-auto">
          {@render githubButton()}
        </div>
      <Dialog.Footer>
          <Checkbox id="showWelcomeMessage" bind:checked={showWelcomeAtStart}/>
          <Label for="showWelcomeMessage">Show this popup next time</Label>
      </Dialog.Footer>
    </Dialog.Content>
    
  </Dialog.Root>
{:else}
  <Drawer.Root bind:open>
    <Drawer.Content class="pb-4 px-2 z-10000 max-h-[90%]">
      <Alert.Root variant="destructive" class="mx-auto py-4 max-w-[95%]">
        <MonitorSmartphone/>
        <Alert.Title>
          This website works best on larger screens
        </Alert.Title>
        <Alert.Description>
          Please view it on a computer for a better experience
        </Alert.Description>
      </Alert.Root >
      <Drawer.Header class="text-left">
        <Drawer.Title class="font-light">Welcome to <Title subtitle={false}/>!</Drawer.Title>
        <Drawer.Description>
          {DESCRIPTION}
        </Drawer.Description>
      </Drawer.Header>
    <Drawer.Footer>
    {@render githubButton()}
    </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Root>
{/if}
