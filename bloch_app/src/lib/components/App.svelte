<script lang="ts">
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  import {complex, type Complex, multiply as matmul} from 'mathjs'
  
  import {onMount} from 'svelte'
  import {DensityMatrix , print_mat} from '$lib/components/Model.svelte'
  import type { ComplexMat2x2 } from '$lib/components/Model.svelte';

  import MathField from "$lib/MathLive.svelte";

  let latex = $state('1');
	let latex2 = $state('2');

  let DM = new DensityMatrix();
  let mi = $state(0);
  let matrix_gate: ComplexMat2x2 = $state([
        [complex(1), complex(0)], 
        [complex(0), complex(0)]
    ]);
  $effect(()=>{console.log("inspect DM:"); print_mat(DM.mat)})

</script>
<div id="main_content">


<MathField bind:value={latex}></MathField>

<MathField bind:value={latex2}></MathField>


<p>Current LaTeX: {latex}</p>

<p>Current LaTeX: {latex2}</p>

<button onclick={()=>{latex = "x1"}}> Set input 1 to "x1"</button>

<button onclick={()=>{latex2 = "x2"}}> Set input 2 to "x2"</button>

<button onclick={()=>{DM.apply_gate(matmul(mi, matrix_gate) as ComplexMat2x2)}}>
  app
</button>

<div id="canvas_wrapper">
<Canvas >
  <Scene {DM}/>
</Canvas>
</div>

  <div id="matrix" style="padding-top: 9em; ">
    <div class="row">
      <input type="text" bind:value={DM.a}>
      <input type="text" bind:value={DM.b}>
    </div>
    <div class="row">
      <input type="text" bind:value={DM.c}>
      <input type="text" bind:value={DM.d}>
    </div>
  </div>

  <div id="matrix2" style="padding-top: 9em; ">
      <input type="text" bind:value={mi}>
    <div class="row">
      <input type="text" bind:value={matrix_gate[0][0]}>
      <input type="text" bind:value={matrix_gate[0][1]}>
    </div>
    <div class="row">
      <input type="text" bind:value={matrix_gate[1][0]}>
      <input type="text" bind:value={matrix_gate[1][1]}>
    </div>
  </div>

</div>


  <style> 
    #main_content {
      display: flex;
      flex-direction: row;
      
    }

    #canvas_wrapper {
      width: 50%;
      height: 80%;
      background-color: antiquewhite;
    }
  </style>