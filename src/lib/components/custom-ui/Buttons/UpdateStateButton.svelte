<script lang="ts">
    import type { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
    import { BlochHistory } from '$lib/model/BlochHistory.svelte';
    import { marked } from 'marked';
    import markedKatex from 'marked-katex-extension';
    import MatrixInfoInput from '$lib/components/custom-ui/MatrixInfoInput.svelte';
    import LatexButton from './LatexButton.svelte';
    import { flashCanvas } from './buttonUtility';

    const markedKatexOptions = {
        throwOnError: false
    };
    marked.use(markedKatex(markedKatexOptions));

    interface Props {
        DM: DensityMatrix;
        history: BlochHistory;
        matrix: DensityMatrix;
        disabled?: boolean;
        canvasContainer: HTMLDivElement;
        secondaryButton?: boolean;
        size?: 'default' | 'small';
    }
    let {
        DM,
        history,
        matrix,
        disabled = false,
        canvasContainer,
        secondaryButton = true,
        size = 'default'
    }: Props = $props();
</script>

<!--
@component
A button that updates the main density matrix to a new state described by `matrix`. It consists of a primary action button and an optional secondary button to view the matrix info.

**Props:**
- `DM: DensityMatrix` - The main reactive `DensityMatrix` to be updated.
- `history: BlochHistory` - The history object to log the state change.
- `matrix: DensityMatrix` - The predefined `DensityMatrix` representing the state to apply.
- `disabled?: boolean` (default: `false`) - If `true`, the button is disabled.
- `canvasContainer: HTMLDivElement` - A reference to the canvas container element, which is flashed upon click.
- `secondaryButton?: boolean` (default: `true`) - If `true`, shows the `MatrixInfoInput` button next to the main button.
- `size?: 'default' | 'small'` (default: `'default'`) - The size of the button.
-->

<div class="inline-flex w-fit gap-0">
    <LatexButton
        onclick={() => {
            history.addElement(DM, matrix);
            const res =DM.setMatrixFromLatex(matrix.latexMat, matrix.latexMult);
            if (!res.isValid){
                console.error(res.message);
                
            }
            flashCanvas(canvasContainer);
        }}
        label={matrix.label}
        {disabled}
        round={secondaryButton ? 'left' : 'full'}
        {size}
    />
    {#if secondaryButton}
        <MatrixInfoInput {matrix}></MatrixInfoInput>
    {/if}
</div>
