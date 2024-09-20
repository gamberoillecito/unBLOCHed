<script lang="ts">
  import { T } from '@threlte/core'
  import * as Utils from './Utils'
  import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras'
	import { ArrowHelper, Vector3, MathUtils} from 'three';
	import { vec2 } from 'three/examples/jsm/nodes/Nodes.js';
  const SPHERE_RADIUS = 1;
  const NUM_LATITUDES = 7;

</script>


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
<T.Group>
   <!-- Latitudes -->
   {#each Array(NUM_LATITUDES) as _, iter }
    <T.Mesh
      rotation.x = {MathUtils.degToRad(90)}
      position.y={Utils.latitudeOffset(SPHERE_RADIUS, iter, NUM_LATITUDES)}
    >
      <T.TorusGeometry
      args={[Utils.latitudeRadius(SPHERE_RADIUS, iter, NUM_LATITUDES),0.005]}
      />

      <T.MeshLambertMaterial
        color = "green"
      />
    </T.Mesh>

  {/each}

  <!-- Transparent mesh -->
  <T.Mesh>
    <T.SphereGeometry/>
    <T.MeshStandardMaterial
      color="#F8EBCE"
      transparent
      castShadow

      opacity=0.4
    />
  </T.Mesh>
</T.Group>  

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

<T.ArrowHelper>
  <T.Vector3 args={[1,2,0]}/>

</T.ArrowHelper>

