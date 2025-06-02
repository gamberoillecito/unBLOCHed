<script lang="ts">
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  import {complex, type Complex, exp, multiply, range} from 'mathjs'
  
  import {DensityMatrix , print_mat} from '$lib/components/Model.svelte'
  import type { ComplexMat2x2 } from '$lib/components/Model.svelte';
  import MathField from "$lib/components/MathField.svelte"
  import type {promptsDict} from "$lib/components/MathField.svelte"
  import {ComputeEngine} from  "@cortex-js/compute-engine"
  import MatrixField from './MatrixField.svelte';
  let DM_latex =  $state('\\placeholder[mult]{1}\\cdot\\begin{bmatrix}\\placeholder[m00]{1} & \\placeholder[m01]{0}\\\\ \\placeholder[m10]{0} & \\placeholder[m11]{1}\\end{bmatrix}');

  let DM = new DensityMatrix();
  let DM_prompts: promptsDict = $state({});

  let ce = new ComputeEngine();
  $inspect(DM.mat);
  $inspect(DM_prompts);
</script>


<div id="main_content">

<div id="canvasContainer">
  <Canvas >
    <Scene {DM}/>
  </Canvas>
</div>

<div>
<div>
Matrix:
<MatrixField bind:matrix={DM.mat}></MatrixField>
<p>Current LaTeX: {DM_latex}</p>
<input type="text" bind:value={DM_latex}>

<p>Prompts:  {DM_prompts}</p>
<p>matrix[0][0]:  {DM_prompts["m00"]}</p>
<p>matrix[0][1]:  {DM_prompts["m01"]}</p>
<button onclick={()=>{
    DM_prompts["m00"] = "x+1";
    }}>Set value [0][0] to "x+1"</button>

<button onclick={()=>{
    DM_prompts["m00"] = "x";
    }}>dmprompts change</button>
</div>
  <!-- <button onclick={()=>{DM.apply_gate(matmul(mi, matrix_gate) as ComplexMat2x2)}}>
    app
  </button> -->
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
      background-color: antiquewhite;
    }
  </style>