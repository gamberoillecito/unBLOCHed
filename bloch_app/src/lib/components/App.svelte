
<script lang="ts">
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  
  import {DensityMatrix , GateMatrix, GatePath, MatrixParam, print_mat} from '$lib/components/Model.svelte'
	import DynamicMatrix from './DynamicMatrix.svelte';
  import {getContext, setContext} from 'svelte'
  import {
    type Complex, 
    create,
    all,
    complex,
	boolean,
  } from 'mathjs'
	import MatrixParameterInput from './MatrixParameterInput.svelte';
	import { BlochHistory } from './BlochHistory.svelte';
  const config = {
      absTol: 1e-10,
  }
  
  import {Button, type ButtonVariant} from '$lib/components/ui/button/index.js';
  import { convertLatexToMarkup } from 'mathlive';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from "$lib/components/ui/badge/index.js";
  const math = create(all, config);
    
  let DM = $state(new DensityMatrix([['1/2', '1/2'], ['1/2', '1/2']], '1', '\\rho'))
  setContext('densityMatrix', DM)

  let GM_parameters = [new MatrixParam('theta', '\\pi/30', '\\theta', true)]
  let GM = $state(new GateMatrix([['e^{-i \\theta/2}', '0'], ['0', 'e^{i \\theta/2}']], '1', '\\hat{U}', GM_parameters));
  setContext('gateMatrix', GM)

  let history = new BlochHistory(DM);
  // $inspect(history.nameList)
  $effect(()=> {
    console.log(history.currentIdx);
    console.log(history.nameList);
    
    // for (let el of history.list) {
    //     print_mat(el.DM.mat)
    // }
  })
  const Xgate = new GateMatrix([['0', '1'], ['1', '0']], '1', '$$\\hat{X}$$');
  const Ygate = new GateMatrix([['0', '-i'], ['i', '0']], '1', '\\hat{Y}');
  const Zgate = new GateMatrix([['1', '0'], ['0', '-1']], '1', '\\hat{Z}');
  const Hgate = new GateMatrix([['1', '1'], ['1', '-1']], '\\frac{1}{\\sqrt{2}}', '\\hat{H}');
  const RZgate = new GateMatrix([['e^{-i \\theta/2}', '0'], ['0', 'e^{i \\theta/2}']], '1', 'R_z(\\theta)', GM_parameters);
  const RXgate = new GateMatrix([['\\cos(\\theta/2)', '-i \\sin(\\theta/2)'], ['-i \\sin(\\theta/2)', '\\cos(\\theta/2)']], '1', 'R_x(\\theta)', GM_parameters);
  const RYgate = new GateMatrix([['\\cos(\\theta/2)', '-\\sin(\\theta/2)'], ['\\sin(\\theta/2)', '\\cos(\\theta/2)']], '1', 'R_y(\\theta)', GM_parameters);

  const ket0 = new DensityMatrix([['1', '0'], ['0', '0']], '1', '|0\\rangle');
  const ket1 = new DensityMatrix([['0', '0'], ['0', '1']], '1', '|1\\rangle');
  const ketPlus = new DensityMatrix([['1', '1'], ['1', '1']], '\\frac{1}{2}', '|+\\rangle');
  const ketMinus = new DensityMatrix([['1', '-1'], ['-1', '1']], '\\frac{1}{2}', '|-\\rangle');
  const ketI = new DensityMatrix([['1', 'i'], ['-i', '1']], '\\frac{1}{2}', '|i\\rangle');
  const ketMinI = new DensityMatrix([['1', '-i'], ['i', '1']], '\\frac{1}{2}', '|-i\\rangle');
  // DM.apply_gate(RYgate)
  // DM.apply_gate(RZgate)
  // DM.apply_gate(RZgate)
  const predefinedGates = [Xgate, Ygate, Zgate, Hgate, RXgate, RYgate, RZgate];
  const predefinedStates = [ket0, ket1, ketPlus, ketMinus, ketI, ketMinI];
</script>

<!-- Generic button with an onclick action and a latex label -->
{#snippet latexButton(onclick: (arg: any) => void , label: string, disabled: boolean, variant?: ButtonVariant)}
      <Button
        variant={variant}
        class="size-12 aspect-square"
        disabled = {disabled }
        onclick={onclick}
          {@attach (el: HTMLElement)=> { el.innerHTML =(convertLatexToMarkup(label))}}
      >
    </Button>
{/snippet}

<!-- Button that, when clicked, applies a gate -->

{#snippet applyGateButton(gate: GateMatrix, disabled: boolean)}
  {@render latexButton(
        ()=>{
          let initialDM = DM.clone();
          DM.apply_gate(gate);
          history.addElement(initialDM, DM, gate);
        },
        gate.label,
        disabled || !gate.isConsistent,
      "outline")
      }
{/snippet}

{#snippet gateButtonWithParams(gate: GateMatrix, disabled: boolean, withParams: boolean)}
  {#if withParams && gate.parameterArray.length > 0}

    <div class="border p-3 px-1 rounded-(--radius) bg-(--card) shadow-xs flex flex-col items-center">
    {@render applyGateButton(gate, disabled)}
    <MatrixParameterInput matrix={gate}></MatrixParameterInput> 
    </div>

  {:else}
    {@render applyGateButton(gate, disabled)}
  {/if}
{/snippet}

{#snippet updateStateButton(matrix: DensityMatrix, disabled: boolean)}
    {@render latexButton(
      ()=>{
        history.addElement(DM, matrix);
        DM.setMatrixFromLatex(matrix.latexMat, matrix.latexMult);
      },
      matrix.label,
      disabled
    )}
{/snippet}

<div id="main_content">
  <div>
    <Button 
      onclick={()=>{history.undo(DM);}}
      disabled={history.earliestChange}
    >Undo</Button>
    <Button 
      onclick={()=>{history.redo(DM);}}
      disabled={history.latestChange}
    >Redo</Button>
  </div>

  <div class="aspect-square max-w-md">
    <Canvas>
      <Scene matrixContext={'densityMatrix'} history={history} POI={predefinedStates}></Scene>
    </Canvas>
  </div>
  <div>
    <DynamicMatrix
      matrixContext='densityMatrix' 
      instantUpdate={false}
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
<div class="flex justify-center gap-6 m-3">
  {#each predefinedStates as matrix }
    {@render updateStateButton(matrix, false)}
  {/each}
</div>
<div class="flex justify-center gap-6 m-3">
  {#each predefinedGates.filter(g => (g.parameterArray.length === 0)) as gate}
    {@render gateButtonWithParams(gate, false, true)}
  {/each}
</div>
<div class="flex justify-center gap-6 m-3">
  {#each predefinedGates.filter(g => (g.parameterArray.length !== 0)) as gate}
    {@render gateButtonWithParams(gate, false, true)}
  {/each}
</div>
</div>
<div>
    <DynamicMatrix 
      matrixContext='gateMatrix'
      instantUpdate={true}
    ></DynamicMatrix>

    {@render gateButtonWithParams(GM, !(DM.isConsistent && GM.isConsistent), false)}

</div>