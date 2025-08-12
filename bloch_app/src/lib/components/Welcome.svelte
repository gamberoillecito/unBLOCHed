<script lang="ts">
    import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import { MediaQuery } from "svelte/reactivity";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import Title from '$lib/components/Title.svelte';
    import welcomemd from '$lib/markdown/welcome_en.md?raw';

	const markedKatexOptions = {
		throwOnError: false,
	};
	marked.use(markedKatex(markedKatexOptions));
	let open = $state(true);
	const isDesktop = new MediaQuery("(min-width: 768px)");
</script>

{#if isDesktop.current}
  <Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[600px] sm:max-h-[50%] z-10000">
      <Dialog.Header>
        <Dialog.Title class="font-light">Welcome to <Title withSubTitle={false}/>!</Dialog.Title>
        <Dialog.Description>
		This website allows you to experiment with a "real" Bloch sphere
        </Dialog.Description>
      </Dialog.Header>
	  <article class="prose-sm columns-2 dark:prose-invert">
		{@html marked.parse(welcomemd)}
	  </article>
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Drawer.Root bind:open>
    <Drawer.Content>
      <Drawer.Header class="text-left">
        <Drawer.Title>Edit profile</Drawer.Title>
        <Drawer.Description>
          Make changes to your profile here. Click save when you're done.
        </Drawer.Description>
      </Drawer.Header>
      <form class="grid items-start gap-4 px-4">
        <div class="grid gap-2">
		ciao
        </div>
        <div class="grid gap-2">
		ciao
        </div>
        <Button type="submit">Save changes</Button>
      </form>
      <Drawer.Footer class="pt-2">
        <Drawer.Close class={buttonVariants({ variant: "outline" })}
          >Cancel</Drawer.Close
        >
      </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Root>
{/if}
