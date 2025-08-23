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
        <svg role="img" class="fill-foreground" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
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
