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
	    // Listen globally for mouseup and mousemove
	    window.addEventListener('mousemove', handleMouseMove);
	    window.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseUp() {
	    isDragging = false;
	    // Remove global listeners
	    window.removeEventListener('mousemove', handleMouseMove);
	    window.removeEventListener('mouseup', handleMouseUp);
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

	function handleScroll(e: WheelEvent) {
		const lengthStep = 0.01;
		DM.length += -Math.sign(e.deltaY) * lengthStep;
	}

	$effect(() => {
    const btn = document.getElementById('joystick-btn');
    if (isDragging) {
        document.body.style.cursor = "grabbing";
        if (btn) btn.style.cursor = "grabbing";
    } else {
        document.body.style.cursor = "";
        if (btn) btn.style.cursor = "grab";
    }
});
</script>

<button
	id="joystick-btn"
	class="w-[300px] h-[300px] border-2 rounded-md"
	onmousedown={handleMouseDown}
	onwheel={handleScroll}
	aria-label="sphere-controls"
>
</button>