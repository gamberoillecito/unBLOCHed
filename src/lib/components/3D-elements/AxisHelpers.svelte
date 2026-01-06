<script lang="ts">
    
	import { T } from '@threlte/core';
	import {
		Color,
		Vector3,
		ArrowHelper
	} from 'three';
	import { Billboard, MeshLineGeometry, MeshLineMaterial, SVG, Text } from '@threlte/extras';
	import type { sceneSettings } from './Scene.svelte';
    
	interface Props {
		settings: sceneSettings;
	}

	let {
		settings
	}: Props = $props();
	const origin = new Vector3(0, 0, 0);
	const Xaxis = new Vector3(1, 0, 0);
	const Yaxis = new Vector3(0, 1, 0);
	const Zaxis = new Vector3(0, 0, 1);
</script>
{#each [Xaxis, Yaxis, Zaxis] as ax, i}
	{@const letters = ['x', 'y', 'z']}
	{@const lettersOffsets = [
		[1, 0, 0],
		[1, 0, 0],
		[1, 0, 0]
	]}
	{@const color = new Color().setHSL(0, 0, 0.2)}
	{@const ah = new ArrowHelper(ax, new Vector3(0, 0, 0), 1, color, 0.05, 0.04)}
	{#if settings.displayAxisArrows}
		<T.Mesh>
			<MeshLineGeometry points={[origin, ax.clone().setLength(0.99)]} />
			<MeshLineMaterial width={0.06} {color} />
		</T.Mesh>
		<T is={ah} />
	{/if}
	{#if settings.displayAxisLabels}
	<Billboard follow={true} position={ax.toArray()}>
		<Text
			position={lettersOffsets[i].map((x) => x * 0.08) as [number, number, number]}
			anchorX="center"
			color="gray"
			text={letters[i]}
			anchorY="center"
			textAlign="center"
			scale={1}
		/>
	</Billboard>
	{/if}
{/each}