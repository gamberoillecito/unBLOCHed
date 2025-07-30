<script lang="ts">
 import * as Tabs from "$lib/components/ui/tabs/index.js";
 import tutorial1 from '$lib/tutorial_pages/tutorial_1_en.md?raw'
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';

  import * as Card from "$lib/components/ui/card/index.js";
	import { Content } from "./ui/context-menu";
	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));
</script>
 
<Tabs.Root value="account" class="flex flex-col items-center h-full min-h-0">
  <Tabs.List>
    <Tabs.Trigger value="account">Qubit</Tabs.Trigger>
    <Tabs.Trigger value="password">State</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account" class="h-full flex-1 min-h-0">
    <Card.Root class=" h-full min-h-0 flex flex-col">
      <Card.Content class="flex-1 min-h-0 m-2 overflow-auto">
        <article
          class="prose w-full p-4"
          {@attach (p)=> {p.innerHTML = marked.parse(tutorial1) as string}}
        ></article>
      </Card.Content>
    </Card.Root>
  </Tabs.Content>
  <Tabs.Content value="password">Change your password here.</Tabs.Content>
</Tabs.Root>