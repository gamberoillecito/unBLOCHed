<script lang="ts">
    import "mathlive";
    import type { MathfieldElement, MathfieldElementAttributes } from "mathlive";
    import { onMount} from "svelte";
    import {on} from "svelte/events"
    import "mathlive/fonts.css"
    
    export type promptsDict = {[key: string]:string}
    type Props = { value?: string, prompts?:promptsDict } & Partial<MathfieldElementAttributes>;
    let { value = $bindable(), 
        prompts = $bindable(),
        getPromptValue = $bindable(),
        expression = $bindable(),
        ...rest }: Props = $props();

    let node = $state();
    
    const init = (node:MathfieldElement) => {
        console.log("init")
        let firstTime = true; // Hack to allow updating prompts the first time the element is loaded

        function onchange(){
            value = node.value

            for (let p of node.getPrompts()){
                if (prompts){
                    if (prompts[p] != node.getPromptValue(p)){
                        prompts[p] = node.getPromptValue(p)
                    }
                }
            }
        }

        node.addEventListener('change', onchange)

        // Every time the parent changes the value, update the node value
        $effect(()=>{
            if (value) node.value = value
            // If the element has just been loaded, call the "onchange" function
            // to update the prompts prop (it is a bit hacky)
            if (firstTime == true){
                onchange();
                firstTime = false;
            }
        })

        // Every time the parent changes the prompts, reflect these changes in the node
        $effect(()=>{
            console.log("changed prompts")
            if (prompts){
                for (let p in prompts){
                    node.setPromptValue(p, prompts[p], {})
                }
            }
        })
    };
  
</script>

<math-field use:init bind:this={node} {...rest}></math-field>

<style>
    math-field::part(virtual-keyboard-toggle) {
        display: none;
    }
    math-field::part(menu-toggle) {
        display: none;
    }
    math-field::part(placeholder) {
        border: none;
        background-color: red;
    }
</style>