<script lang="ts">
	import { type sceneSettings } from './Scene.svelte';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Scene from './Scene.svelte';
	import { StateVector } from '$lib/model/StateVector.svelte';
	import { GateMatrix } from '$lib/model/GateMatrix.svelte';
	import { FakeDensityMatrix } from '$lib/model/DensityMatrix.svelte';
	import { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
	import DynamicMatrix from './DynamicMatrix.svelte';
	import { setContext } from 'svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { BlochHistory } from '$lib/model/BlochHistory.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Undo from '@lucide/svelte/icons/undo';
	import Redo from '@lucide/svelte/icons/redo';
	import { predefinedGates, predefinedStates, theta_param, ketPlus } from '$lib/data/matrices';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { Canvas } from '@threlte/core';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Switch } from '$lib/components/ui/switch/index';
	import { Label } from '$lib/components/ui/label/index.js';
	import JoystickControls from './custom-ui/JoystickControls.svelte';
	import GateButtonWithParams from './custom-ui/Buttons/GateButtonWithParams.svelte';
	import UpdateStateButton from './custom-ui/Buttons/UpdateStateButton.svelte';
	import { type TutorialPageProps } from '$lib/components/tutorial/tutorialUtils';
	import { copy } from 'svelte-copy';
	import CopyCheck from '@lucide/svelte/icons/square-check-big';
	import Copy from '@lucide/svelte/icons/copy';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Scene3DMenu from './custom-ui/Scene3DMenu.svelte';
	import { noiseChannels } from '$lib/data/quantumOperations';
	import QOInfoInput from './custom-ui/QOInfoInput.svelte';
	import { flashCanvas } from './custom-ui/Buttons/buttonUtility';
	interface Props {
		tutorialProps: TutorialPageProps;
	}
	let { tutorialProps = $bindable() }: Props = $props();

	let joystickMode = $state(false); //** Whether to use the default view (display DM) or joystick mode (display fakeDM)*/

	let DM = $state(ketPlus.clone());
	DM.extendedLabel = '\\rho';

	let fakeDM = $state(new FakeDensityMatrix());
	//** This variable is shared with all the children of App.svelte and is used to prevent
	// multiple error popovers opening at the same time for different inputs*/
	let popoversContext = $state({
		preventOpening: false
	});

	setContext('popoversContext', popoversContext);

	//**The GateMatrix of the "fully customizable gate"*/
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
		displayWatermark: true,
		vectorColor: null,
		pathColor: null,
		paper_mode: true,
	});

	//**Whether the exported image should have a transparent bg or not*/
	let transparentBackground = $state(false);

	let canvasContainer = $state() as HTMLDivElement;
	/**Function to download image from the canvas*/
	let getImage = $state() as (withBackground?: boolean) => Promise<string>;

	//**The fully customizable gate is hidden under a toggle on smaller screens*/
	let customGateVisible = $state(false);

	$effect(() => {
		tutorialProps.DM = DM;
		tutorialProps.canvasContainer = canvasContainer;
		tutorialProps.history = history;
	});

	//**StateVector binded to the global densityMatrix DM*/
	let SV = DM.SV;
	SV.extendedLabel = '|\\psi\\rangle';

	// Show a popover when the user disables the watermark to ask for a citation
	let watermarkDialogOpen = $state(false);
	$effect(() => {
		if (settings3DScene.displayWatermark) {
			return;
		}

		watermarkDialogOpen = true;
	});

	//**The element of the scene menu that opens the "Download Image" submenu, needs extra logic to remain open even after the watermark message*/
	let SceneMenuDownloadTrigger = $state() as HTMLElement;
	let SceneMenuDownloadOpen = $state(false);

	let noiseAccordionOpenElement = $state('');
</script>

