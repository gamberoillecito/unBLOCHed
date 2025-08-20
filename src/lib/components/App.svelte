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
	import { getContext, setContext, untrack } from 'svelte';
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
	import { predefinedGates, predefinedStates, theta_param } from '$lib/data/matrices';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { Canvas, type ThrelteContext } from '@threlte/core';
	import Menu from '@lucide/svelte/icons/menu';
	import { Button, buttonVariants, type ButtonVariant } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { toast } from 'svelte-sonner';
	import ImageDown from '@lucide/svelte/icons/image-down';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	import { Switch } from '$lib/components/ui/switch/index';
	import { Label } from '$lib/components/ui/label/index.js';
	import JoystickControls from './custom-ui/JoystickControls.svelte';
	
	const markedKatexOptions = {
		throwOnError: false
	};
	marked.use(markedKatex(markedKatexOptions));

	const config = {
		absTol: 1e-10
	};
	const math = create(all, config);

	let joystickMode = $state(false);

	let DM = $state(
		new DensityMatrix(
			[
				['1/2', '1/2'],
				['1/2', '1/2']
			],
			'1',
			'\\rho'
		)
	);
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

	let canvasContainer = $state() as HTMLDivElement;
	/**Function to download image from the canvas*/
	let getImage = $state() as () => string;
	let customGateVisible = $state(false);
</script>

<!-- <link
	rel="stylesheet"
	href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
	integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn"
	crossorigin="anonymous"
/> -->

