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
  } from 'mathjs'
  
  const config = {
      absTol: 1e-10,
  }
  const math = create(all, config);
    
  let DM = $state(new DensityMatrix([['1/2', '1/2'], ['1/2', '1/2']], '1', '\\rho'))
  let DMValid = $state(true); // We can default to true since FancyMatrix does not accept invalid inputs
  setContext('densityMatrix', DM)

  let GM_parameters = [new MatrixParam('theta', '\\pi/2', '\\theta', true)]
  let GM = $state(new GateMatrix([['e^{-i \\theta/2}', '0'], ['0', 'e^{i \\theta/2}']], '1', '\\hat{U}', GM_parameters));
  let GMValid = $state(true); // We can default to true since FancyMatrix does not accept invalid inputs
  setContext('gateMatrix', GM)

  let gatePaths : GatePath[] = $state([]);

  const Xgate = new GateMatrix([['0', '1'], ['1', '0']], '1', '\\hat{X}');
  const Ygate = new GateMatrix([['0', '-i'], ['i', '0']], '1', '\\hat{Y}');
  const Zgate = new GateMatrix([['1', '0'], ['0', '-1']], '1', '\\hat{Z}');
  const Hgate = new GateMatrix([['1', '1'], ['1', '-1']], '\\frac{1}{\\sqrt{2}}', '\\hat{H}');
  
  const ket0 = new DensityMatrix([['1', '0'], ['0', '0']], '1', '|0\\rangle');
  const ket1 = new DensityMatrix([['0', '0'], ['0', '1']], '1', '|1\\rangle');
  const ketPlus = new DensityMatrix([['1', '1'], ['1', '1']], '\\frac{1}{2}', '|+\\rangle');
  const ketMinus = new DensityMatrix([['1', '-1'], ['-1', '1']], '\\frac{1}{2}', '|-\\rangle');
  const ketI = new DensityMatrix([['1', 'i'], ['-i', '1']], '\\frac{1}{2}', '|i\\rangle');
  const ketMinI = new DensityMatrix([['1', '-i'], ['i', '1']], '\\frac{1}{2}', '|-i\\rangle');

  
  const predefinedGates = [Xgate, Ygate, Zgate, Hgate];
  const predefinedStates = [ket0, ket1, ketPlus, ketMinus, ketI, ketMinI];
</script>

{#snippet applyGateButton(gate: GateMatrix, disabled: boolean)}
    <button disabled={disabled} onclick={()=>{
      if (!math.isZero(gate.rotationAngle) && gate.rotationAxis != null){
        gatePaths.push(new GatePath(DM.blochV, gate.rotationAxis, gate.rotationAngle));
      }
      
      DM.apply_gate(gate)
      console.log(gate.rotationAngle);
      console.log(gate.rotationAxis);
      
      
      }}>Apply {gate.label}</button>
{/snippet}

{#snippet updateStateButton(matrix: DensityMatrix, disabled: boolean)}
    <button disabled={disabled} onclick={()=>{
      
      
      DM.setMatrixFromLatex(matrix.latexMat, matrix.latexMult);
      }}>Update state to {matrix.label}</button>
{/snippet}

<div id="main_content">

  <div id="canvasContainer">
    <Canvas>
      <Scene matrixContext={'densityMatrix'} paths={gatePaths} POI={predefinedStates}></Scene>
    </Canvas>
  </div>
  <div>
    <DynamicMatrix
      matrixContext='densityMatrix' 
      bind:validMatrix={DMValid}
      instantUpdate={false}
    ></DynamicMatrix>

    <DynamicMatrix 
      matrixContext='gateMatrix'
      bind:validMatrix={GMValid}
      instantUpdate={true}
    ></DynamicMatrix>

    {@render applyGateButton(GM, !(DMValid && GMValid))}
    <textarea style="height: 300px; width: 400px">
{`DM = \n[${DM.mat[0][0]}, ${DM.mat[0][1]}] \n[${DM.mat[1][0]}, ${DM.mat[1][1]}]

Phase = ${DM.phase}

DM latex = \n ${DM.latexMult} \n[${DM.latexMat[0][0]}, ${DM.latexMat[0][1]}] \n[${DM.latexMat[1][0]}, ${DM.latexMat[1][1]}]

GM = \n[${GM.mat[0][0]}, ${GM.mat[0][1]}] \n[${GM.mat[1][0]}, ${GM.mat[1][1]}]

GM latex = \n ${GM.latexMult} \n[${GM.latexMat[0][0]}, ${GM.latexMat[0][1]}] \n[${GM.latexMat[1][0]}, ${GM.latexMat[1][1]}]
      `}
    </textarea>
  </div>
<div>
  {#each predefinedGates as gate }
    {@render applyGateButton(gate, false)}
  {/each}
</div>
<div>
  {#each predefinedStates as matrix }
    {@render updateStateButton(matrix, false)}
  {/each}
</div>
</div>


  <style> 
    #main_content {
      display: flex;
      flex-direction: column;
      
    }

    #canvasContainer {
      width: 50%;
      height: 40vh;
      background-color: rgb(255, 255, 255);
    }
  </style>