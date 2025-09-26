<script lang="ts">
	import { type sceneSettings } from '$lib/components/Scene.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Menu from '@lucide/svelte/icons/menu';
	import Undo from '@lucide/svelte/icons/undo';
	import { Button, buttonVariants, type ButtonVariant } from '$lib/components/ui/button/index.js';
	import Palette from '@lucide/svelte/icons/palette';
	import ColorPicker from 'svelte-awesome-color-picker';
	import ImageDown from '@lucide/svelte/icons/image-down';
	import { toast } from 'svelte-sonner';

	interface Props {
		settings3DScene: sceneSettings;
		SceneMenuDownloadOpen: boolean;
		SceneMenuDownloadTrigger: HTMLElement;
		transparentBackground: boolean;
		getImage: (withBackground?: boolean) => string;
	}

	let {
		settings3DScene,
		SceneMenuDownloadOpen = $bindable(),
		SceneMenuDownloadTrigger = $bindable(),
		transparentBackground = $bindable(),
		getImage = $bindable()
	} = $props();

	function saveImage(
		getImage: (withBackground?: boolean) => string,
		withBackground: boolean = true
	) {
		if (getImage) {
			let imgData = getImage(withBackground);
			// Create a temporary link element
			const link = document.createElement('a');
			link.href = imgData;
			const bgSuffix = withBackground ? 'bg' : 'nobg';
			link.download = `bloch-sphere-${bgSuffix}-${new Date().toISOString().replace(/:/g, '-')}.png`;

			// Trigger download
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			toast.success('Download started', {
				description: 'Check out your download folder',
				position: 'bottom-right',
				closeButton: false
			});
		} else {
			toast.error('Image data not available');
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		name="menu"
		aria-label="menu"
		class="absolute top-[0] right-0 z-[9999] p-2 ${buttonVariants.variants.variant.secondary} "
	>
		<Menu />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.CheckboxItem bind:checked={settings3DScene.displayAngles}
			>Show Angles</DropdownMenu.CheckboxItem
		>
		<DropdownMenu.CheckboxItem bind:checked={settings3DScene.displayPaths}
			>Show Paths</DropdownMenu.CheckboxItem
		>
		<DropdownMenu.CheckboxItem bind:checked={settings3DScene.displayStateLabels}
			>Show Labels</DropdownMenu.CheckboxItem
		>
		<DropdownMenu.Separator></DropdownMenu.Separator>
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger>Vector Color</DropdownMenu.SubTrigger>
			<DropdownMenu.SubContent>
				<DropdownMenu.Item
					closeOnSelect={false}
					onclick={() => {
						settings3DScene.vectorColor = null;
					}}><Undo />Restore Default</DropdownMenu.Item
				>
				<DropdownMenu.Sub>
					<DropdownMenu.SubTrigger><Palette /> Pick a Color</DropdownMenu.SubTrigger>
					<DropdownMenu.SubContent>
						<ColorPicker
							bind:hex={settings3DScene.vectorColor}
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
		</DropdownMenu.Sub>
		<DropdownMenu.Separator></DropdownMenu.Separator>

		<DropdownMenu.Sub bind:open={SceneMenuDownloadOpen}>
			<DropdownMenu.SubTrigger
				{@attach (e) => {
					SceneMenuDownloadTrigger = e;
				}}>Export Image</DropdownMenu.SubTrigger
			>
			<DropdownMenu.SubContent>
				<DropdownMenu.CheckboxItem bind:checked={transparentBackground} closeOnSelect={false}>
					Transparent Background
				</DropdownMenu.CheckboxItem>
				<DropdownMenu.CheckboxItem
					bind:checked={settings3DScene.displayWatermark}
					closeOnSelect={false}
				>
					Watermark
				</DropdownMenu.CheckboxItem>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={() => saveImage(getImage, !transparentBackground)}>
					<ImageDown /> Download
				</DropdownMenu.Item>
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>
	</DropdownMenu.Content>
</DropdownMenu.Root>
