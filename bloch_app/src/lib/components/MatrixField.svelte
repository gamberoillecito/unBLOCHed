<script lang="ts">
    import { Canvas } from '@threlte/core'
    import Scene from './Scene.svelte'
    import {complex, type Complex, exp, multiply, range} from 'mathjs'
    
    import {DensityMatrix , print_mat} from '$lib/components/Model.svelte'
    import MathField from "$lib/components/MathField.svelte"
    import type {promptsDict} from "$lib/components/MathField.svelte"
    import {ComputeEngine} from  "@cortex-js/compute-engine"
    import type { ComplexMat2x2 } from '$lib/components/Model.svelte';

    type Props = { matrix:ComplexMat2x2 };
    let {
        matrix = $bindable(),
        }: Props = $props();
    let DM_latex =  $state('\\placeholder[mult]{1}\\cdot\\begin{bmatrix}\\placeholder[m00]{1} & \\placeholder[m01]{0}\\\\ \\placeholder[m10]{0} & \\placeholder[m11]{1}\\end{bmatrix}');

    let DM_prompts: promptsDict = $state({});

    function test(){
        let temp_prompt: promptsDict = {};
        for (let i =0; i < 2; i++) {
            for (let j =0; j < 2; j++) {
                let idx = `m${i}${j}`
                let mat_element = matrix[i][j]
                temp_prompt[idx] = `${mat_element.re}+i${mat_element.im}`
            }
        }
        return temp_prompt;
    }

    let ce = new ComputeEngine();

    $effect(() => {
        for (let i =0; i < 2; i++) {
        for (let j =0; j < 2; j++) {
            let idx = `m${i}${j}`
            if (DM_prompts[idx]){

            let expr = ce.parse(DM_prompts[idx]).N();
            if (expr){
                let mult = ce.parse(DM_prompts['mult']).N();
                console.log(`mult: ${mult}`);
                console.log("expr")
                console.log(expr.re)
                matrix[i][j] = multiply(complex(expr.re, expr.im), complex(mult.re, mult.im)) as Complex;
            }
            }
        }
        }
    })

    // $effect(()=> {
    //     for (let i =0; i < 2; i++) {
    //         for (let j =0; j < 2; j++) {
    //             DM_prompts[]
    //         }
    //     }
    // })

    const mathLiveConfig = {
        "smart-mode": 'true',
        "keypressSound": null,
        "defaultMode": "math",
        "menuItems": [],
        "math-virtual-keyboard-policy": "manual"
    }
</script>

<MathField bind:value={DM_latex}  bind:prompts={DM_prompts} read-only {mathLiveConfig} ></MathField>
