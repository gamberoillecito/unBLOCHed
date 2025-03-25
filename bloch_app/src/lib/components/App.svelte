<script lang="ts">
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  import {complex, type Complex, multiply as matmul} from 'mathjs'
  
  import {onMount} from 'svelte'
  import {DensityMatrix , print_mat} from '$lib/components/Model.svelte'
  import type { ComplexMat2x2 } from '$lib/components/Model.svelte';

  	import MathField from './MathField.svelte'
  let latex = $state('1');
	let latex2 = $state('2');

  let DM = new DensityMatrix();
  let mi = $state(0);
  // let minput = $state();
  // $inspect(minput);
  let matrix_gate: ComplexMat2x2 = $state([
        [complex(1), complex(0)], 
        [complex(0), complex(0)]
    ]);
  $effect(()=>{console.log("inspect DM:"); print_mat(DM.mat)})

  //   let mf:HTMLElement;
  // $inspect(mf.value)
  //  onMount(() => {
  //   if (mf) {
  //     mf.focus()
  //   }
  // })
</script>

<MathField bind:latex={latex}></MathField>

<MathField bind:latex={latex2}></MathField>


<p>Current LaTeX: {latex}</p>

<p>Current LaTeX: {latex2}</p>

<button onclick={()=>{latex = "x1"}}> Set input 1 to "x1"</button>

<button onclick={()=>{latex2 = "x2"}}> Set input 2 to "x2"</button>

<button onclick={()=>{DM.apply_gate(matmul(mi, matrix_gate) as ComplexMat2x2)}}>
  app
</button>


<Canvas>
  <Scene {DM}/>
</Canvas>

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



  <!-- <style>
    #matrix {
      display: flex;
      flex-direction: row;
    }
  </style> -->