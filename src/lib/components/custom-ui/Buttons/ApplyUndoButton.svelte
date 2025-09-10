<script lang="ts">
	import { Button, buttonVariants, type ButtonVariant } from '$lib/components/ui/button/index.js';
	import Save from '@lucide/svelte/icons/save';
	import Eraser from '@lucide/svelte/icons/eraser';

	interface Props {
		updateBtton: HTMLElement;
		updateButtonEnabled: boolean;
		undoChangesButton: HTMLElement;
		undoChangesButtonEnabled: boolean;
		instantUpdate?: boolean;
	}

	let {
		updateButton = $bindable(),
		updateButtonEnabled,
		undoChangesButton = $bindable(),
		undoChangesButtonEnabled
	} = $props();
</script>

<div class={`m-auto flex flex-col content-center justify-around gap-2 align-middle @xl:flex-row`}>
	<Button
		class="size-6 rounded-sm bg-(--approve) hover:bg-(--approve) hover:opacity-75 dark:bg-(--approve)"
		variant="outline"
		bind:ref={updateButton}
		disabled={!updateButtonEnabled}
		name="apply changes"
		aria-label="apply changes"
	>
		<!-- <Save /> -->
		<Save class="size-4 stroke-(--approve-foreground)" />
	</Button>
	<Button
		class="size-6 rounded-sm"
		variant="destructive"
		bind:ref={undoChangesButton}
		disabled={!undoChangesButtonEnabled}
		name="restore"
		aria-label="restore"
	>
		<!-- <Trash />-->
		<Eraser class=" size-4" />
	</Button>
</div>
