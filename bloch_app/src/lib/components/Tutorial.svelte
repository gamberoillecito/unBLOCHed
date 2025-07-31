<script lang="ts">
 import * as Tabs from "$lib/components/ui/tabs/index.js";
 import tutorial1 from '$lib/tutorial_pages/tutorial_1_en.md?raw'
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
	import ScrollArea from "./ui/scroll-area/scroll-area.svelte";
	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));
</script>
 
<Tabs.Root value="account" class="flex flex-col items-center h-full min-h-0">

 <Tabs.List>
  <Tabs.Trigger value="account">Tutorial 1</Tabs.Trigger>
  <Tabs.Trigger value="password">Password</Tabs.Trigger>
 </Tabs.List>
 <Tabs.Content value="account" class="flex-1 min-h-0 bg-card border shadow-sm rounded-xl mx-4 my-2">
    <ScrollArea class="h-full w-full">
        <article class="prose max-h-full w-full px-6 py-4 " 
        {@attach (p)=> {p.innerHTML = marked.parse(tutorial1) as string}}></article>
    </ScrollArea>
 </Tabs.Content>
 <Tabs.Content value="password">Change your password here.</Tabs.Content>
</Tabs.Root>