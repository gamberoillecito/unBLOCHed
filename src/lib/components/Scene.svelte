<script lang="ts">
	import { Canvas, useThrelte, useTask } from '@threlte/core';
	import { T } from '@threlte/core';
	import { OrbitControls, SVG, Billboard, Gizmo, Text } from '@threlte/extras';
	// import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras'
	import BlochSphere from './BlochSphere.svelte';
	import { boolean, complex, number, sign, type Complex } from 'mathjs';
	import SolidVector from './SolidVector.svelte';
	import Path from './Path.svelte';
	import { PerspectiveCamera, Color, Object3D } from 'three';
	import { generateGradient } from 'typescript-color-gradient';
	import type { GatePath } from '$lib/model/ModelUtility.svelte';
	import type { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
	import AngleArc from './AngleArc.svelte';
	import { getContext, onMount } from 'svelte';
	import type { BlochHistory } from '$lib/model/BlochHistory.svelte';
	import { mode } from 'mode-watcher';
	import { base } from '$app/paths';
	import * as culori from 'culori';

	export type sceneSettings = {
		displayAngles: boolean;
		displayStateLabels: boolean;
		displayPaths: boolean;
		displayWatermark: boolean;
		vectorColor: string | null;
		pathColor: string | null;
	};
	interface Props {
		DM: DensityMatrix;
		history: BlochHistory;
		POI: DensityMatrix[];
		settings: sceneSettings;
		getImage: (withBackground?: boolean) => string;
		joystickMode: boolean;
	}

	let {
		DM,
		history,
		POI,
		settings,
		getImage = $bindable(),
		joystickMode = $bindable()
	}: Props = $props();

	const SHOW_PATH_HELPERS = false;

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
	// Set Z as the "up" direction
	Object3D.DEFAULT_UP.set(0, 0, 1);

	let pathGradient = generateGradient(colors_hex, MAX_PATH_COLORS);
	const { renderer, scene, renderStage, autoRenderTask, canvas } = useThrelte();
	let camera = $state() as PerspectiveCamera;

	function downloadImage(withBackground = true) {
		const prevClearColor = new Color();
		renderer.getClearColor(prevClearColor);
		const prevClearAlpha = renderer.getClearAlpha();

		if (withBackground) {
			// Get the root element
			const root = document.documentElement;

			// Get the value of the CSS variable
			const color = getComputedStyle(root).getPropertyValue('--background');
			let bgColor: string | null = null;

			// Parse the color using the 'color' library
			try {
				const c = culori.parse(color); // parses ok/oklch/hsl/rgb
				if (c) bgColor = culori.formatRgb(c); // returns "rgb(r,g,b)"
			} catch (e) {
				console.warn('Failed to parse background color:', color);
			}

			// Set background color
			if (bgColor) {
				renderer.setClearColor(bgColor);
			} else {
				renderer.setClearColor('#ffffff'); // default to white if variable not found
			}
			renderer.setClearAlpha(1); // fully opaque
		}

		renderer.render(scene, camera);
		const data = renderer.domElement.toDataURL('image/png');

		// Restore previous state
		renderer.setClearColor(prevClearColor);
		renderer.setClearAlpha(prevClearAlpha);

		return data;
	}

	const watermark = 'unBLOCHed.xyz';
	getImage = downloadImage;
</script>

<T.DirectionalLight intensity={3} position.x={5} position.y={10} castgetContext(matrixContext) />
<T.AmbientLight intensity={0.5} />
<T.PerspectiveCamera
	bind:ref={camera}
	makeDefault
	position={[10, 10, 10]}
	fov={8}
	oncreate={(ref) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls enableDamping enablePan={false} dampingFactor={0.2}>
		<Gizmo animated={true} size={80} resolution={128} edges={{ scale: 20 }} />
	</OrbitControls>
	{#if settings.displayWatermark}
		<Text
			position={[0.62, -0.58, -10]}
			anchorX="right"
			color="gray"
			text={watermark}
			anchorY="baseline"
			textAlign="right"
			scale={0.45}
		/>
	{/if}
</T.PerspectiveCamera>
{#if settings.displayPaths}
	{#each history.list as historyEl, idx}
		{#if historyEl.path && historyEl.pathVisible && !joystickMode}
			<Path
				path={historyEl.path}
				pathColor={settings.pathColor ?? pathGradient[idx % MAX_PATH_COLORS]}
				previousPosition={idx === history.list.length - 1 && SHOW_PATH_HELPERS}
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
			<SVG
				src={`${base}/${mode.current}/output(${index}).svg`}
				scale={0.00012}
				position={[-0.08, -0.02, +0.08]}
			/>
		</Billboard>
	{/each}
{/if}

<BlochSphere></BlochSphere>
<SolidVector {DM} vectorColor={settings.vectorColor}></SolidVector>
{#if settings.displayAngles}
	<AngleArc vector={DM.blochV}></AngleArc>
{/if}
