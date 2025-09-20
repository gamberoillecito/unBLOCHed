<script lang="ts">
	import { type sceneSettings } from './Scene.svelte';
	import Scene from './Scene.svelte';

	import {
		DensityMatrix,
		FakeDensityMatrix,
		FancyMatrix,
		GateMatrix,
		GatePath,
		MatrixParam,
		print_mat,
		StateVector
	} from '$lib/components/Model.svelte';
	import DynamicMatrix from './DynamicMatrix.svelte';
	import { getContext, onMount, setContext, untrack } from 'svelte';
	import {
		type Complex,
		create,
		all,
		complex,
		boolean,
		mod as modulus,
		compare,
		pi,
		isZero,
		multiply,
		equal
	} from 'mathjs';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import MatrixInfoInput from './MatrixInfoInput.svelte';
	import { BlochHistory } from './BlochHistory.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { convertLatexToMarkup } from 'mathlive';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Undo from '@lucide/svelte/icons/undo';
	import Redo from '@lucide/svelte/icons/redo';
	import { predefinedGates, predefinedStates, theta_param, ketPlus } from '$lib/data/matrices';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { Canvas, type ThrelteContext } from '@threlte/core';
	import Menu from '@lucide/svelte/icons/menu';
	import { Button, buttonVariants, type ButtonVariant } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { toast } from 'svelte-sonner';
	import ImageDown from '@lucide/svelte/icons/image-down';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Switch } from '$lib/components/ui/switch/index';
	import { Label } from '$lib/components/ui/label/index.js';
	import JoystickControls from './custom-ui/JoystickControls.svelte';
	import LatexButton from './custom-ui/Buttons/LatexButton.svelte';
	import ApplyGateButton from './custom-ui/Buttons/ApplyGateButton.svelte';
	import GateButtonWithParams from './custom-ui/Buttons/GateButtonWithParams.svelte';
	import UpdateStateButton from './custom-ui/Buttons/UpdateStateButton.svelte';
	import { type TutorialPageProps } from '$lib/components/tutorial/tutorialUtils';
	import DialogDrawer from './custom-ui/DialogDrawer.svelte';
	import { copy } from 'svelte-copy';
	import Copy from '@lucide/svelte/icons/copy';
	import { marked } from 'marked';
	import DynamicStateVector from './DynamicStateVector.svelte';
	const config = {
		absTol: 1e-10
	};
	const math = create(all, config);

	interface Props {
		tutorialProps: TutorialPageProps;
	}
	let { tutorialProps = $bindable() }: Props = $props();

	let joystickMode = $state(false);

	let DM = $state(ketPlus.clone());
	DM.label = '\\rho';
	let fakeDM = $state(new FakeDensityMatrix());
	let popoversContext = $state({
		preventOpening: false
	});
	setContext('popoversContext', popoversContext);

	let GM = $state(
		new GateMatrix(
			[
				['e^{-i \\theta/2}', '0'],
				['0', 'e^{i \\theta/2}']
			],
			'1',
			'\\hat{U}',
			theta_param
		)
	);
	setContext('gateMatrix', GM);

	let history = new BlochHistory(DM);

	let settings3DScene: sceneSettings = $state({
		displayAngles: true,
		displayPaths: true,
		displayStateLabels: true,
		displayWatermark: true
	});

	let transparentBackground = $state(false);

	let canvasContainer = $state() as HTMLDivElement;
	/**Function to download image from the canvas*/
	let getImage = $state() as (withBackground?: boolean) => string;
	let customGateVisible = $state(false);

	function saveImage(
		getImage: (withBackground?: boolean) => string,
		withBackground: boolean = true
	) {
		if (getImage) {
			let imgData = getImage(withBackground);
			// Create a temporary link element
			const link = document.createElement('a');
			link.href = imgData;
			const bgSuffix = withBackground ? '-bg' : 'nobg';
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

	$effect(() => {
		tutorialProps.DM = DM;
		tutorialProps.canvasContainer = canvasContainer;
		tutorialProps.history = history;
	});

	let SV = DM.SV;

	// Show a popover when the user disables the watermark to ask for a citation
	let watermarkDialogOpen = $state(false);
	$effect(() => {
		if (settings3DScene.displayWatermark) {
			return;
		}

		watermarkDialogOpen = true;
	});

	//**The element of the scene menu that opens the "Download Image" submenu*/
	let SceneMenuDownloadTrigger = $state() as HTMLElement;
	let SceneMenuDownloadOpen = $state(false);
</script>

{#snippet StateVectorInput()}
	<div class="relative">
		<DynamicMatrix
			FM={SV}
			instantUpdate={false}
			onChangeCallback={(SV, oldSV, args: { history: BlochHistory; DM: DensityMatrix }) => {
				let newMatrix = (SV as StateVector).getDM();
				let oldDM = args.DM.clone();
				args.DM.setMatrixValue(newMatrix);
				args.history.addElement(oldDM, args.DM);
			}}
			onChangeArguments={{ history, DM }}
		/>
		{#if DM.getStateVector() === null}
			<div
				class="bg-background/80 absolute inset-0 z-10 flex items-center justify-center rounded-md border p-4 text-center backdrop-blur-sm"
				title="The current density matrix represents a mixed state, which cannot be described by a single state vector."
			>
				<p class="text-muted-foreground text-xs">
					Mixed states cannot be represented by a state vector.
				</p>
			</div>
		{/if}
	</div>
{/snippet}

<div
	class="flex h-full w-full flex-col place-items-center content-evenly justify-start gap-2 p-1 @lg:flex-row @lg:place-items-center @lg:justify-center-safe"
>
	<!-- Container of undo/redo buttons and canvas -->
	<div
		class="max-h-lg flex max-w-lg shrink-1 flex-row-reverse items-center justify-center self-stretch justify-self-auto @lg:basis-full @lg:flex-col @lg:self-auto"
	>
		<!-- Undo/redo buttons -->
		<div class="flex flex-col gap-1 @lg:m-2 @lg:flex-row {joystickMode ? 'hidden' : ''}">
			<Button
				onclick={() => {
					history.undo(DM);
				}}
				disabled={history.earliestChange}
				size="icon"
				name="undo"
				aria-label="undo"
			>
				<Undo />
			</Button>
			<Button
				onclick={() => {
					history.redo(DM);
				}}
				disabled={history.latestChange}
				size="icon"
				name="redo"
				aria-label="redo"
			>
				<Redo />
			</Button>
		</div>
		<!-- Canvas container -->
		<div class=" relative m-2 h-fit shrink shadow-sm @lg:h-auto @lg:w-[90%]">
			<div class="aspect-square h-[85%] rounded-md border-1" bind:this={canvasContainer}>
				<Canvas>
					<Scene
						bind:getImage
						DM={joystickMode ? fakeDM : DM}
						{history}
						POI={predefinedStates}
						settings={settings3DScene}
						bind:joystickMode
					></Scene>
				</Canvas>
			</div>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					name="menu"
					aria-label="menu"
					class="absolute top-[0] right-0 z-[9999] p-2 ${buttonVariants.variants.variant
						.secondary} "
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
			<!-- Toggle to switch between normal and joystick mode -->
			<div class="m-auto flex min-h-0 w-fit shrink items-center space-x-1 p-2">
				<Switch id="current-mode" bind:checked={joystickMode} />
				<Label for="current-mode">Joystick mode</Label>
			</div>
		</div>
	</div>
	<!-- Buttons and matrices -->
	{#if !joystickMode}
		<ScrollArea class="min-h-0 shrink p-2 @lg:min-h-auto" type="scroll">
			<div class="flex flex-row gap-2">
				<div class="flex flex-col items-center">
					<h4 class="w-fit self-start">Density Matrix</h4>
					<DynamicMatrix
						FM={DM}
						instantUpdate={false}
						onChangeCallback={(FM, oldFM, history: BlochHistory) => {
							history.addElement(oldFM as DensityMatrix, FM as DensityMatrix);
							// console.log((FM as DensityMatrix).stateVector);
						}}
						onChangeArguments={history}
					></DynamicMatrix>
				</div>
				<Separator orientation="vertical" class="h-full"/> 
				<div class="flex flex-col items-center">
					<h4 class="w-fit self-start">State Vector</h4>
					{@render StateVectorInput()}
				</div>
			</div>
			<Separator class=""></Separator>
			<h4>States</h4>
			<!-- Standard states -->
			<div class="m-3 flex flex-wrap justify-center gap-2">
				{#each predefinedStates as matrix}
					<UpdateStateButton {matrix} {DM} disabled={false} {canvasContainer} {history} />
				{/each}
			</div>
			<Separator class=""></Separator>
			<h4>Gates</h4>
			<!-- Standard gates (no parameters) -->
			<div class="m-3 flex flex-wrap justify-center gap-2 @lg:max-w-[400px]">
				{#each predefinedGates.filter((g) => g.parameterArray.length === 0) as gate}
					<GateButtonWithParams
						{DM}
						{history}
						{canvasContainer}
						{gate}
						disabled={!DM.isConsistent}
						withParams={true}
					/>
				{/each}
				<!-- Standard gates (with parameters) -->
				{#each predefinedGates.filter((g) => g.parameterArray.length !== 0) as gate}
					<GateButtonWithParams
						{DM}
						{history}
						{canvasContainer}
						{gate}
						disabled={!DM.isConsistent}
						withParams={true}
					/>
				{/each}
			</div>
			<div class="m-auto flex min-h-0 w-fit shrink items-center space-x-1 p-2 @lg:hidden">
				<Switch id="current-mode" bind:checked={customGateVisible} />
				<Label for="current-mode">Custom gate</Label>
			</div>
			<div
				class="m-3 {customGateVisible
					? 'flex'
					: 'hidden'} flex-wrap items-center justify-center gap-2 @lg:flex"
			>
				<DynamicMatrix FM={GM} instantUpdate={true}></DynamicMatrix>
				<GateButtonWithParams
					{DM}
					{history}
					{canvasContainer}
					gate={GM}
					disabled={!(DM.isConsistent && GM.isConsistent)}
					withParams={true}
				/>
			</div>
		</ScrollArea>
	{:else}
		<JoystickControls DM={fakeDM} bind:joystickMode />
	{/if}
</div>

{#snippet copyText(text: string)}
	<button use:copy={text}>
		<p
			class="items-top bg-muted text-muted-foreground inline-flex gap-2 rounded-[0.4rem] px-2 font-mono break-all shadow hover:brightness-110"
		>
			{text}
			<Copy class="mt-1 size-3" />
		</p>
	</button>
{/snippet}

<AlertDialog.Root bind:open={watermarkDialogOpen}>
	<AlertDialog.Content
		class="z-99999"
		onCloseAutoFocus={(e) => {
			e.preventDefault();
			SceneMenuDownloadTrigger?.focus();
		}}
	>
		<AlertDialog.Header>
			<AlertDialog.Title>The watermark helps others find this website</AlertDialog.Title>
			<AlertDialog.Description class="prose-sm dark:prose-invert">
				If you want to remove it, please include a reference to it in one of the following ways:
				<ul>
					<li>
						Link to the website: <br />
						{@render copyText('https://gamberoillecito.github.io/unBLOCHed/')}
					</li>
					<li>
						Link to the GitHub repository:<br />
						{@render copyText('https://github.com/gamberoillecito/unBLOCHed/')}
					</li>
					<li>DOI: <br /> {@render copyText('https://doi.org/10.5281/zenodo.17087795')}</li>
				</ul>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel
				onclick={() => {
					settings3DScene.displayWatermark = false;
					SceneMenuDownloadOpen = true;
				}}>Remove</AlertDialog.Cancel
			>
			<AlertDialog.Action
				onclick={() => {
					settings3DScene.displayWatermark = true;
					SceneMenuDownloadOpen = true;
					watermarkDialogOpen = false;
				}}>Keep</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
