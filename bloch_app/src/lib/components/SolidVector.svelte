<script lang="ts" module>
	// export interface Prop {
	//   length: number;
	//   pointToLookAt: [number, number, number];
	//   phase?: number;
	// }
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import { T } from '@threlte/core';
	import { Group } from 'three';
	import { Outlines } from '@threlte/extras';
	import { generateGradient } from 'typescript-color-gradient';
	import type { DensityMatrix } from './Model.svelte';

	// let {length= 1, pointToLookAt, phase = 0}: Prop = $props();
	interface Props {
		matrixContext: string;
	}

	let { matrixContext }: Props = $props();

	let DM: DensityMatrix = getContext(matrixContext);

	let length = $derived(Math.sqrt(DM.blochV[0] ** 2 + DM.blochV[1] ** 2 + DM.blochV[2] ** 2));

	const HEAD_RAD = 0.04;
	const HEAD_LEN = 0.1;

	const gradientArray = generateGradient(
		['#210CF5', '#F52B16', '#F5D316', '#16F57D', '#210CF5'],
		100
	);
	let color = $derived(
		gradientArray[Math.floor(((gradientArray.length - 1) * DM.phase) / (2 * Math.PI))]
	);

	let body_length = $derived(length - HEAD_LEN * length ** 0.5);
	let scaled_head_length = $derived(HEAD_LEN * length ** 0.5);
	// let pointToLookAt = [x,1,1]
	let vector: Group = $state(new Group());
	$effect(() => {
		vector.lookAt(...(DM.blochV as [number, number, number]));
	});
</script>

<!-- The outlines of the vector (applied to the single parts) -->
{#snippet outline()}
	<Outlines color="black" thickness={8} screenspace={true} />
{/snippet}

<!-- The material of the arrow -->
{#snippet arrowMaterial()}
	<T.MeshToonMaterial {color} castShadow fog={false} />
{/snippet}

<!-- The red point the arrow should look at -->
<!-- I kept it with radius = 0 because otherwise the vector
 does not update immediately but only when the user clicks on
 the viewport-->
<T.Mesh position.x={DM.blochV[0]} position.y={DM.blochV[1]} position.z={DM.blochV[2]}>
	<T.SphereGeometry args={[0]} />
	<T.MeshStandardMaterial color={'red'} />
</T.Mesh>

<T.Group bind:ref={vector}>
	<T.Mesh>
		<T.SphereGeometry args={[HEAD_RAD / 5]} />
		{@render arrowMaterial()}
	</T.Mesh>
	{#if length >= 0.05}
		<!-- Body -->
		<T.Mesh 
			position.z={body_length / 2}
			rotation.x={Math.PI / 2}
			scale.x={(HEAD_RAD / 2) * length ** 0.5}
			scale.z={(HEAD_RAD / 2) * length ** 0.5}
			scale.y={body_length}
		>
			<T.CylinderGeometry args={[1, 0.4, 1]} />
			{@render arrowMaterial()}
		</T.Mesh>
		<!-- Head -->
		<T.Mesh
			position.z={length - scaled_head_length / 2}
			rotation.x={Math.PI / 2}
			scale.x={length ** 0.5 * HEAD_RAD}
			scale.z={length ** 0.5 * HEAD_RAD}
			scale.y={scaled_head_length}
		>
			<T.ConeGeometry args={[1, 1]} />
			{@render arrowMaterial()}
		</T.Mesh>
	{/if}
</T.Group>
