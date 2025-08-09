<script lang="ts">
    import * as Popover from "$lib/components/ui/popover/index.js";
	import type { Snippet } from "svelte";
    interface Props {
        isOpen: boolean;
        trigger: Snippet;
        popoverContent: string|null
    }

    let {
        isOpen,
        trigger,
        popoverContent,
    }: Props = $props();
</script>

<Popover.Root open={isOpen}>
    <Popover.Trigger disabled>
        {@render trigger()}
    </Popover.Trigger>
    <Popover.Content class="py-1 px-2 w-fit bg-destructive"
        interactOutsideBehavior='ignore'
        escapeKeydownBehavior="ignore"
        side='top'
        align='center'
        trapFocus={false}
        onOpenAutoFocus={(e) => {
            e.preventDefault();
        }}
        onCloseAutoFocus={(e) => {
            e.preventDefault();
        }}>
        <article class="prose-sm text-destructive-foreground"> {popoverContent} </article>
    </Popover.Content>
</Popover.Root>