<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';
	import { MatrixParam } from '$lib/model/ModelUtility.svelte';
	import { type Attachment } from 'svelte/attachments';
	interface Props {
		param: MatrixParam;
        paramAttachment: (param: MatrixParam) => Attachment;
	}

	let { param, paramAttachment }: Props = $props();


</script>

<div class="flex flex-row gap-2">
	<Label for={param.latexLabel}
		><math-field readonly>{`\\mathbf{${param.latexLabel}}`}</math-field></Label
	>
	<math-field
		aria-labelledby={param.latexLabel}
		id={param.latexLabel}
		{@attach paramAttachment(param)}
		readonly
	></math-field>
</div>
