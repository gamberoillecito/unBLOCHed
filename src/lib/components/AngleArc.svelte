<script lang="ts">
	import { T } from '@threlte/core';
	import {
		Color,
		Vector3,
		Matrix4,
		Group
	} from 'three';
	import { Billboard, SVG } from '@threlte/extras';
	import { mode } from 'mode-watcher';
	import { resolve } from '$app/paths';
	import SemitransparentCircleBg from './3D-elements/SemitransparentCircleBg.svelte';
	import type { sceneSettings } from './Scene.svelte';
	import { Line2, LineGeometry, LineMaterial } from 'three/examples/jsm/Addons.js';

	interface Props {
		vector: [number, number, number];
		backgroundColor: Color;
		hideLabelsBackground: boolean;
		settings: sceneSettings;
	}

	let {
		vector,
		backgroundColor = $bindable(),
		hideLabelsBackground = $bindable(),
		settings
	}: Props = $props();

	// Example usage
	const origin = new Vector3(0, 0, 0);
	const Xaxis = new Vector3(1, 0, 0);
	// const Yaxis = new Vector3(0, 1, 0);
	const Zaxis = new Vector3(0, 0, 1);

	const ARC_RADIUS = 0.2; // Radius of the arcs
	const LINE_RADIUS = 1; // Radius at which the lines connected to the arcs should end
	const THRESHOLD_ANGLE = Math.PI / 10;
	let arcs_color = $derived(
		mode.current === 'light' ? new Color(0, 0, 0) : new Color().setHSL(0, 0, 0.5)
	);
	let segments_color = $derived(
		mode.current === 'light' ? new Color().setHSL(0, 0, 0.1) : new Color().setHSL(0, 0, 0.2)
	);
	// Material for the dashed lines
	let dash_material = $derived(
		new LineMaterial({ color: segments_color, worldUnits: true, linewidth: 0.006 })
	);
	let arc_material = $derived(
		new LineMaterial({ color: arcs_color, worldUnits: true, linewidth: 0.008 })
	);

	// Function to create an arc, it returns also the midpoint to allow to place a label there
	function createArc(
		radius: number,
		startAngle: number,
		endAngle: number,
		material: LineMaterial
	): Line2 {
		const points: Vector3[] = [];
		const segments = 100; // Number of segments for the arc

		for (let i = 0; i <= segments; i++) {
			const angle = startAngle + (endAngle - startAngle) * (i / segments);
			const x = radius * Math.sin(angle);
			const y = radius * Math.cos(angle);
			points.push(new Vector3(x, y, 0));
		}

		const geometry = new LineGeometry().setFromPoints(points);
		return new Line2(geometry, material).computeLineDistances();
	}

	function createSegment(point1: Vector3, point2: Vector3, material: LineMaterial): Group {
		const group = new Group();
		const direction = point2.clone().sub(point1);
		const distance = direction.length();
		direction.normalize();

		const dashLength = 0.03; // Length of each dash
		const gapLength = 0.04; // Length of each gap
		const dashCycle = dashLength + gapLength;

		let currentDist = 0;

		while (currentDist < distance) {
			const dashStart = currentDist;
			const dashEnd = Math.min(currentDist + dashLength, distance);

			// Create a line segment for this dash
			const dashPoints = [
				point1.clone().addScaledVector(direction, dashStart),
				point1.clone().addScaledVector(direction, dashEnd)
			];

			const geometry = new LineGeometry().setFromPoints(dashPoints);
			const line = new Line2(geometry, material).computeLineDistances();
			group.add(line);

			currentDist += dashCycle;
		}

		return group;
	}

	let blochVector = $derived(new Vector3(...vector).normalize());
	let theta = $derived(Math.acos(blochVector.z));
	let phi = $derived(
		blochVector.y >= 0
			? Math.atan2(blochVector.y, blochVector.x)
			: Math.atan2(blochVector.y, blochVector.x) + 2 * Math.PI
	);
	let arcTheta = $derived(createArc(ARC_RADIUS, 0, theta, arc_material));
	let arcPhi = $derived(createArc(ARC_RADIUS, Math.PI / 2, phi + Math.PI / 2, arc_material));
	$effect(() => {
		arcPhi.rotation.x = -Math.PI;
		arcTheta.rotation.y = +phi;
		// arcTheta.rotation.z = -Math.PI/2
		// arcTheta.rotation.y = -Math.PI/2;
		arcTheta.rotation.x = Math.PI / 2;
	});

	// Coordinates of the point on the equatorial plane that lays below the Bloch vector
	// at distance RADIUS from the origin
	let BVProjectionAtRADIUS: Vector3 = $derived(blochVector.clone().setComponent(2, 0));

	//  Line from the origin towards the x axis
	let XLine = $derived(createSegment(origin, Xaxis.clone().setLength(LINE_RADIUS), dash_material));
	// Line from the origin towards the z axis
	let ZLine = $derived(createSegment(origin, Zaxis.clone().setLength(LINE_RADIUS), dash_material));
	// Line from the origin towards the projection of the Bloch Vector on the equatorial plane
	let HLine = $derived(createSegment(origin, BVProjectionAtRADIUS, dash_material));
	// Line from the projection of the Bloch Vector on the equatorial plane to the bloch vector itself
	let VLine = $derived(createSegment(BVProjectionAtRADIUS, blochVector, dash_material));
	// Prolungation of the Bloch vector, useful as a visual aid for mixed states
	let ProlongLine = $derived(createSegment(origin, blochVector, dash_material));

	// Operations needed to correctly place the label for the theta angle
	const rotAxis = $derived(
		Xaxis.clone().applyMatrix4(new Matrix4().makeRotationAxis(Zaxis, Math.PI / 2 + phi))
	);
	const rotationMatrix = $derived(new Matrix4().makeRotationAxis(rotAxis, -theta / 2));
	let midTheta = $derived(
		blochVector
			.clone()
			.applyMatrix4(rotationMatrix)
			.setLength(ARC_RADIUS * 1.2)
	);
