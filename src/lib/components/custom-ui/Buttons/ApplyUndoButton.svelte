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

<!--
@component
Renders a pair of "Apply" (Save) and "Undo" (Eraser) buttons. This component is typically used to control the state of an external input, providing bindable references to the button elements and their enabled states.

**Props:**
- `updateButton: HTMLElement` - A bindable reference to the 'Apply' button element.
- `updateButtonEnabled: boolean` - Controls the enabled state of the 'Apply' button.
- `undoChangesButton: HTMLElement` - A bindable reference to the 'Undo' button element.
- `undoChangesButtonEnabled: boolean` - Controls the enabled state of the 'Undo' button.

**Usage:**
Bind the button elements and their enabled states to variables in a parent component. The parent is responsible for adding event listeners to the bound button elements.

```svelte
<script lang="ts">
  import ApplyUndoButton from './ApplyUndoButton.svelte';

  let applyBtn: HTMLElement;
  let undoBtn: HTMLElement;
  let canApply = $state(false);
  let canUndo = $state(false);

  $effect(() => {
    // The parent component adds listeners to the bound elements
    applyBtn?.addEventListener('click', () => console.log('Apply clicked!'));
    undoBtn?.addEventListener('click', () => console.log('Undo clicked!'));
  });
</script>

<ApplyUndoButton
  bind:updateButton={applyBtn}
  updateButtonEnabled={canApply}
  bind:undoChangesButton={undoBtn}
  undoChangesButtonEnabled={canUndo}
/>
```
-->

<div class={`my-1 ml-2 flex flex-col content-center justify-around gap-2 align-middle `}>
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
