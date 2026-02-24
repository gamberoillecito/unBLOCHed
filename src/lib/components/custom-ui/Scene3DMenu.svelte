<script lang="ts">
	import { type sceneSettings } from '$lib/components/Scene.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Menu from '@lucide/svelte/icons/menu';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import ImageDown from '@lucide/svelte/icons/image-down';
	import { toast } from 'svelte-sonner';
	import ColorPickerSubmenu from './ColorPickerSubmenu.svelte';
	import Move3d from '@lucide/svelte/icons/move-3-d';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import Settings2 from '@lucide/svelte/icons/settings-2';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import Button from '../ui/button/button.svelte';
	import Undo from '@lucide/svelte/icons/undo';
	import * as Popover from "$lib/components/ui/popover/index.js";
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

	let advancedSettingsOpen = $state(true);
	async function saveImage(
		getImage: (withBackground?: boolean) => Promise<string>,
		withBackground: boolean = true
	) {
		if (getImage) {
			let imgData = await getImage(withBackground);
			// Create a temporary link element
			const link = document.createElement('a');
			link.href = imgData;
			const now = new Date();
			const yy = String(now.getFullYear()).slice(-2);
			const mm = String(now.getMonth() + 1).padStart(2, '0');
			const dd = String(now.getDate()).padStart(2, '0');
			const hh = String(now.getHours()).padStart(2, '0');
			const mins = String(now.getMinutes()).padStart(2, '0');
			const ss = String(now.getSeconds()).padStart(2, '0');
			link.download = `${yy}-${mm}-${dd}_${hh}-${mins}-${ss}_unBLOCHed_${withBackground ? 'BG' : 'no-BG'}.png`;

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
		<DropdownMenu.CheckboxItem bind:checked={settings3DScene.paperMode} closeOnSelect={false}
			>Paper Mode</DropdownMenu.CheckboxItem
		>
		<DropdownMenu.Separator />
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
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger><Move3d /> Axis</DropdownMenu.SubTrigger>
			<DropdownMenu.SubContent>
				<DropdownMenu.CheckboxItem
					bind:checked={settings3DScene.displayAxisArrows}
					closeOnSelect={false}>Show Arrows</DropdownMenu.CheckboxItem
				>
				<DropdownMenu.CheckboxItem
					bind:checked={settings3DScene.displayAxisLabels}
					closeOnSelect={false}>Show Labels</DropdownMenu.CheckboxItem
				>
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>
		<DropdownMenu.Item
			onclick={() => {
				advancedSettingsOpen = true;
			}}
		>
			<Settings2 />
			Advanced
		</DropdownMenu.Item>

		<DropdownMenu.Separator />
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

{#snippet labelSizeMultiplierSlider()}
	<div class="flex flex-row gap-2 p-3 pb-6 max-w-400 justify-center">
		<Label for="labelSizeMultiplier">Label size multiplier</Label>
		<Slider
			type="single"
			id="labelSizeMultiplier"
			thumbPositioning="contain"
			min={0}
			max={3}
			step={0.1}
			bind:value={settings3DScene.labelSizeMultiplier}
		/>
		<Button
			onclick={() => {
				settings3DScene.labelSizeMultiplier = 1;
			}}
			name="reset"
			aria-label="reset"
			variant="ghost"
			size="icon"><Undo /></Button
		>
	</div>
{/snippet}

<Drawer.Root bind:open={advancedSettingsOpen}>
	<Drawer.Content class="">
	<div class="mx-auto w-full max-w-sm ">

		<Drawer.Header class="text-left">
			<Drawer.Title class="text-xl font-light">Advanced settings</Drawer.Title>
		</Drawer.Header>
		{@render labelSizeMultiplierSlider()}
	</div>	
	</Drawer.Content>
	<!-- <Drawer.Footer>
			{@render githubButton()}
			<div class="justify-start-safe mt-2 flex flex-row-reverse gap-2">
				<Checkbox id="showWelcomeMessage" bind:checked={showWelcomeAtStart} />
				<Label for="showWelcomeMessage">Show this message next time</Label>
			</div>
		</Drawer.Footer> -->
</Drawer.Root>
