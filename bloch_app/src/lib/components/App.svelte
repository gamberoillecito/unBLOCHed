<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';

	import {
		DensityMatrix,
		GateMatrix,
		GatePath,
		MatrixParam,
		print_mat
	} from '$lib/components/Model.svelte';
	import DynamicMatrix from './DynamicMatrix.svelte';
	import { getContext, setContext } from 'svelte';
	import { type Complex, create, all, complex, boolean } from 'mathjs';
	import MatrixInfoInput from './MatrixInfoInput.svelte';
	import { BlochHistory } from './BlochHistory.svelte';
	import { Button, type ButtonVariant } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { convertLatexToMarkup } from 'mathlive';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
	import Undo from '@lucide/svelte/icons/undo';
	import Redo from '@lucide/svelte/icons/redo';
	import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
	import { predefinedGates, predefinedStates, theta_param } from '$lib/data/matrices';
	import ScrollArea from './ui/scroll-area/scroll-area.svelte';

	// MathfieldElement.MathfieldElement.plonkSound = null;
	const config = {
		absTol: 1e-10
	};
	const math = create(all, config);

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
	setContext('densityMatrix', DM);

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
	// $inspect(history.nameList)
	$effect(() => {
		console.log(history.currentIdx);
		console.log(history.nameList);

		// for (let el of history.list) {
		//     print_mat(el.DM.mat)
		// }
	});

	let gateButtonsEnabled = $state();
</script>

<link
	rel="stylesheet"
	href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
	integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn"
	crossorigin="anonymous"
/>

<!-- Generic button with an onclick action and a latex label -->
{#snippet latexButton(
	onclick: (arg: any) => void,
	label: string,
	disabled: boolean,
	variant?: ButtonVariant
)}
	<Button
		{variant}
		class="aspect-square h-10 min-w-10 rounded-none rounded-s-md"
		{disabled}
		{onclick}
		{@attach (el: HTMLElement) => {
			el.innerHTML = `<span class="pointer-events-none">${convertLatexToMarkup(label)}</span>`;
		}}
	></Button>
{/snippet}

<!-- Button that, when clicked, applies a gate -->

{#snippet applyGateButton(gate: GateMatrix, disabled: boolean)}
	{@render latexButton(
		() => {
			let initialDM = DM.clone();
			DM.apply_gate(gate);
			history.addElement(initialDM, DM, gate);
		},
		gate.label,
		disabled || !gate.isConsistent,
		'default'
	)}
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
	class="flex  h-full w-full  flex-col @lg:flex-row content-evenly place-items-center justify-start @lg:justify-center-safe @lg:place-items-center gap-2 p-2 "
>
<!-- Container of undo/redo buttons and canvas -->
	<div class="flex flex-row-reverse justify-center @lg:flex-col shrink-1 @lg:basis-full justify-self-auto self-stretch @lg:self-auto items-center max-h-lg max-w-lg">
		<!-- Undo/redo buttons -->
		<div class="m-2 flex flex-col @lg:flex-row gap-1 ">
			<Button
				onclick={() => {
					history.undo(DM);
				}}
				disabled={history.earliestChange}
				size="icon"
			>
				<Undo />
			</Button>
			<Button
				onclick={() => {
					history.redo(DM);
				}}
				disabled={history.latestChange}
				size="icon"
			>
				<Redo />
			</Button>
		</div>
		<!-- Canvas container -->
		<div
			class="border-1 shrink h-[90%] @lg:h-auto @lg:w-[90%] aspect-square rounded-md  shadow-sm m-3"
		>
			<Canvas>
				<Scene matrixContext={'densityMatrix'} {history} POI={predefinedStates}></Scene>
			</Canvas>
		</div>

	</div>
	<!-- Buttons and matrices -->
	<ScrollArea class="p-2 shrink min-h-0 @lg:min-h-auto">
		<div class="flex flex-col items-center">
			<h4 class="self-start w-fit ">Density Matrix</h4>
			<DynamicMatrix
				matrixContext="densityMatrix"
				instantUpdate={false}
				onChangeCallback={(FM, oldFM, history: BlochHistory) => {
					history.addElement(oldFM as DensityMatrix, FM as DensityMatrix);
				}}
				onChangeArguments={history}
			></DynamicMatrix>
			{#if false}
				<textarea style="height: 300px; width: 400px">
								{`DM = \n[${DM.mat[0][0]}, ${DM.mat[0][1]}] \n[${DM.mat[1][0]}, ${DM.mat[1][1]}]
				
				Phase = ${DM.phase}
				
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
		<div class="m-3 flex flex-wrap justify-center gap-2">
			{#each predefinedGates.filter((g) => g.parameterArray.length === 0) as gate}
				{@render gateButtonWithParams(gate, !DM.isConsistent, true)}
			{/each}
		</div>
		<!-- Standard gates (with parameters) -->
		<div class="m-3 flex flex-wrap justify-center gap-2">
			{#each predefinedGates.filter((g) => g.parameterArray.length !== 0) as gate}
				{@render gateButtonWithParams(gate, !DM.isConsistent, true)}
			{/each}
		</div>
		<div class="m-3 flex flex-wrap items-center justify-center gap-2">
			<DynamicMatrix matrixContext="gateMatrix" instantUpdate={true}></DynamicMatrix>

			{@render gateButtonWithParams(GM, !(DM.isConsistent && GM.isConsistent), true)}
		</div>
	</ScrollArea>
</div>

<!-- <p {@attach (p)=> {p.innerHTML = marked.parse('# Marked in browser\n\nRendered by **marked**. $x/3$') as string}}></p> -->
