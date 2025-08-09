<script lang="ts">
    import * as Popover from "$lib/components/ui/popover/index.js";
	import type { Snippet } from "svelte";
    interface Props {
        isOpen: boolean;
        trigger: Snippet;
        popoverContent: Snippet
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
        side='top'
        align='center'
        trapFocus={false}
        onOpenAutoFocus={(e) => {
            e.preventDefault();
        }}
        onCloseAutoFocus={(e) => {
            e.preventDefault();
        }}>
        {@render popoverContent()}
    </Popover.Content>
</Popover.Root>