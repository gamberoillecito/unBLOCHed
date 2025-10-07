<script lang="ts">
	import { T } from '@threlte/core';
	import {
		Color,
		BufferGeometry,
		Vector3,
		Line,
		Matrix4,
		LineBasicMaterial,
		LineDashedMaterial,
		Material,
	} from 'three';
	import { Billboard, SVG } from '@threlte/extras';
	import { mode } from 'mode-watcher';
	import { base } from '$app/paths';

	interface Props {
		vector: [number, number, number];
	}

	let { vector }: Props = $props();

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
	// Material for the dashed lines
	let dash_material = $derived(
		new LineDashedMaterial({ color: arcs_color, dashSize: 0.02, gapSize: 0.03 })
	);
	let arc_material = $derived(new LineBasicMaterial({ color: arcs_color }));

	// Function to create an arc, it returns also the midpoint to allow to place a label there
	function createArc(
		radius: number,
		startAngle: number,
		endAngle: number,
		material: Material
	): Line {
		const points: Vector3[] = [];
		const segments = 100; // Number of segments for the arc

		for (let i = 0; i <= segments; i++) {
			const angle = startAngle + (endAngle - startAngle) * (i / segments);
			const x = radius * Math.sin(angle);
			const y = radius * Math.cos(angle);
			points.push(new Vector3(x, y, 0));
		}

		const geometry = new BufferGeometry().setFromPoints(points);
		return new Line(geometry, material).computeLineDistances();
	}

	function createSegment(point1: Vector3, point2: Vector3, material: Material): Line {
		const geometry = new BufferGeometry().setFromPoints([point1, point2]);
		return new Line(geometry, material).computeLineDistances();
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
		arcTheta.rotation.x = Math.PI/2
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

<T.Line is={arcPhi}></T.Line>
<T.Line is={arcTheta}> </T.Line>

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
		<SVG src={`${base}/${mode.current}/phi.svg`} scale={0.0001} position={[-0.04, 0, 0]} />
	</Billboard>
{/if}

{#if theta > THRESHOLD_ANGLE}
	<Billboard follow={true} position.z={midTheta.z} position.x={midTheta.x} position.y={midTheta.y}>
		<SVG src={`${base}/${mode.current}/theta.svg`} scale={0.0001} position={[-0.02, 0, 0]} />
	</Billboard>
{/if}
