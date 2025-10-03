import type { DensityMatrix } from "$lib/model/Model.svelte";
import { BlochHistory } from "$lib/components/BlochHistory.svelte";
import { GateMatrix } from "$lib/model/Model.svelte";

export interface TutorialPageProps {
    DM: DensityMatrix;
    history: BlochHistory;
    canvasContainer: HTMLDivElement;
}