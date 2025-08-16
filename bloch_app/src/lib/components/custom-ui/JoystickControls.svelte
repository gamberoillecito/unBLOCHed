<script lang="ts">
	import type { FakeDensityMatrix } from "../Model.svelte";


    interface Props {
        DM: FakeDensityMatrix;
    }

    let {
        DM,
    }: Props = $props();

    let isDragging = $state(false);
	let lastX = $state(0);
	let lastY = $state(0);

	function handleMouseDown(e: MouseEvent) {
	    isDragging = true;
	    lastX = e.clientX;
	    lastY = e.clientY;
	}

	function handleMouseUp() {
	    isDragging = false;
	}

	function handleMouseMove(e: MouseEvent) {
	    if (!isDragging) return;
	    const dx = e.clientX - lastX;
	    const dy = e.clientY - lastY;

	    // Sensitivity factors (adjust as needed)
	    const thetaStep = 0.01;
	    const phiStep = 0.01;

	    DM.theta = DM.theta - dy * thetaStep;
	    DM.phi = (DM.phi + dx * phiStep) % (2 * Math.PI);

	    lastX = e.clientX;
	    lastY = e.clientY;
	}
</script>

<div
    class="w-[600px] h-[600px] border-2"
    onmousedown={handleMouseDown}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
    onmousemove={handleMouseMove}
>
</div>