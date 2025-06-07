<script lang="ts">
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  import {complex, type Complex, exp, multiply, range} from 'mathjs'
  
  import {DensityMatrix , print_mat} from '$lib/components/Model.svelte'
  import type { ComplexMat2x2 } from '$lib/components/Model.svelte';
  import MathField from "$lib/components/MathField.svelte"
  import type {promptsDict} from "$lib/components/MathField.svelte"
  import {ComputeEngine} from  "@cortex-js/compute-engine"
	import DynamicMatrix from './DynamicMatrix.svelte';
  import {getContext, setContext} from 'svelte'
    
  let DM = $state(new DensityMatrix())
  setContext('densityMatrix', DM)

</script>


<div id="main_content">

  <div id="canvasContainer">
    <Canvas>
      <Scene matrixContext={'densityMatrix'}></Scene>
    </Canvas>
  </div>
  <DynamicMatrix matrixContext='densityMatrix'></DynamicMatrix>
  <button onclick={()=>{
    DM.setValue( complex("1+i"), 0, 0);
    }}>Change DM value</button>
  <textarea>{`[[${DM.mat[0][0]}], [${DM.mat[0][1]}] \n [${DM.mat[1][0]}], [${DM.mat[1][1]}]]`}</textarea>
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