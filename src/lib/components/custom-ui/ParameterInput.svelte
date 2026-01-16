<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';
	import { MatrixParam } from '$lib/model/ModelUtility.svelte';
	import { type Attachment } from 'svelte/attachments';
	import { type MathfieldElement } from 'mathlive';
	interface Props {
		param: MatrixParam;
		callback: (paramName: string, paramValue: string)=> void
	}

	let { param, callback}: Props = $props();
	// Initialize the mathfield to edit the matrix parameters
	function paramAttachment(param: MatrixParam): Attachment {
		return (element) => {
			let mf = element as MathfieldElement;
			mf.value = `${param.latexValue}`;

			// Prevent menu from opening when user right-clicks
			mf.menuItems = [];

			mf.addEventListener('input', () => {
				let paramName = param.name;
				let paramValue = mf.value;
				console.log(paramValue);
				
				// Here we execute the code that the parent provided
				callback(paramName, paramValue)
			});

			// Prevent the user from leaving math mode (it happens for example when pressing ESC)
			mf.addEventListener('mode-change', (ev) => {
				ev.preventDefault();
			});
		};
	}

</script>

<style>
  math-field:focus-within {
    outline: none;
	background-color: none;
  }
  math-field::part(content) {
    padding: 0;
	margin: 0;
  }
</style>

<div class="flex flex-row gap-0 border border-accent shadow-xs rounded-md">
	<Label for={param.latexLabel}
		><math-field readonly>{`\\mathbf{${param.latexLabel}}:`}</math-field></Label
	>
	<math-field
		aria-labelledby={param.latexLabel}
		id={param.latexLabel}
		{@attach paramAttachment(param)}
	></math-field>
</div>
