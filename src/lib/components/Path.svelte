<script lang="ts">
	import { T } from '@threlte/core';
	import {
		Color,
		Vector3,
		ArrowHelper,
		Matrix4,
	} from 'three';
	import type { GatePath } from '$lib/model/ModelUtility.svelte';
	import { Line2, LineGeometry, LineMaterial } from 'three/examples/jsm/Addons.js';

	interface Props {
		path: GatePath;
		pathColor: Color | string;
		previousPosition: boolean;
	}

	let { path, pathColor = $bindable(), previousPosition = false }: Props = $props();

	const initialVector = new Vector3(...path.startingPoint);

	// Variabili per l'asse e l'angolo di rotazione
	const axis = new Vector3(...path.axis);
	const angle = path.angle;

	// Number of points along the arc
	const numPoints = 100;
	const points = [];

	// Compute the points along the arc traced by the vector
	for (let i = 0; i <= numPoints; i++) {
		const t = i / numPoints;
		const interpolatedAngle = -t * angle;
		const rotationMatrix = new Matrix4().makeRotationAxis(axis, interpolatedAngle);

		// Apply the rotation to the initial vector to keep track of consecutive movements
		const point = initialVector.clone().applyMatrix4(rotationMatrix);
		points.push(point);
	}

	const arcGeometry = new LineGeometry().setFromPoints(points);
	const line = new Line2(arcGeometry);
	const ah = new ArrowHelper(
		new Vector3(...path.axis).normalize(),
		new Vector3(0, 0, 0),
		1.4,
		'#ffffff',
		0
	);
	// const ah = new ArrowHelper(Xaxis, new Vector3(0,0,0), 1.4, '#ffffff', 0);
	const originalBV = new ArrowHelper(
		initialVector,
		new Vector3(0, 0, 0),
		initialVector.length(),
		'#FF0000'
	);
	const material = new LineMaterial({
		color: pathColor,
		worldUnits: false
	});
	material.linewidth = 3;
</script>

<!--
@component
Renders a 3D arc representing the path a Bloch vector takes when a quantum gate is applied. It visualizes the rotation of the vector around a specific axis.

**Props:**
- `path: GatePath`
  A reactive `GatePath` object containing the `startingPoint`, `axis`, and `angle` of rotation.

- `pathColor: Color | string`
  The color of the rendered arc path.

- `previousPosition: boolean` (optional, default: `false`)
  If `true`, it also renders helper arrows to show the original vector position and the axis of rotation for debugging purposes.

**Usage:**
Place the component inside a Threlte `<Canvas>` and provide the `path` and `pathColor` props.

```svelte
<script lang="ts">
  import { Canvas } from '@threlte/core';
  import Path from './Path.svelte';
  import type { GatePath } from '$lib/model/ModelUtility.svelte';
  import { Color } from 'three';

  // Define a reactive GatePath object
  let gatePath: GatePath = $state({
    startingPoint: [1, 0, 0],
    axis: [0, 0, 1],
    angle: Math.PI / 2
  });
</script>

<Path path={gatePath} pathColor={new Color('cyan')} />

```
-->

<T is={line}>
	<T is={material}></T>
</T>

{#if previousPosition}
	<T is={ah}></T>
	<T is={originalBV}></T>
{/if}
