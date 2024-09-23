<script lang="ts">
  import { T } from '@threlte/core'
  import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras'
	import { ArrowHelper, Vector3, MathUtils, AxesHelper, Color as Tcolor} from 'three';
	import { vec2 } from 'three/examples/jsm/nodes/Nodes.js';
  import { Pane, Button, Slider, Color, AutoObject } from 'svelte-tweakpane-ui'
  import BlochSphere from './BlochSphere.svelte';
  import BlochVector from './BlochVector.svelte';
  let SPHERE_COLOR = "#6f6f6f";
  let LAT_LONG_COLOR = "#87a281";
  let BLOCH_VECTOR_SCALE_FACTOR = 1;
  let tetha = 0;
  let phi = 0;
  let BV_rotations = [0,0,0];
  $: REF_VEC = new Vector3().setFromSphericalCoords(1, tetha, phi);
  $: BV_PARAMS = {
    refVec: REF_VEC,
    scaleFactor: BLOCH_VECTOR_SCALE_FACTOR,
    rotations: BV_rotations,
  }
  // $: console.log(BV_PARAMS.rx)
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
  <Color
    label={"Latitude/Longitude Color"}
    bind:value={LAT_LONG_COLOR}
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
  <Slider
    label={"X rotation"}
    bind:value={BV_rotations[0]}
    min={0}
    max={2*Math.PI}
  />
  <Slider
    label={"Y rotation"}
    bind:value={BV_rotations[1]}
    min={0}
    max={2*Math.PI}
  />
  <Slider
    label={"Z rotation"}
    bind:value={BV_rotations[2]}
    min={0}
    max={2*Math.PI}
  />
</Pane>

<T.AxesHelper
/>


<T.DirectionalLight
  intensity={3}
  position.x={5}
  position.y={10}
  castShadow
  color="green"
/>
<T.AmbientLight intensity={0.5}/>

<Grid
  type="polar"
  cellColor= "gray"
  sectionColor="red"
  maxRadius={1.5}
  cellDividers={4}
  cellSize={1}
  fadeDistance={2}
  infiniteGrid
/>

<!-- Bloch Sphere -->
<BlochSphere SPHERE_COLOR={SPHERE_COLOR} LAT_LONG_COLOR={LAT_LONG_COLOR}></BlochSphere>
<BlochVector {...BV_PARAMS}></BlochVector>

<T.PerspectiveCamera
  makeDefault
  position={[-10, 10, 10]}
  fov={15}
>
  <OrbitControls
    enableZoom={false}
  />
</T.PerspectiveCamera>