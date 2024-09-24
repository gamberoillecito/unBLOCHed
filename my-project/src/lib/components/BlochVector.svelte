<script lang="ts">
    import { T } from '@threlte/core'
	import type { List } from 'svelte-tweakpane-ui';
    import { MathUtils, Spherical, Vector3, ArrowHelper, Quaternion } from 'three';
    import {Group} from 'three'
    // import {CSS2DRenderer} from 'three/addons/renderers/CSS2DRenderer.js'

    const VEC_LEN = 1;
    const HEAD_LEN = 0.2;
    const VEC_COLOR = "red";

    const HEAD_RAD = 0.05;
    export let scaleFactor:number;
    export let refVec:Vector3;
    export let rotations:number[];
    let group: Group | undefined = undefined;
    // $: console.log(getTetha(refVec));
    $: console.log(refVec);
    // $: group?.rotateOnWorldAxis(new Vector3(0,0,1), rotations[2]);
    $: group?.lookAt(refVec);
    
    function getTetha(vec:Vector3) {
      let sph = new Spherical().setFromVector3(vec);
      return sph.theta;
    }

    function getPhi(vec:Vector3) {
      let sph = new Spherical().setFromVector3(vec);
      return sph.phi;
    }
  </script>

<T.ArrowHelper
  args={[new Vector3(Math.sin(rotations[0])*Math.cos(rotations[1]), Math.sin(rotations[0])*Math.sin(rotations[1]), Math.cos(rotations[0])), new Vector3(0,0,0)]}
/>
<T.Group
  rotation.y={Math.PI/2}
  bind:ref={group}
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