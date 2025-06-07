<script lang="ts">
  import { T } from '@threlte/core'
  import { interactivity, OrbitControls } from '@threlte/extras'
  import { Spring } from 'svelte/motion'
  // import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras'
  import BlochSphere from './BlochSphere.svelte';
  import {complex, type Complex} from 'mathjs'
  import SolidVector from './SolidVector.svelte';
    let {matrixContext} = $props();
      
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
  fov={15}
  oncreate={(ref) => {
    ref.lookAt(0, 0, 0)
  }}
>
  <OrbitControls />
</T.PerspectiveCamera>

<BlochSphere ></BlochSphere>
<SolidVector {matrixContext}></SolidVector>
