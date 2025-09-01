import type { DensityMatrix } from "$lib/components/Model.svelte";
import { BlochHistory } from "$lib/components/BlochHistory.svelte";
import { GateMatrix } from "$lib/components/Model.svelte";

export interface TutorialPageProps {
    DM: DensityMatrix;
    history: BlochHistory;
    canvasContainer: HTMLDivElement;
}