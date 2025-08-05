<script lang="ts">
	import { Canvas, useThrelte, useTask, } from '@threlte/core';
	import { T } from '@threlte/core';
	import {
		interactivity,
		OrbitControls,
		SVG,
		Billboard,
		Gizmo,
		type GizmoOptions
	} from '@threlte/extras';
	import { Spring } from 'svelte/motion';
	// import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras'
	import BlochSphere from './BlochSphere.svelte';
	import { boolean, complex, number, sign, type Complex } from 'mathjs';
	import SolidVector from './SolidVector.svelte';
	import Path from './Path.svelte';
	import { ArrowHelper, AxesHelper, Camera, DoubleSide, Fog, Mesh, PerspectiveCamera } from 'three';
	import { generateGradient } from 'typescript-color-gradient';
	import type { DensityMatrix, GatePath } from './Model.svelte';
	import AngleArc from './AngleArc.svelte';
	import { getContext } from 'svelte';
	import type { BlochHistory } from './BlochHistory.svelte';
	import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
	export type sceneSettings = {displayAngles: boolean, displayStateLabels: boolean, displayPaths: boolean }	 
	interface Props {
		matrixContext: string;
		history: BlochHistory;
		POI: DensityMatrix[];
		settings: sceneSettings;
		imageData: string;
		requestImage: boolean;
		
	}

	let {
		matrixContext,
		history,
		POI,
		settings,
		imageData = $bindable(),
		requestImage,
	}: Props = $props();

	$inspect(requestImage)
	


	let DM:DensityMatrix = getContext(matrixContext);
	const MAX_PATH_COLORS = 12;
	const colors_hex = [
		'#ff0000',
		'#ffa700',
		'#afff00',
		'#08ff00',
		'#00ff9f',
		'#00b7ff',
		'#0010ff',
		'#9700ff',
		'#ff00bf',
		'#ff0018'
	];
	let pathGradient = generateGradient(colors_hex, MAX_PATH_COLORS);

	let camera = $state<PerspectiveCamera>();
	const { renderer, scene, renderStage, autoRenderTask } = useThrelte();
	const task = useTask(() => {
			console.log('tasking');
			
			if (requestImage){
				const data = renderer.domElement.toDataURL('image/png');
				console.log(data);
				requestImage = false
				const link = document.createElement('a');
                link.download = `bloch-sphere-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                link.href = data;
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
			}
		},
	{after: autoRenderTask});

</script>

<T.DirectionalLight intensity={3} position.x={5} position.y={10} castgetContext(matrixContext) />
<T.AmbientLight intensity={0.5} />
<T.PerspectiveCamera
	bind:ref={camera}
	makeDefault
	position={[10, 10, 10]}
	fov={10}
	oncreate={(ref) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls enableDamping enablePan={false} dampingFactor={0.2}>
		<Gizmo
			animated={true}
			y={{ label: 'Z' }}
			z={{ label: 'Y' }}
			size={80}
			resolution={128}
			edges={{ scale: 20 }}
		/>
	</OrbitControls>
</T.PerspectiveCamera>
{#if settings.displayPaths}
	{#each history.list as historyEl, idx}
		{#if historyEl.path && historyEl.pathVisible}
			<Path
				path = {historyEl.path}
				pathColor={pathGradient[idx % MAX_PATH_COLORS]}
				previousPosition={idx === history.list.length - 1}
			></Path>
		{/if}
	{/each}
{/if}

{#if settings.displayStateLabels}
	{#each POI as dm, index}
		<Billboard
			follow={true}
			position={[
				complex(dm.blochV[0]).re + sign(dm.blochV[0]) * 0.1,
				complex(dm.blochV[1]).re + sign(dm.blochV[1]) * 0.08,
				complex(dm.blochV[2]).re + sign(dm.blochV[2]) * 0.1
			]}
		>
			<SVG src={`/output(${index}).svg`} scale={0.00012} position={[-0.08, -0.02, +0.08]} />
		</Billboard>
	{/each}
{/if}

<BlochSphere></BlochSphere>
<SolidVector {matrixContext}></SolidVector>
{#if settings.displayAngles}
	<AngleArc vector={DM.blochV}></AngleArc>
{/if}
