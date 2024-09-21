<script lang="ts">
  import { T } from '@threlte/core'
  import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras'
	import { ArrowHelper, Vector3, MathUtils} from 'three';
	import { vec2 } from 'three/examples/jsm/nodes/Nodes.js';
  import { Pane, Button, Slider, Color, AutoObject } from 'svelte-tweakpane-ui'
  import BlochSphere from './BlochSphere.svelte';
  import BlochVector from './BlochVector.svelte';
  let SPHERE_COLOR = "#898de8";
  let BLOCH_VECTOR_SCALE_FACTOR = 1;
  let tetha = 0;
  let phi = 0;
  $: REF_VEC = new Vector3().setFromSphericalCoords(1, tetha, phi);
  // $: console.log(tetha);
</script>



<Pane
  title="Testing"
  position="fixed"
>
  <Color
    label={"Sphere Color"}
    bind:value={SPHERE_COLOR}
  />
  <Slider
    label={"Vector Scale Factor"}
    bind:value={BLOCH_VECTOR_SCALE_FACTOR}
    min={0}
    max={1}
  />
  <Slider
    label={"Tetha"}
    bind:value={tetha}
    min={0}
    max={2*Math.PI}
  />
  <Slider
    label={"Phi"}
    bind:value={phi}
    min={0}
    max={2*Math.PI}
  />
</Pane>

<T.DirectionalLight
  intensity={3}
  position.x={5}
  position.y={10}
  castShadow
  color="green"
/>
<T.AmbientLight intensity={0.5}/>

<Grid
  position.y={-0.001}
  cellColor= "gray"
  color="green"
  sectionColor="red"
  sectionThickness={1}
  fadeDistance={25}
  cellSize={2}
/>

<!-- Bloch Sphere -->
<BlochSphere SPHERE_COLOR={SPHERE_COLOR}></BlochSphere>
<BlochVector scaleFactor={BLOCH_VECTOR_SCALE_FACTOR} refVec={REF_VEC}></BlochVector>

<T.PerspectiveCamera
  makeDefault
  position={[-10, 10, 10]}
  fov={15}
>
  <OrbitControls
    enableZoom={false}
    autoRotateSpeed={0.5}
  />
</T.PerspectiveCamera>
