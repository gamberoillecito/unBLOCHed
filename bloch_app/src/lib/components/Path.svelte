<script lang="ts">
    import { T } from '@threlte/core'
    import { MathUtils, Color, EllipseCurve, BufferGeometry, Group, Vector3, Line, AxesHelper, ArrowHelper } from 'three';
	import type { GatePath } from './Model.svelte';

	interface Props {
		gatePath: GatePath;
	}

	let {
        gatePath,
    }: Props = $props();

    const curve = new EllipseCurve(
	0,  0,            // ax, aY
	1, 1,           // xRadius, yRadius
	Math.PI/8,   Math.PI,  // aStartAngle, aEndAngle
	false,            // aClockwise
	0                 // aRotation
);

const points = curve.getPoints( 50 );
const geometry = new BufferGeometry().setFromPoints( points )
geometry.lookAt(new Vector3(...gatePath.axis))
let ax = new Vector3(...gatePath.axis).normalize()

</script>

<T.Line>
  <T is={geometry}/>
  <T.LineBasicMaterial color='red'/>
</T.Line>

<T.ArrowHelper args={[(new Vector3(1,1,1)).normalize()]} ></T.ArrowHelper>
