<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';
	import { MatrixParam } from '$lib/model/ModelUtility.svelte';
	import { type Attachment } from 'svelte/attachments';
	import { type MathfieldElement } from 'mathlive';
	import { FancyMatrix } from '$lib/model/FancyMatrix.svelte';
	interface Props {
		FM: FancyMatrix;
        param: MatrixParam;
	}

	let { FM, param }: Props = $props();

	// Initialize the mathfield to edit the matrix parameters
	function paramAttachment(param: MatrixParam): Attachment {
		return (element) => {
			let mf = element as MathfieldElement;
			mf.value = `\\small{\\placeholder[${param.name}]{${param.latexValue}}}`;

			// Prevent menu from opening when user right-clicks
			mf.menuItems = [];

			mf.addEventListener('input', () => {
				let paramsNames = mf.getPrompts();
				if (paramsNames.length != 1) {
					console.error(`Matrix parameter contains more than one prompt: ${paramsNames}`);
					return;
				}
				let paramName = paramsNames[0];
				let paramValue = mf.getPromptValue(paramName);
				let res = FM.setParameterLatex(paramName, paramValue);
				FM.userMessage = res.message;
				FM.isConsistent = res.isValid;
			});

			// Prevent the user from leavin math mode (it happens for example when pressing ESC)
			mf.addEventListener('mode-change', (ev) => {
				ev.preventDefault();
			});
		};
	}
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
