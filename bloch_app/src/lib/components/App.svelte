<script lang="ts">
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  import {complex, type Complex, exp, multiply, range} from 'mathjs'
  
  import {DensityMatrix , GateMatrix, print_mat} from '$lib/components/Model.svelte'
  import type { ComplexMat2x2 } from '$lib/components/Model.svelte';
  import MathField from "$lib/components/MathField.svelte"
  import type {promptsDict} from "$lib/components/MathField.svelte"
  import {ComputeEngine} from  "@cortex-js/compute-engine"
	import DynamicMatrix from './DynamicMatrix.svelte';
  import {getContext, setContext} from 'svelte'
    
  let DM = $state(new DensityMatrix([['1', '0'], ['0', '0']], '1'))
  let DMValid = $state(true); // We can default to true since FancyMatrix does not accept invalid inputs
  setContext('densityMatrix', DM)

  // let GM = $state(new GateMatrix([['1', '0'], ['0', '1']], '1'))
  let GM = $state(new GateMatrix([['1', '1'], ['1', '-1']], '\\frac{1}{\\sqrt{2}}'))
  let GMValid = $state(true); // We can default to true since FancyMatrix does not accept invalid inputs
  setContext('gateMatrix', GM)

  $effect(()=>{
    console.log(`DMvalid: ${DMValid}`);
    console.log(`GMvalid: ${GMValid}`);
    
  })
</script>


<div id="main_content">

  <div id="canvasContainer">
    <Canvas>
      <Scene matrixContext={'densityMatrix'}></Scene>
    </Canvas>
  </div>
  <div>
    <DynamicMatrix
      matrixContext='densityMatrix' 
      bind:validMatrix={DMValid}
      label='\rho'
    ></DynamicMatrix>
    <DynamicMatrix 
      matrixContext='gateMatrix'
      bind:validMatrix={GMValid}
      label='U'
    ></DynamicMatrix>
    <button disabled={!(DMValid && GMValid)} onclick={()=>{
      DM.apply_gate(GM)
      console.log('applu');
      
      }}>Apply</button>
    <textarea style="height: 300px; width: 400px">
{`DM = \n[${DM.mat[0][0]}, ${DM.mat[0][1]}] \n[${DM.mat[1][0]}, ${DM.mat[1][1]}]

DM latex = \n ${DM.latexMult} \n[${DM.latexMat[0][0]}, ${DM.latexMat[0][1]}] \n[${DM.latexMat[1][0]}, ${DM.latexMat[1][1]}]

GM = \n[${GM.mat[0][0]}, ${GM.mat[0][1]}] \n[${GM.mat[1][0]}, ${GM.mat[1][1]}]

GM latex = \n ${GM.latexMult} \n[${GM.latexMat[0][0]}, ${GM.latexMat[0][1]}] \n[${GM.latexMat[1][0]}, ${GM.latexMat[1][1]}]
      `}
    </textarea>
  </div>
</div>



  <style> 
    #main_content {
      display: flex;
      flex-direction: row;
      
    }

    #canvasContainer {
      width: 50%;
      height: 80%;
      background-color: rgb(170, 188, 247);
    }
  </style>