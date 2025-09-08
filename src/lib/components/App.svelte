<script lang="ts">
	import { type sceneSettings } from './Scene.svelte';
	import Scene from './Scene.svelte';

	import {
		DensityMatrix,
		FakeDensityMatrix,
		GateMatrix,
		GatePath,
		MatrixParam,
		print_mat
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
		displayStateLabels: true
	});

	let imageData = $state() as string;
	let requestImage = $state(false);

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
</script>

<!-- <link
	rel="stylesheet"
	href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
	integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn"
	crossorigin="anonymous"
/> -->

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

					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>Export Image</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent>
							<DropdownMenu.CheckboxItem bind:checked={transparentBackground} closeOnSelect={false}>
								Transparent Background
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
			<div class="flex flex-col items-center">
				<h4 class="w-fit self-start">Density Matrix</h4>
				<DynamicMatrix
					FM={DM}
					instantUpdate={false}
					onChangeCallback={(FM, oldFM, history: BlochHistory) => {
						history.addElement(oldFM as DensityMatrix, FM as DensityMatrix);
					}}
					onChangeArguments={history}
				></DynamicMatrix>
				{#if false}
					<textarea style="height: 300px; width: 400px">
						{`DM = \n[${DM.mat[0][0]}, ${DM.mat[0][1]}] \n[${DM.mat[1][0]}, ${DM.mat[1][1]}]
				
				Phase = ${DM.phi}
				
				DM latex = \n ${DM.latexMult} \n[${DM.latexMat[0][0]}, ${DM.latexMat[0][1]}] \n[${DM.latexMat[1][0]}, ${DM.latexMat[1][1]}]
				
				GM = \n[${GM.mat[0][0]}, ${GM.mat[0][1]}] \n[${GM.mat[1][0]}, ${GM.mat[1][1]}]
				
				GM latex = \n ${GM.latexMult} \n[${GM.latexMat[0][0]}, ${GM.latexMat[0][1]}] \n[${GM.latexMat[1][0]}, ${GM.latexMat[1][1]}]
					`}
					</textarea>
				{/if}
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
