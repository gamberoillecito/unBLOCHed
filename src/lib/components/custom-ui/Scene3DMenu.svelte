<script lang="ts">
	import { type sceneSettings } from '$lib/components/Scene.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Menu from '@lucide/svelte/icons/menu';
	import {buttonVariants } from '$lib/components/ui/button/index.js';
	import ImageDown from '@lucide/svelte/icons/image-down';
	import { toast } from 'svelte-sonner';
	import ColorPickerSubmenu from './ColorPickerSubmenu.svelte';

	interface Props {
		settings3DScene: sceneSettings;
		SceneMenuDownloadOpen: boolean;
		SceneMenuDownloadTrigger: HTMLElement;
		transparentBackground: boolean;
		getImage: (withBackground?: boolean) => Promise<string>;
	}

	let {
		settings3DScene = $bindable(),
		SceneMenuDownloadOpen = $bindable(),
		SceneMenuDownloadTrigger = $bindable(),
		transparentBackground = $bindable(),
		getImage = $bindable()
	}: Props = $props();

	async function saveImage(
		getImage: (withBackground?: boolean) => Promise<string>,
		withBackground: boolean = true
	) {
		if (getImage) {
			let imgData = await getImage(withBackground);
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

<!--
@component
A dropdown menu for controlling the visual settings of the 3D scene. It allows
toggling elements, picking colors, and exporting the scene as a PNG image.

**Props:**
- `settings3DScene: sceneSettings` - A bindable object with scene visibility and color settings.
- `SceneMenuDownloadOpen: boolean` - A bindable flag for the "Export Image" submenu's open state.
- `SceneMenuDownloadTrigger: HTMLElement` - A bindable reference to the "Export Image" submenu trigger.
- `transparentBackground: boolean` - A bindable flag for the image export's background transparency.
- `getImage: (withBackground?: boolean) => string` - A bindable function provided by a parent to capture the scene's image data.
-->

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		name="menu"
		aria-label="menu"
		class="absolute top-[0] right-0 z-[9999] p-2 ${buttonVariants.variants.variant.secondary} "
	>
		<Menu />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.CheckboxItem bind:checked={settings3DScene.displayAngles} closeOnSelect={false}
			>Show Angles</DropdownMenu.CheckboxItem
		>
		<DropdownMenu.CheckboxItem bind:checked={settings3DScene.displayPaths} closeOnSelect={false}
			>Show Paths</DropdownMenu.CheckboxItem
		>
		<DropdownMenu.CheckboxItem
			bind:checked={settings3DScene.displayStateLabels}
			closeOnSelect={false}>Show Labels</DropdownMenu.CheckboxItem
		>
		<DropdownMenu.Separator></DropdownMenu.Separator>
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger>Vector Color</DropdownMenu.SubTrigger>
			<ColorPickerSubmenu bind:hexBindColor={settings3DScene.vectorColor} />
		</DropdownMenu.Sub>
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger>Path Color</DropdownMenu.SubTrigger>
			<ColorPickerSubmenu
				bind:hexBindColor={settings3DScene.pathColor}
				title="Applied to next path"
			/>
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
