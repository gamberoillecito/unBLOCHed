<script lang="ts">
  import { T } from '@threlte/core'
  import { interactivity, OrbitControls, SVG, Billboard, Gizmo, type GizmoOptions } from '@threlte/extras'
  import { Spring } from 'svelte/motion'
  // import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras'
  import BlochSphere from './BlochSphere.svelte';
  import {complex, number, sign, type Complex} from 'mathjs'
  import SolidVector from './SolidVector.svelte';
	import Path from './Path.svelte';
	import { AxesHelper, Camera, DoubleSide, Fog, Mesh, PerspectiveCamera } from 'three';
  import {generateGradient} from "typescript-color-gradient";
	import type { DensityMatrix, GatePath } from './Model.svelte';
  interface Props{
    matrixContext: string,
    paths: GatePath[],
    POI: DensityMatrix[],
  };
  let {
    matrixContext,
    paths,
    POI
  }: Props = $props();

      
  const MAX_PATH_COLORS = 12;
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
  <OrbitControls enableDamping enablePan={false} dampingFactor={0.2}>
    <Gizmo
      animated={true}
      y={{label:'Z'}}
      z={{label:'Y'}}
      size={80}
      resolution={128}
      edges={{scale: 20}}
    />
  </OrbitControls>
</T.PerspectiveCamera>

{#each paths as path, idx }
  <Path path={path} pathColor={pathGradient[idx % MAX_PATH_COLORS]} previousPosition={idx === (paths.length - 1)}></Path>
{/each}

{#each POI as dm, index}
  <Billboard
  follow={true}
  position={
    [
      complex(dm.blochV[0]).re + sign(dm.blochV[0])*0.1,
      complex(dm.blochV[1]).re + sign(dm.blochV[1])*0.08,
      complex(dm.blochV[2]).re + sign(dm.blochV[2])*0.1
    ]
    }
  >

  <SVG 
    src={`/output(${index}).svg`}
    scale={0.00012}
    position={[-0.08, -0.02, +0.08]}
  />
  </Billboard>
{/each}

<BlochSphere ></BlochSphere>
<SolidVector {matrixContext}></SolidVector>