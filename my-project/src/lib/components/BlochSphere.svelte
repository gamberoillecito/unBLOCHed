<script lang="ts">
    import { T } from '@threlte/core'
    import { MathUtils  } from 'three';
    // import {CSS2DRenderer} from 'three/addons/renderers/CSS2DRenderer.js'

    const SPHERE_RADIUS = 1;
    const NUM_LATITUDES = 7;
    const NUM_LONGITUDES = 5;
    const LAT_LONG_THICKNESS = 0.005;
    export let SPHERE_COLOR;

    function latitudeSpacing(sphereRad:number, numLatitudes:number) {
    let spacing = (sphereRad * 2) / (numLatitudes + 1);
    return spacing;
    }

    function latitudeOffset(sphereRad:number, prog:number, numLatitudes:number) {
    let spacing = latitudeSpacing(sphereRad, numLatitudes);
    let offset = -(sphereRad - spacing) + spacing*prog;
    return offset;
    }

    function latitudeRadius(sphereRad:number, prog:number, numLatitudes:number) {
    let spacing = latitudeSpacing(sphereRad, numLatitudes);
    let rad = Math.sqrt(sphereRad**2 - ((prog - Math.floor(numLatitudes/2)) * spacing )**2);
    console.log(spacing);
    return rad;
    }
</script>

<T.Group>
   <!-- Latitudes -->
   {#each Array(NUM_LATITUDES) as _, iter }
    <T.Mesh
      rotation.x = {MathUtils.degToRad(90)}
      position.y={latitudeOffset(SPHERE_RADIUS, iter, NUM_LATITUDES)}
    >
      <T.TorusGeometry
      args={[latitudeRadius(SPHERE_RADIUS, iter, NUM_LATITUDES),LAT_LONG_THICKNESS]}
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