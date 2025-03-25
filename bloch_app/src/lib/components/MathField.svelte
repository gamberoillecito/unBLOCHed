<script lang="ts">
	import 'mathlive'
  import  type {MathfieldElement} from 'mathlive'
	import { onMount } from 'svelte';
  let {latex = $bindable()} = $props();
  let mathfieldElement: MathfieldElement;
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