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
  import { Separator } from "$lib/components/ui/separator/index.js";
	import { convertLatexToMarkup } from 'mathlive';
  import * as Resizable from "$lib/components/ui/resizable/index.js";
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
  import Undo from '@lucide/svelte/icons/undo';
  import Redo from '@lucide/svelte/icons/redo';
  
  

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

	let GM_parameters = [new MatrixParam('theta', '\\pi/30', '\\theta', true)];
	let GM = $state(
		new GateMatrix(
			[
				['e^{-i \\theta/2}', '0'],
				['0', 'e^{i \\theta/2}']
			],
			'1',
			'\\hat{U}',
			GM_parameters
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
	const Xgate = new GateMatrix(
		[
			['0', '1'],
			['1', '0']
		],
		'1',
		'$$\\hat{X}$$'
	);
	const Ygate = new GateMatrix(
		[
			['0', '-i'],
			['i', '0']
		],
		'1',
		'\\hat{Y}'
	);
	const Zgate = new GateMatrix(
		[
			['1', '0'],
			['0', '-1']
		],
		'1',
		'\\hat{Z}'
	);
	const Hgate = new GateMatrix(
		[
			['1', '1'],
			['1', '-1']
		],
		'\\frac{1}{\\sqrt{2}}',
		'\\hat{H}'
	);
	const RZgate = new GateMatrix(
		[
			['e^{-i \\theta/2}', '0'],
			['0', 'e^{i \\theta/2}']
		],
		'1',
		'R_z(\\theta)',
		GM_parameters.map((x) => x.clone())
	);
	const RXgate = new GateMatrix(
		[
			['\\cos(\\theta/2)', '-i \\sin(\\theta/2)'],
			['-i \\sin(\\theta/2)', '\\cos(\\theta/2)']
		],
		'1',
		'R_x(\\theta)',
		GM_parameters.map((x) => x.clone())
	);
	const RYgate = new GateMatrix(
		[
			['\\cos(\\theta/2)', '-\\sin(\\theta/2)'],
			['\\sin(\\theta/2)', '\\cos(\\theta/2)']
		],
		'1',
		'R_y(\\theta)',
		GM_parameters.map((x) => x.clone())
	);

	const ket0 = new DensityMatrix(
		[
			['1', '0'],
			['0', '0']
		],
		'1',
		'|0\\rangle'
	);
	const ket1 = new DensityMatrix(
		[
			['0', '0'],
			['0', '1']
		],
		'1',
		'|1\\rangle'
	);
	const ketPlus = new DensityMatrix(
		[
			['1', '1'],
			['1', '1']
		],
		'\\frac{1}{2}',
		'|+\\rangle'
	);
	const ketMinus = new DensityMatrix(
		[
			['1', '-1'],
			['-1', '1']
		],
		'\\frac{1}{2}',
		'|-\\rangle'
	);
	const ketI = new DensityMatrix(
		[
			['1', 'i'],
			['-i', '1']
		],
		'\\frac{1}{2}',
		'|i\\rangle'
	);
	const ketMinI = new DensityMatrix(
		[
			['1', '-i'],
			['i', '1']
		],
		'\\frac{1}{2}',
		'|-i\\rangle'
	);
	// DM.apply_gate(RYgate)
	// DM.apply_gate(RZgate)
	// DM.apply_gate(RZgate)
	const predefinedGates = [Xgate, Ygate, Zgate, Hgate, RXgate, RYgate, RZgate];
	const predefinedStates = [ket0, ket1, ketPlus, ketMinus, ketI, ketMinI];
	let gateButtonsEnabled = $state();
</script>

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

<div class="flex flex-col items-center gap-2">
	<div class="flex m-2 gap-1">
		<Button
			onclick={() => {
				history.undo(DM);
			}}
			disabled={history.earliestChange}
      size="icon"
    >
      <Undo />
    </Button
		>
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

	<div class="aspect-square grow border-1 rounded-md shadow-sm">
		<Canvas>
			<Scene matrixContext={'densityMatrix'} {history} POI={predefinedStates}></Scene>
		</Canvas>
	</div>
  <Separator class=""></Separator>
	<div>
		<DynamicMatrix matrixContext="densityMatrix" instantUpdate={false} onChangeCallback ={(FM, oldFM, history:BlochHistory)=> {history.addElement(oldFM as DensityMatrix, FM as DensityMatrix)}} onChangeArguments={history}></DynamicMatrix>
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
  <!-- Standard states -->
	<div class="m-3 flex flex-wrap justify-center gap-2">
		{#each predefinedStates as matrix}
			{@render updateStateButton(matrix, false)}
		{/each}
	</div>
  <Separator class=""></Separator>
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
</div>
<div class="m-3 flex flex-wrap justify-center gap-2 items-center">
	<DynamicMatrix matrixContext="gateMatrix" instantUpdate={true}></DynamicMatrix>

	{@render gateButtonWithParams(GM, !(DM.isConsistent && GM.isConsistent), true)}
</div>
