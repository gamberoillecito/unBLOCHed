<script lang="ts">
  import { T } from '@threlte/core'
  import { interactivity, OrbitControls } from '@threlte/extras'
  import { Spring } from 'svelte/motion'
  // import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras'
  import BlochSphere from './BlochSphere.svelte';
  import {complex, type Complex} from 'mathjs'
  import SolidVector from './SolidVector.svelte';
	import Path from './Path.svelte';
	import { AxesHelper } from 'three';
  import {generateGradient} from "typescript-color-gradient";
    let {
      matrixContext,
      paths
    } = $props();
      
  const MAX_PATH_COLORS = 20;
  const colors_hex = ['#ff0000', '#ffa700', '#afff00', '#08ff00', '#00ff9f', '#00b7ff', '#0010ff', '#9700ff', '#ff00bf', '#ff0018']

let pathGradient = generateGradient(colors_hex, MAX_PATH_COLORS);
</script>
  <T.DirectionalLight
    intensity={3}
    position.x={5}
    position.y={10}
    castShadow
  />
  <T.AmbientLight intensity={0.5}/>
<T.PerspectiveCamera
  makeDefault
  position={[10, 10, 10]}
  fov={10}
  oncreate={(ref) => {
    ref.lookAt(0, 0, 0)
  }}
>
  <OrbitControls />
</T.PerspectiveCamera>

{#each paths as path, idx }
  <Path path={path} pathColor={pathGradient[idx % MAX_PATH_COLORS]} previousPosition={idx === (paths.length - 1)}></Path>
{/each}

<BlochSphere ></BlochSphere>
<SolidVector {matrixContext}></SolidVector>
<T.AxesHelper></T.AxesHelper>
