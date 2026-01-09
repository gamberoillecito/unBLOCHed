import type { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
import { BlochHistory } from "$lib/model/BlochHistory.svelte";
import { GateMatrix } from '$lib/model/GateMatrix.svelte';

export interface TutorialPageProps {
    DM: DensityMatrix;
    history: BlochHistory;
    canvasContainer: HTMLDivElement;
}