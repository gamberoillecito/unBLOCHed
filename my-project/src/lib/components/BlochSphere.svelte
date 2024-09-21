<script lang="ts">
    import { T } from '@threlte/core'
    import * as Utils from './Utils'
    import { MathUtils  } from 'three';
    // import {CSS2DRenderer} from 'three/addons/renderers/CSS2DRenderer.js'

    const SPHERE_RADIUS = 1;
    const NUM_LATITUDES = 7;
    const NUM_LONGITUDES = 5;
    const LAT_LONG_THICKNESS = 0.005;
    export let SPHERE_COLOR;
</script>

<T.Group>
   <!-- Latitudes -->
   {#each Array(NUM_LATITUDES) as _, iter }
    <T.Mesh
      rotation.x = {MathUtils.degToRad(90)}
      position.y={Utils.latitudeOffset(SPHERE_RADIUS, iter, NUM_LATITUDES)}
    >
      <T.TorusGeometry
      args={[Utils.latitudeRadius(SPHERE_RADIUS, iter, NUM_LATITUDES),LAT_LONG_THICKNESS]}
      />

      <T.MeshLambertMaterial
        color = "#F8EBCE"
      />
    </T.Mesh>

  {/each}

  <!-- Longitudes -->
   {#each Array(NUM_LATITUDES) as _, iter }
  
    <T.Mesh
      rotation.y = {MathUtils.degToRad(360/NUM_LONGITUDES*iter)}
    >
      <T.TorusGeometry
      args={[SPHERE_RADIUS,LAT_LONG_THICKNESS]}
      />

      <T.MeshLambertMaterial
        color = "#F8EBCE"
      />
    </T.Mesh>
  {/each}

  <!-- Transparent mesh -->
  <T.Mesh>
    <T.SphereGeometry/>
    <T.MeshStandardMaterial
      color= {SPHERE_COLOR}
      transparent
      castShadow

      opacity=0.4
    />
  </T.Mesh>
</T.Group>  