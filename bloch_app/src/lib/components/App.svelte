<script>
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'

  import {DensityMatrix } from '$lib/components/Model.svelte'
  let DM = new DensityMatrix();
  
  $inspect(DM)
  
</script>

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
  
  <style>
    #matrix {
      display: flex;
      flex-direction: row;
    }
  </style>