{#snippet StateVectorInput()}
	<div class="relative m-1 h-fit w-fit">
		<div class={DM.getStateVector() == null ? 'opacity-0' : ''}>
			<DynamicMatrix
				FM={SV}
				instantUpdate={false}
				onChangeCallback={(SV, oldSV, args: { history: BlochHistory; DM: DensityMatrix }) => {
					let newMatrix = (SV as StateVector).getDM();
					args.DM.setMatrixValue(newMatrix);
					// args.history.addElement(oldDM, args.DM);
				}}
				onChangeArguments={{ history, DM }}
			/>
		</div>
		<div
			class={`${DM.getStateVector() != null ? 'opacity-0' : ''} bg-muted pointer-events-none absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center rounded-md border p-1 text-center backdrop-blur-sm`}
		>
			<p class="text-muted-foreground text-xs">
				Mixed states cannot be represented by a state vector.
			</p>
		</div>
	</div>
{/snippet}

{#snippet DynamicMatrixInput()}
	<DynamicMatrix
		FM={DM}
		instantUpdate={false}
		onChangeCallback={(FM, oldFM, history: BlochHistory) => {
			history.addElement(oldFM as DensityMatrix, FM as DensityMatrix);
			// console.log((FM as DensityMatrix).stateVector);
		}}
		onChangeArguments={history}
	></DynamicMatrix>
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
					flashCanvas(canvasContainer);
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
					flashCanvas(canvasContainer);
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

			<Scene3DMenu
				{SceneMenuDownloadOpen}
				bind:settings3DScene
				{getImage}
				{SceneMenuDownloadTrigger}
				{transparentBackground}
			/>

			<!-- Toggle to switch between normal and joystick mode -->
			<div class="m-auto flex min-h-0 w-fit shrink items-center space-x-1 p-2">
				<Switch id="current-mode" bind:checked={joystickMode} />
				<Label for="current-mode">Joystick mode</Label>
			</div>
		</div>
	</div>
	<!-- Buttons and matrices -->
	{#if !joystickMode}
		<ScrollArea class="max-h-full overflow-y-auto p-2" type="scroll">
			<!-- We need both the svelte media query with the if and the tailwind @2xl: because svelte hides the error popover
			 of the not-visible input and tailwind is more responsive when the website loads -->
			{#if true}
				<!-- <Tabs.Root value="dm" class="max-w-[400px] items-center @2xl:hidden"> -->
				<Tabs.Root value="dm" class="max-w-[400px] items-center ">
					<Tabs.List>
						<Tabs.Trigger value="dm">Density Matrix</Tabs.Trigger>
						<Tabs.Trigger value="dv">State Vector</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="dm">{@render DynamicMatrixInput()}</Tabs.Content>
					<Tabs.Content value="dv">{@render StateVectorInput()}</Tabs.Content>
				</Tabs.Root>
			{:else}
				<div class="hidden flex-row justify-center gap-2 @2xl:flex">
					<div class="flex flex-col items-center">
						<h4 class="w-fit self-start">Density Matrix</h4>
						{@render DynamicMatrixInput()}
					</div>
					<Separator orientation="vertical" class="h-full" />
					<div class="flex flex-col items-center">
						<h4 class="w-fit self-start">State Vector</h4>
						{@render StateVectorInput()}
					</div>
				</div>
			{/if}
			<Separator class=""></Separator>
			<h4>States</h4>
			<!-- Standard states -->
			<div class="m-3 flex flex-wrap justify-center gap-2">
				{#each predefinedStates as matrix}
					<UpdateStateButton {matrix} {DM} disabled={false} {canvasContainer} {history} />
				{/each}
			</div>
			<Separator />
			<Tabs.Root value="noise" class="w-full items-center pt-2">
				<Tabs.List class="self-center">
					<Tabs.Trigger value="gates">Gates</Tabs.Trigger>
					<Tabs.Trigger value="noise">Noise</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="gates">
					<!-- Standard gates (no parameters) -->
					<div class="m-3 mx-auto flex flex-wrap justify-center gap-2 @lg:max-w-[400px]">
						{#each predefinedGates.filter((g) => g.parameterArray.length === 0) as gate}
							<GateButtonWithParams
								{DM}
								{history}
								{canvasContainer}
								{gate}
								disabled={!(DM.isConsistent && SV.isConsistent)}
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
								disabled={!(DM.isConsistent && SV.isConsistent)}
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
							disabled={!(DM.isConsistent && GM.isConsistent && SV.isConsistent)}
							withParams={true}
						/>
					</div>
				</Tabs.Content>
				<Tabs.Content value="noise" class="w-[400px]">
					<Accordion.Root type="single" bind:value={noiseAccordionOpenElement}>
						{#each noiseChannels as QO}
							<QOInfoInput
								{DM}
								{QO}
								{history}
								{canvasContainer}
								bind:openItem={noiseAccordionOpenElement}
							/>
						{/each}
					</Accordion.Root>
				</Tabs.Content>
			</Tabs.Root>
		</ScrollArea>
	{:else}
		<JoystickControls DM={fakeDM} bind:joystickMode />
	{/if}
</div>

{#snippet copyText(text: string)}
	<button use:copy={text}>
		<article
			class="group items-top bg-muted text-muted-foreground transi relative inline-flex gap-2 rounded-[0.4rem] px-2 font-mono break-all shadow transition-all hover:brightness-110 active:scale-[99.5%]"
		>
			<Copy class="mt-1 flex size-3 transition-discrete group-active:hidden" />
			<CopyCheck class="mt-1 hidden size-3 transition-discrete group-active:flex " />
			{text}
		</article>
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
						{@render copyText('https://unBLOCHed.xyz')}
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

<!-- <div
	use:draggable={{ axis: 'both' }}
	class="bg-card absolute top-0 left-0 z-9999 w-fit cursor-move rounded-xs border-1 p-3"
>
	<p>Debug:</p>
	<Accordion.Root type="single">
		{#each noiseChannels as QO}
			<QOInfoInput {DM} {QO} {history} {canvasContainer} />
		{/each}
	</Accordion.Root>
</div> -->