</script>

<!--
@component
Renders the `θ` (theta) and `φ` (phi) angle arcs for a Bloch vector.

**Props:**
- `vector: [number, number, number]` - The reactive 3D Bloch vector.

**Usage:**
Place inside a Threlte `<Canvas>` and pass the vector.

```svelte
<script lang="ts">
  import AngleArc from './AngleArc.svelte';
  let blochVector: [number, number, number] = $state([0.5, 0.5, 0.707]);
</script>

<AngleArc vector={blochVector} />
```
-->

<T is={arcPhi}></T>
<T is={arcTheta}></T>

<!-- Line from the origin towards the x axis -->
<T is={XLine}></T>

<!-- Line from the origin towards the z axis     -->
<T is={ZLine}></T>

<!-- Line from the origin towards the projection of the Bloch Vector on the equatorial plane     -->
<T is={HLine}></T>

<!-- Line from the projection of the Bloch Vector on the equatorial plane to the bloch vector itself -->
<T is={VLine}></T>

<!-- Prolungation of the Bloch vector, useful as a visual aid for mixed states -->
<T is={ProlongLine}></T>

{#if phi > THRESHOLD_ANGLE}
	<Billboard
		follow={true}
		position.x={ARC_RADIUS * 1.4 * Math.cos(phi / 2)}
		position.y={ARC_RADIUS * 1.4 * Math.sin(phi / 2)}
	>
		<SVG
			src={resolve(`/${mode.current ?? 'light'}/phi.svg`)}
			scale={0.0001 * settings.labelSizeMultiplier}
			position={[-0.04, 0, 0]}
		/>
		{#if settings.paperMode}
			<SemitransparentCircleBg
				position={[-0.01, 0.013, -0.1]}
				size={0.05 * settings.labelSizeMultiplier}
				bind:hide={hideLabelsBackground}
				bind:color={backgroundColor}
			/>
		{/if}
	</Billboard>
{/if}

{#if theta > THRESHOLD_ANGLE}
	<Billboard follow={true} position.z={midTheta.z} position.x={midTheta.x} position.y={midTheta.y}>
		<SVG
			src={resolve(`/${mode.current ?? 'light'}/theta.svg`)}
			scale={0.0001 * settings.labelSizeMultiplier}
			position={[-0.02, 0, 0]}
		/>
		{#if settings.paperMode}
			<SemitransparentCircleBg
				position={[0.005, 0.03, -0.01]}
				size={0.05 * settings.labelSizeMultiplier}
				bind:hide={hideLabelsBackground}
				bind:color={backgroundColor}
			/>
		{/if}
	</Billboard>
{/if}
