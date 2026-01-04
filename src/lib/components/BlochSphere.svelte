<script lang="ts">
	import { T } from '@threlte/core';
	import { Billboard } from '@threlte/extras';
	import { MathUtils, Color, DoubleSide } from 'three';

	interface Props {
		lat_long_color?: Color;
		sphere_color?: Color;
		sphere_opacity?: number;
		sphere_radius?: number;
		num_latitudes?: number;
		num_longitudes?: number;
		lat_long_thickness?: number;
		lat_long_opacity?: number;
		paper_mode: boolean;
	}

	let {
		lat_long_color = new Color().setHSL(0, 0, 0.2),
		sphere_color = new Color().setHSL(0, 0, 0.5),
		sphere_opacity = 0.1,
		sphere_radius = 1,
		num_latitudes = 1,
		num_longitudes = 2,
		lat_long_thickness = 0.002,
		lat_long_opacity = 1,
		paper_mode = $bindable(),
	}: Props = $props();

	function latitudeSpacing(sphereRad: number, numLatitudes: number) {
		let spacing = (sphereRad * 2) / (numLatitudes + 1);
		return spacing;
	}

	function latitudeOffset(sphereRad: number, prog: number, numLatitudes: number) {
		let spacing = latitudeSpacing(sphereRad, numLatitudes);
		let offset = -(sphereRad - spacing) + spacing * prog;
		return offset;
	}

	function latitudeRadius(sphereRad: number, prog: number, numLatitudes: number) {
		let spacing = latitudeSpacing(sphereRad, numLatitudes);
		let rad = Math.sqrt(sphereRad ** 2 - ((prog - Math.floor(numLatitudes / 2)) * spacing) ** 2);
		return rad;
	}
</script>

<!--
@component
Renders a 3D Bloch sphere, complete with a transparent sphere mesh and customizable latitude and longitude lines.

**Props:**
- `lat_long_color?: Color` (default: `dark grey`)
  The color of the latitude and longitude lines.

- `sphere_color?: Color` (default: `grey`)
  The color of the main transparent sphere.

- `sphere_opacity?: number` (default: `0.1`)
  The opacity of the main sphere.

- `sphere_radius?: number` (default: `1`)
  The radius of the sphere.

- `num_latitudes?: number` (default: `1`)
  The number of latitude lines to draw.

- `num_longitudes?: number` (default: `2`)
  The number of longitude lines to draw.

- `lat_long_thickness?: number` (default: `0.002`)
  The thickness of the latitude and longitude lines.

- `lat_long_opacity?: number` (default: `1`)
  The opacity of the latitude and longitude lines.

**Usage:**
Place the component inside a Threlte `<Canvas>` and customize its appearance by passing props.

```svelte
<script lang="ts">
  import BlochSphere from './BlochSphere.svelte';
  import { Color } from 'three';
</script>

<BlochSphere
  sphere_radius={1.2}
  num_latitudes={3}
  num_longitudes={4}
  sphere_color={new Color('blue')}
  sphere_opacity={0.2}
/>
```
-->

<T.Group>
	<!-- Latitudes -->
	{#each Array(num_latitudes) as _, iter}
		<T.Mesh
			rotation.x={MathUtils.degToRad(90)}
			position.y={latitudeOffset(sphere_radius, iter, num_latitudes)}
		>
			<T.TorusGeometry
				args={[latitudeRadius(sphere_radius, iter, num_latitudes), lat_long_thickness]}
			/>

			<T.LineBasicMaterial
				castshadow={false}
				receiveshadow={false}
				color={lat_long_color}
				transparent
				opacity={lat_long_opacity}
			/>
		</T.Mesh>
	{/each}

	<!-- Longitudes -->
	{#each Array(num_longitudes) as _, iter}
		<T.Mesh rotation.y={MathUtils.degToRad(((360 / num_longitudes) * iter) / 2)}>
			<T.TorusGeometry args={[sphere_radius, lat_long_thickness]} />

			<T.LineBasicMaterial
				castshadow={false}
				receiveshadow={false}
				color={lat_long_color}
				transparent
				opacity={lat_long_opacity}
			/>
		</T.Mesh>
	{/each}

	<!-- Transparent mesh -->
	{#if paper_mode}
		<Billboard follow={true}>
			<T.Mesh position.y={latitudeOffset(sphere_radius, 0, num_latitudes)}>
				<T.TorusGeometry args={[sphere_radius, lat_long_thickness * 2]} />
				<T.LineBasicMaterial
					castshadow={false}
					receiveshadow={false}
					color={lat_long_color}
					transparent
					opacity={lat_long_opacity}
				/>
			</T.Mesh>
		</Billboard>
	{:else}
		<T.Mesh>
			<T.SphereGeometry args={[1, 50, 50]} />
			<T.MeshPhongMaterial
				color={sphere_color}
				transparent
				opacity={sphere_opacity}
				side={DoubleSide}
				depthWrite={false}
			/>
		</T.Mesh>
	{/if}
</T.Group>
