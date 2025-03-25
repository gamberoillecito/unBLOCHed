<script>
	import 'mathlive'
	import { onMount } from 'svelte';
  let {latex = $bindable()} = $props();
  let mathfieldElement;
	$effect(() => {
		mathfieldElement.value = latex;
	});
  const updateLatex = () => {
    latex = mathfieldElement.value;
  };

	  onMount(() => {
    mathfieldElement.addEventListener('mount', () => {
      // You can configure the mathfield here
      // ...
			mathfieldElement.smartMode = true;
      
    });
  });
	
</script>

<math-field
  bind:this={mathfieldElement}
  oninput={updateLatex}
></math-field>