<!-- Generic button with an onclick action and a latex label -->
{#snippet latexButton(
	onclick: (arg: any) => void,
	label: string,
	disabled: boolean,
	variant?: ButtonVariant,
	tooltip: boolean = false
)}
	{@const btnClass = 'aspect-square h-10 min-w-10 rounded-none rounded-s-md'}
	{#if !tooltip}
		<Button
			{variant}
			class={btnClass}
			aria-label="latex button"
			{disabled}
			{onclick}
			{@attach (el: HTMLElement) => {
				el.innerHTML = `<span class="pointer-events-none">${convertLatexToMarkup(label)}</span>`;
			}}
		></Button>
	{:else}
		<Tooltip.Trigger
			class={btnClass + ' ' + buttonVariants({ variant: variant })}
			aria-label="latex button"
			{disabled}
			{onclick}
			{@attach (el: HTMLElement) => {
				el.innerHTML = `<span class="pointer-events-none">${convertLatexToMarkup(label)}</span>`;
			}}
		></Tooltip.Trigger>
	{/if}
{/snippet}

<!-- Button that, when clicked, applies a gate -->

{#snippet applyGateButton(gate: GateMatrix, disabled: boolean)}
	<Tooltip.Provider>
		<Tooltip.Root>
			{@render latexButton(
				() => {
					let initialDM = DM.clone();
					DM.apply_gate(gate);
					history.addElement(initialDM, DM, gate);

					// Make the canvas react to show the user that the gate has been applied
					let newClasses = 'animate-gate-applied';
					canvasContainer.classList.add(newClasses);
					setTimeout(() => {
						canvasContainer.classList.remove(newClasses);
					}, 300);
				},
				gate.label,
				disabled || !gate.isConsistent,
				'default',
				true
			)}
			{#if isZero(gate.rotationAngle) || equal(gate.rotationAngle, multiply(2, pi))}
				<Tooltip.Content class="bg-muted text-muted-foreground border-1"
					>{@html marked.parse('Gate results in a $0$ or $2\\pi$ rotation')}</Tooltip.Content
				>
			{/if}
		</Tooltip.Root>
	</Tooltip.Provider>
{/snippet}

{#snippet gateButtonWithParams(gate: GateMatrix, disabled: boolean, withParams: boolean)}
	{#if withParams}
		<div class="flex gap-0">
			{@render applyGateButton(gate, disabled)}
			<MatrixInfoInput matrix={gate}></MatrixInfoInput>
		</div>
	{:else}
		{@render applyGateButton(gate, disabled)}
	{/if}
{/snippet}

{#snippet updateStateButton(matrix: DensityMatrix, disabled: boolean)}
	<div class="flex gap-0">
		{@render latexButton(
			() => {
				history.addElement(DM, matrix);
				DM.setMatrixFromLatex(matrix.latexMat, matrix.latexMult);
			},
			matrix.label,
			disabled
		)}
		<MatrixInfoInput {matrix}></MatrixInfoInput>
	</div>
{/snippet}


<div
	class="@lg:flex-row @lg:justify-center-safe @lg:place-items-center flex h-full w-full flex-col place-items-center content-evenly justify-start gap-2 p-1"
>
	<!-- Container of undo/redo buttons and canvas -->
	<div
		class="@lg:flex-col shrink-1 @lg:basis-full @lg:self-auto max-h-lg flex max-w-lg flex-row-reverse items-center justify-center self-stretch justify-self-auto"
	>
		<!-- Undo/redo buttons -->
		<div class="@lg:flex-row @lg:m-2 flex flex-col gap-1 {joystickMode ? 'hidden' : ''}">
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
		<div
			bind:this={canvasContainer}
			class=" @lg:h-auto @lg:w-[90%] relative m-2 h-fit shrink rounded-md shadow-sm"
		>
			<div class="h-[85%] aspect-square border-1">
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
					class="absolute right-0 top-[0] z-[9999] p-2 ${buttonVariants.variants.variant
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
					<DropdownMenu.Item
						onclick={() => {
							// requestImage = true;
							// let data = canvasElement.toDataURL('image/png');
							let data = getImage();
							console.log(data);

							const link = document.createElement('a');
							link.download = `bloch-sphere-${new Date().toISOString().replace(/:/g, '-')}.png`;
							link.href = data;

							// Trigger download
							document.body.appendChild(link);
							link.click();
							document.body.removeChild(link);
							toast.success('Download started');
						}}
					>
						<ImageDown /> Save Image</DropdownMenu.Item
					>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<!-- Toggle to switch between normal and joystick mode -->
			<div class="m-auto flex shrink min-h-0 items-center space-x-1 w-fit p-2">
				<Switch id="current-mode" bind:checked={joystickMode} />
				<Label for="current-mode">Joystick mode</Label>
			</div>
		</div>
	</div>
	<!-- Buttons and matrices -->
	{#if !joystickMode}
		<ScrollArea class="@lg:min-h-auto min-h-0 shrink p-2" type="auto">
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
					{@render updateStateButton(matrix, false)}
				{/each}
			</div>
			<Separator class=""></Separator>
			<h4>Gates</h4>
			<!-- Standard gates (no parameters) -->
			<div class="@lg:max-w-[400px] m-3 flex flex-wrap justify-center gap-2">
				{#each predefinedGates.filter((g) => g.parameterArray.length === 0) as gate}
					{@render gateButtonWithParams(gate, !DM.isConsistent, true)}
				{/each}
				<!-- Standard gates (with parameters) -->
				{#each predefinedGates.filter((g) => g.parameterArray.length !== 0) as gate}
					{@render gateButtonWithParams(gate, !DM.isConsistent, true)}
				{/each}
			</div>
			<div class="m-auto flex @lg:hidden shrink min-h-0 items-center space-x-1 w-fit p-2">
				<Switch id="current-mode" bind:checked={customGateVisible} />
				<Label for="current-mode">Custom gate</Label>
			</div>
			<div class="m-3 {customGateVisible ? 'flex' : 'hidden'} @lg:flex  flex-wrap items-center justify-center gap-2">
				<DynamicMatrix FM={GM} instantUpdate={true}></DynamicMatrix>
				{@render gateButtonWithParams(GM, !(DM.isConsistent && GM.isConsistent), true)}
			</div>
		</ScrollArea>
	{:else}
		<JoystickControls DM={fakeDM} bind:joystickMode />
	{/if}
</div>

<!-- <p {@attach (p)=> {p.innerHTML = marked.parse('# Marked in browser\n\nRendered by **marked**. $x/3$') as string}}></p> -->
