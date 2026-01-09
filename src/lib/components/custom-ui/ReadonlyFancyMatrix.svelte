<script lang="ts">
	import { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
	import { type MathfieldElement } from 'mathlive';
	import { FancyMatrix } from '$lib/model/FancyMatrix.svelte';

	interface Props {
		FM: FancyMatrix;
		useExtendedLabel?: boolean;
		debug?: boolean;
	}
	let { FM, useExtendedLabel = true, debug = false }: Props = $props();
</script>

<div>
<math-field
	readonly
	{@attach (mf: MathfieldElement) => {
		let stateV = '';
		if (FM instanceof DensityMatrix) {
			stateV = '\\quad ' + (FM as DensityMatrix).SV.generateLatexString(true, useExtendedLabel);
		}
		mf.value = FM.generateLatexString(true, useExtendedLabel) + stateV;
	}}
></math-field>
{#if debug}
	<pre>{FM.mat.map((row) => '[' + row.map((x) => x.toString()).join(', ') + ']').join('\n')}</pre>
{/if}
</div>