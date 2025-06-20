<script lang="ts">
    import { T } from '@threlte/core'
    import { MathUtils, Color, EllipseCurve, BufferGeometry, Group, Vector3, Line, AxesHelper, ArrowHelper, Matrix4 } from 'three';
	import type { GatePath } from './Model.svelte';
	import { color } from 'three/src/nodes/TSL.js';
	import { Matrix } from 'mathjs';

	interface Props {
		path: GatePath;
	}

	let {
        path,
    }: Props = $props();

    const curve = new EllipseCurve(
	0,  0,            // ax, aY
	1, 1,           // xRadius, yRadius
	0,   path.angle,  // aStartAngle, aEndAngle
	false,            // aClockwise
	0                 // aRotation
);
const Xaxis = new Vector3(1, 0, 0);
const Yaxis = new Vector3(0, 1, 0);
const Zaxis = new Vector3(0, 0, 1);
const startingVector = new Vector3(...path.startingPoint);

const points = curve.getPoints( 50 );
const geometry = new BufferGeometry().setFromPoints( points )

const auxAxis = new Vector3().crossVectors(Xaxis, startingVector).normalize();
const auxAngle = Math.acos(Xaxis.dot(startingVector) / (Xaxis.length() * startingVector.length()))
const rotMatrix = new Matrix4().makeRotationAxis(auxAxis, auxAngle);

geometry.applyMatrix4(rotMatrix);
geometry.lookAt(new Vector3(...path.axis))

const ah = new ArrowHelper((new Vector3(...path.axis)).normalize(), new Vector3(0,0,0), 1.4, '#ffffff', 0);
// const ah = new ArrowHelper(Xaxis, new Vector3(0,0,0), 1.4, '#ffffff', 0);
const originalBV = new ArrowHelper((new Vector3(...path.startingPoint)).normalize(), new Vector3(0,0,0), 1, '#FF0000');

</script>

<T.Line
>
  <T is={geometry}/>
  <T.LineBasicMaterial color='red'/>
</T.Line>

<T is={ah}></T>
<T is={originalBV}></T>