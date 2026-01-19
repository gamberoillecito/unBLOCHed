<script lang="ts">
	import { useThrelte } from '@threlte/core';
	import { T } from '@threlte/core';
	import { OrbitControls, SVG, Billboard, Gizmo, Text } from '@threlte/extras';
	import BlochSphere from './BlochSphere.svelte';
	import { complex, sign } from 'mathjs';
	import SolidVector from './SolidVector.svelte';
	import Path from './Path.svelte';
	import { PerspectiveCamera, Color, Object3D, Vector2 } from 'three';
	import { generateGradient } from 'typescript-color-gradient';
	import type { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
	import AngleArc from './AngleArc.svelte';
	import type { BlochHistory } from '$lib/model/BlochHistory.svelte';
	import { mode } from 'mode-watcher';
	import * as culori from 'culori';
	import { tick } from 'svelte';
	import { resolve } from '$app/paths';
	import SemitransparentCircleBg from './3D-elements/SemitransparentCircleBg.svelte';
	import AxisHelpers from './3D-elements/AxisHelpers.svelte';

	export type sceneSettings = {
		displayAngles: boolean;
		displayStateLabels: boolean;
		displayPaths: boolean;
		displayWatermark: boolean;
		vectorColor: string | null;
		pathColor: string | null;
		paperMode: boolean;
		displayAxisArrows: boolean;
		displayAxisLabels: boolean;
	};

	interface Props {
		DM: DensityMatrix;
		history: BlochHistory;
		POI: DensityMatrix[];
		settings: sceneSettings;
		getImage: (withBackground?: boolean) => Promise<string>;
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
	let hideLabelsBackground = $state(false); // If true the semitransparent circles behind labels is not shown (used for downloading w/o background)
	const lat_long_color = new Color().setHSL(0, 0, 0.2);

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
	const { renderer, scene } = useThrelte();
	let camera = $state() as PerspectiveCamera;

	async function downloadImage(withBackground = true) {
		if (!withBackground){
			hideLabelsBackground = true;
		}

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
				console.warn(`${e} Failed to parse background color:`, color);
			}

			// Set background color
			if (bgColor) {
				renderer.setClearColor(bgColor);
			} else {
				renderer.setClearColor('#ffffff'); // default to white if variable not found
			}
			renderer.setClearAlpha(1); // fully opaque
		}

		await tick();
		// Update the rosolution of the render just for export, then set it back to the default value
		let originalSize = new Vector2();
		renderer.getSize(originalSize)
		renderer.setSize(2000, 2000);
		renderer.render(scene, camera);
		const data = renderer.domElement.toDataURL('image/png');
		renderer.setSize(originalSize.x, originalSize.y)

		// Restore previous state
		renderer.setClearColor(prevClearColor);
		renderer.setClearAlpha(prevClearAlpha);
		setTimeout(() => {
			hideLabelsBackground = false;
		}, 3000);
		return data;
	}

	const watermark = 'unBLOCHed.xyz';
	getImage = downloadImage;
	let backgroundColor = $derived(
		mode.current == 'light' ? new Color().setRGB(0, 255, 255) : new Color('rgb(28, 28, 28)')
	);
</script>

<!--
@component
Renders the main 3D scene, orchestrating the display of the Bloch sphere, the primary state vector, historical paths, angle arcs, and other visual elements. This component is intended to be placed inside a Threlte `<Canvas>`.

**Props:**
- `DM: DensityMatrix`
  The primary reactive `DensityMatrix` to be visualized.

- `history: BlochHistory`
  A `BlochHistory` object used to render the paths of state evolution.

- `POI: DensityMatrix[]`
  An array of `DensityMatrix` objects to display as labeled "Points of Interest".

- `settings: sceneSettings`
  A reactive object with flags to toggle the visibility of scene elements like angles, paths, and labels.

- `getImage: (withBackground?: boolean) => string`
  A bindable function that allows a parent to capture a screenshot of the scene.

- `joystickMode: boolean`
  A flag to switch to a second rendering mode that uses a `FakeDensityMatrix`

**Usage:**
This component contains the entire scene logic and should be placed inside a Threlte `<Canvas>`.

```svelte
<script lang="ts">
  import Scene from './Scene.svelte';
  import { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
  import { BlochHistory } from '$lib/model/BlochHistory.svelte';
  import type { sceneSettings } from './Scene.svelte';

  // Define reactive state for the scene
  let dm = $state(new DensityMatrix());
  let history = $state(new BlochHistory());
  let settings: sceneSettings = $state({
    displayAngles: true,
    displayPaths: true,
    displayStateLabels: true,
    displayWatermark: true,
    vectorColor: null,
    pathColor: null
  });
  let takeScreenshot: () => string;
</script>

<Scene
  DM={dm}
  {history}
  POI={[]}
  {settings}
  bind:getImage={takeScreenshot}
  joystickMode={false}
/>
```
-->

<T.HemisphereLight intensity={1} getContext(matrixContext) />
<!-- <T.DirectionalLight intensity={1} position.x={5} position.y={10} castgetContext(matrixContext) /> -->
<T.AmbientLight intensity={0.8} />
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
	<!-- Add a watermark to the 3D scene. Attachd to the camera to always be in the same position (bottom right) -->
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
		<!-- svg labels of the points on the Bloch sphere and additional round semitransparent background for readability -->
		<Billboard
			follow={true}
			position={[
				complex(dm.blochV[0]).re + sign(dm.blochV[0]) * 0.1,
				complex(dm.blochV[1]).re + sign(dm.blochV[1]) * 0.08,
				complex(dm.blochV[2]).re + sign(dm.blochV[2]) * 0.1
			]}
		>
			<SVG
				src={resolve(`/${mode.current}/output(${index}).svg`)}
				scale={0.00012}
				position={[-0.08, -0.02, +0.08]}
			/>
			{@const svg_bg_offset = index == 4 || index == 0 || index == 1 ? -0.018 : 0.0}
			{@const svg_bg_size = index == 4 || index == 0 || index == 1 ? 0.08 : 0.09}
			{#if settings.paperMode}
				<SemitransparentCircleBg
					position={[svg_bg_offset, +0.015, -0.1]}
					size={svg_bg_size}
					bind:hide={hideLabelsBackground}
					bind:color={backgroundColor}
				/>
			{/if}
		</Billboard>
	{/each}
{/if}

<BlochSphere sphere_opacity={0.07} {settings} {lat_long_color}
></BlochSphere>
<SolidVector {DM} {settings}></SolidVector>
{#if settings.displayAngles}
	<AngleArc
		vector={DM.blochV}
		{settings}
		bind:hideLabelsBackground
		bind:backgroundColor
	></AngleArc>
{/if}

<AxisHelpers {settings} {backgroundColor} {hideLabelsBackground}></AxisHelpers>