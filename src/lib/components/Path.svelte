<script lang="ts">
    import { T } from '@threlte/core'
    import { MathUtils, Color, EllipseCurve, BufferGeometry, Group, Vector3, Line, AxesHelper, ArrowHelper, Matrix4, LineBasicMaterial } from 'three';
	import type { GatePath } from './Model.svelte';
	import { color } from 'three/src/nodes/TSL.js';
	import { Matrix } from 'mathjs';
	import { Line2, LineGeometry, LineMaterial } from 'three/examples/jsm/Addons.js';

	interface Props {
		path: GatePath;
		pathColor: Color|string;
		previousPosition: boolean;
	}

	let {
        path,
		pathColor: pathColor,
		previousPosition=false,
    }: Props = $props();


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
    const interpolatedAngle = t * angle; 
    const rotationMatrix = new Matrix4().makeRotationAxis(axis, interpolatedAngle);
    
    // Apply the rotation to the initial vector to keep track of consecutive movements
    const point = initialVector.clone().applyMatrix4(rotationMatrix);
    points.push(point);
}

const arcGeometry = new LineGeometry().setFromPoints(points);
const line = new Line2(arcGeometry);
const ah = new ArrowHelper((new Vector3(...path.axis)).normalize(), new Vector3(0,0,0), 1.4, '#ffffff', 0);
// const ah = new ArrowHelper(Xaxis, new Vector3(0,0,0), 1.4, '#ffffff', 0);
const originalBV = new ArrowHelper(initialVector, new Vector3(0,0,0), initialVector.length(), '#FF0000');
const material = new LineMaterial({
	color: pathColor,
	worldUnits: false,
});
material.linewidth = 3;
</script>

<T is={line}
>
  <T is={material}></T>
</T>

{#if previousPosition}
	<T is={ah}></T>
	<T is={originalBV}></T>
{/if}