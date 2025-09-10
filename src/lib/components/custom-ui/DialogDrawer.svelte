<script lang="ts">
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import { MediaQuery } from "svelte/reactivity";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import type { Snippet } from "svelte";
    
    interface Props {
        dialogContent: Snippet;
        drawerContent: Snippet;
        open: boolean;
    };
    
    let {
        dialogContent,
        drawerContent,
        open = $bindable(),
    }: Props = $props();
	const isDesktop = new MediaQuery("(min-width: 768px)");
</script>
{#if isDesktop.current}
  <Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[600px] sm:max-h-[70%] z-10000">
        {@render dialogContent()}
    </Dialog.Content>
    
  </Dialog.Root>
{:else}
  <Drawer.Root bind:open>
    <Drawer.Content class="pb-4 px-2 z-10000 max-h-[90%]">
        {@render drawerContent()}
    </Drawer.Content>
  </Drawer.Root>
{/if}