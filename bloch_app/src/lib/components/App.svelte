<script lang="ts">
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  import {complex, type Complex, multiply as matmul} from 'mathjs'

  import {DensityMatrix , print_mat} from '$lib/components/Model.svelte'
  import type { ComplexMat2x2 } from '$lib/components/Model.svelte';
  let DM = new DensityMatrix();
  let mi = $state(0);
  let matrix_gate: ComplexMat2x2 = $state([
        [complex(1), complex(0)], 
        [complex(0), complex(0)]
    ]);
  $effect(()=>{console.log("inspect DM:"); print_mat(DM.mat)})
</script>

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