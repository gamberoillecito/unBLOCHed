<script lang="ts">
	import { T } from '@threlte/core';
	import { Color, Vector3, ArrowHelper } from 'three';
	import { Align, Billboard, MeshLineGeometry, MeshLineMaterial, SVG } from '@threlte/extras';
	import type { sceneSettings } from '$lib/components/Scene.svelte';
	import { mode } from 'mode-watcher';
	import { resolve } from '$app/paths';
	import SemitransparentCircleBg from './SemitransparentCircleBg.svelte';

	interface Props {
		settings: sceneSettings;
		hideLabelsBackground: boolean;
		backgroundColor: Color;
	}

	let { settings, hideLabelsBackground, backgroundColor }: Props = $props();
	const origin = new Vector3(0, 0, 0);
	const Xaxis = new Vector3(1, 0, 0);
	const Yaxis = new Vector3(0, 1, 0);
	const Zaxis = new Vector3(0, 0, 1);

	let lettersOffsets = $derived(
		settings.displayStateLabels === true
			? [
					[-0.05, -0.1, -0.05],
					[0.1, -0.05, -0.05],
					[0.05, 0.03, -0.05]
				]
			: [
					[0, 0, 0],
					[0, 0, 0],
					[0, 0, 0]
				]
	);
</script>

{#each [Xaxis, Yaxis, Zaxis] as ax, i}
	{@const letters = ['x', 'y', 'z']}
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
		<Billboard
			follow={true}
			position={new Vector3()
				.addVectors(
					ax.clone().multiplyScalar(settings.displayStateLabels ? 1 : 1.1),
					new Vector3().fromArray(lettersOffsets[i])
				)
				.toArray()}
		>
			{#key settings.labelSizeMultiplier || settings.displayStateLabels}
				<Align auto z={false}>
					<!-- position={lettersOffsets[i].map((x) => x * 0.05) as [number, number, number]} -->
					<SVG
						src={resolve(`/${mode.current ?? 'light'}/${letters[i]}.svg`)}
						scale={0.00012 * settings.labelSizeMultiplier}
					/>
				</Align>
				{#if settings.paperMode}
					{@const posCorrection = [0.6, 0.4, -0.5]}
					<Align auto z={false}>
						<SemitransparentCircleBg
							position={lettersOffsets[i].map((x, i) => (x + posCorrection[i]) * 0.05) as [
								number,
								number,
								number
							]}
							size={0.05 * settings.labelSizeMultiplier}
							bind:hide={hideLabelsBackground}
							color={backgroundColor}
						/>
					</Align>
				{/if}
			{/key}
		</Billboard>
	{/if}
{/each}
