<script lang="ts">
    import { T } from '@threlte/core'
    import * as Utils from './Utils'
    import { MathUtils  } from 'three';
    // import {CSS2DRenderer} from 'three/addons/renderers/CSS2DRenderer.js'

    const VEC_LEN = 1;
    const HEAD_LEN = 0.2;
    const VEC_COLOR = "red";

    const HEAD_RAD = 0.05;
    export let scaleFactor;
  </script>

<T.Group
  rotation.x={3}
>
  {#if scaleFactor > 0.05}
    <!-- Body -->
    <T.Mesh
      position.y = {scaleFactor*(VEC_LEN - HEAD_LEN)/2}
    >
      <T.CylinderGeometry
      args={[scaleFactor*(HEAD_RAD/2), 0.01, scaleFactor*(VEC_LEN - HEAD_LEN)]}/>
      <T.MeshStandardMaterial
        color= {VEC_COLOR}
        castShadow

      />
    </T.Mesh>
    <!-- Head -->
    <T.Mesh
      position.y = {scaleFactor*(VEC_LEN  - HEAD_LEN/2)}
    >
      <T.ConeGeometry
      args={[Math.sqrt(scaleFactor)*HEAD_RAD, Math.sqrt(scaleFactor)*HEAD_LEN]}/>
      <T.MeshStandardMaterial
        color= {VEC_COLOR}
        castShadow

      />
    </T.Mesh>
  {:else}
    <!-- Point -->
    <T.Mesh>
      <T.SphereGeometry
      args={[0.02]}/>
      <T.MeshStandardMaterial
        color= {VEC_COLOR}
        castShadow

      />
    </T.Mesh>
  {/if}

</T.Group>  