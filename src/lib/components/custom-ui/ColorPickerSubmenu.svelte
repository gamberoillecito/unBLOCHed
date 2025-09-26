<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Palette from '@lucide/svelte/icons/palette';
	import ColorPicker from 'svelte-awesome-color-picker';
	import Undo from '@lucide/svelte/icons/undo';
	interface Props {
		hexBindColor: string | null;
	}
    let { hexBindColor = $bindable()} = $props();
</script>

<DropdownMenu.SubContent>
	<DropdownMenu.Item
		closeOnSelect={false}
		onclick={() => {
			hexBindColor = null;
		}}><Undo />Restore Default</DropdownMenu.Item
	>
	<DropdownMenu.Sub>
		<DropdownMenu.SubTrigger><Palette /> Pick a Color</DropdownMenu.SubTrigger>
		<DropdownMenu.SubContent>
			<ColorPicker
				bind:hex={hexBindColor}
				isDialog={false}
				isOpen={true}
				isTextInput={true}
				isAlpha={false}
				textInputModes={['hex', 'rgb']}
				--cp-border-color="none"
				--cp-bg-color="none"
				--cp-text-color="var(--foreground)"
				--cp-input-color="var(--muted)"
				--cp-button-hover-color="var(--input)"
				--focus-color="var(--foreground)"
			/>
		</DropdownMenu.SubContent>
	</DropdownMenu.Sub>
</DropdownMenu.SubContent>
