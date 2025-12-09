<script lang="ts">
	import { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
	import { type MathfieldElement } from 'mathlive';
	import { FancyMatrix } from '$lib/model/FancyMatrix.svelte';

	interface Props {
		FM: FancyMatrix;
	}
	let { FM }: Props = $props();
</script>

<math-field
	readonly
	{@attach (mf: MathfieldElement) => {
		let stateV = '';
		if (FM instanceof DensityMatrix) {
			stateV = '\\quad ' + (FM as DensityMatrix).SV.generateLatexString(true);
		}
		mf.value = FM.generateLatexString(true) + stateV;
	}}
></math-field>
