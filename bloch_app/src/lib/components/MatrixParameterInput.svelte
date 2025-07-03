<script lang="ts">
    import { FancyMatrix } from "./Model.svelte";
    import { type Attachment } from "svelte/attachments";
    import { type MathfieldElement } from "mathlive";
	import { getContext } from "svelte";
    import { MatrixParam } from "./Model.svelte";

	interface Props {
        matrix: FancyMatrix;
	}
    
    let {
        matrix,
    }: Props = $props();
    let FM: FancyMatrix = matrix;
    
    // Initialize the mathfield to edit the matrix parameters
	function paramAttachment(param: MatrixParam) :Attachment {
        return (element) => {
            let mf = element as MathfieldElement; 
            mf.value = `${param.latexLabel} = \\placeholder[${param.name}]{${param.latexValue}}`;
            mf.addEventListener('input', ()=> {

                let paramsNames = mf.getPrompts();
                if (paramsNames.length != 1){
                    console.error(`Matrix parameter contains more than one prompt: ${paramsNames}`)
                    return;
                }
                let paramName = paramsNames[0];
                let paramValue = mf.getPromptValue(paramName);
                let res = FM.setParameterLatex(paramName, paramValue);
                FM.userMessage = res.message;
                FM.isConsistent = res.isValid; 
                console.log(FM.isConsistent);
                
            })
        }
    }
</script>

{#each FM.parameterArray as param, index }
    {#if param.userEditable}
    <math-field {@attach paramAttachment(param)} readonly></math-field>
    {/if}
{/each}