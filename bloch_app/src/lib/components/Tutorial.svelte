<script lang="ts">
 import * as Tabs from "$lib/components/ui/tabs/index.js";
 import tutorial1 from '$lib/tutorial_pages/tutorial_1_en.md?raw'
 import tutorial2 from '$lib/tutorial_pages/tutorial_2_en.md?raw'
 import tutorial3 from '$lib/tutorial_pages/tutorial_3_en.md?raw'
 import tutorial4 from '$lib/tutorial_pages/tutorial_4_en.md?raw'
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
	import ScrollArea from "./ui/scroll-area/scroll-area.svelte";
	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));

    const tutorialList = [
        {
            mdContent: tutorial1,
            title: "Qubits",
        }, 
        {
            mdContent: tutorial2,
            title: "Bloch Sphere",
        },
        {
            mdContent: tutorial3,
            title: "States",
        },
        {
            mdContent: tutorial4,
            title: "Gates",
        },
        ]
</script>

{#snippet tabContent(title: string, mdContent:string)}
 <Tabs.Content value={title} class="flex-1 min-h-0 bg-card border shadow-sm rounded-xl mx-4 my-2">
    <ScrollArea class="h-full w-full">
        <article class="prose max-h-full w-full px-6 py-4 " 
        {@attach (p)=> {p.innerHTML = marked.parse(mdContent) as string}}></article>
    </ScrollArea>
 </Tabs.Content>
{/snippet}
 
<Tabs.Root value={tutorialList[0].title} class="flex flex-col items-center h-full min-h-0">

 <Tabs.List>
    {#each tutorialList as tut}
      <Tabs.Trigger value={tut.title}>{tut.title}</Tabs.Trigger>
    {/each}
 </Tabs.List>
 {#each tutorialList as tut}
     {@render tabContent(tut.title, tut.mdContent)}
 {/each}
</Tabs.Root>