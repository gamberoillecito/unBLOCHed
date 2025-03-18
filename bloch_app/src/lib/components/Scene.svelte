<script>
  import { T } from '@threlte/core'
  import { interactivity, OrbitControls } from '@threlte/extras'
  import { Spring } from 'svelte/motion'
  // import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras'
  import BlochSphere from './BlochSphere.svelte';
</script>
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
