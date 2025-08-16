<script lang="ts">
	import type { FakeDensityMatrix } from '../Model.svelte';
	import { convertLatexToMarkup } from 'mathlive';
	import Hand from '@lucide/svelte/icons/hand';
	import MoveUp from '@lucide/svelte/icons/move-up';
	import MoveUpRight from '@lucide/svelte/icons/move-up-right';
	import MoveUpLeft from '@lucide/svelte/icons/move-up-left';
	import MoveDown from '@lucide/svelte/icons/move-down';
	import MoveDownRight from '@lucide/svelte/icons/move-down-right';
	import MoveRight from '@lucide/svelte/icons/move-right';
	import MoveLeft from '@lucide/svelte/icons/move-left';
	import Mouse from '@lucide/svelte/icons/mouse';
	import MoveDownLeft from '@lucide/svelte/icons/move-down-left';
	import Keyboard from '@lucide/svelte/icons/keyboard';
	import Label from '../ui/label/label.svelte';
	import { onMount } from 'svelte';
	import Separator from '../ui/separator/separator.svelte';
	interface Props {
		DM: FakeDensityMatrix;
		joystickMode: boolean;
	}

	let { DM, joystickMode = $bindable() }: Props = $props();

	$inspect(joystickMode);
	let isDragging = $state(false);
	let lastX = $state(0);
	let lastY = $state(0);
	const avgEventsOld = 40;
	let oldCounter = 0;

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

	function handleKeys(e: KeyboardEvent) {
		if (!joystickMode) return;

		console.log(e.key);
		const thetaStep = 0.1;
		const phiStep = 0.1;
		const lenStep = 0.1;

		switch (e.key) {
			case 'w':
			case 'ArrowUp':
				DM.theta += thetaStep;
				break;
			case 's':
			case 'ArrowDown':
				DM.theta -= thetaStep;
				break;
			case 'a':
			case 'ArrowLeft':
				DM.phi -= phiStep;
				break;
			case 'd':
			case 'ArrowRight':
				DM.phi += phiStep;
				break;
			case 'm':
			case '-':
				DM.length -= lenStep;
				break;
			case 'p':
			case '=':
			case '+':
				DM.length += lenStep;
				break;
			default:
				break;
		}
	}

	$effect(() => {
		const btn = document.getElementById('joystick-btn');
		if (isDragging) {
			document.body.style.cursor = 'grabbing';
			if (btn) btn.style.cursor = 'grabbing';
		} else {
			document.body.style.cursor = '';
			if (btn) btn.style.cursor = 'grab';
		}
	});
	document.addEventListener('keydown', handleKeys);
</script>

<div class="flex flex-col items-center gap-2">
	<button
		id="joystick-btn"
		class="grid w-[300px] aspect-square @lg:h-[200px] @lg:w-[200px] grid-cols-3 grid-rows-3 place-content-center place-items-center items-center rounded-[1em] border-2"
		onmousedown={handleMouseDown}
		onwheel={handleScroll}
		aria-label="sphere-controls"
	>
		<MoveUpLeft class="opacity-40" />
		<div>
			<MoveUp />
			<p class="pointer-events-none">{@html convertLatexToMarkup('\\mathbf{\\theta -}')}</p>
		</div>
		<MoveUpRight class="opacity-40" />
		<div class="grid grid-cols-2 gap-2">
			<MoveLeft />
			<p class="pointer-events-none">{@html convertLatexToMarkup('\\mathbf{\\varphi -}')}</p>
		</div>
		<div></div>
		<div class="grid grid-cols-2 gap-2">
			<p class="pointer-events-none">{@html convertLatexToMarkup('\\mathbf{\\varphi +}')}</p>
			<MoveRight />
		</div>
		<MoveDownLeft class="opacity-40" />
		<div>
			<p class="pointer-events-none">{@html convertLatexToMarkup('\\mathbf{\\theta +}')}</p>
			<MoveDown />
		</div>
		<MoveDownRight class="opacity-40" />
	</button>

	<div class="@lg:flex hidden flex-col">
		<Label for="joystick-button">
			<div class="flex flex-col gap-2">
				<p class="flex flex-row items-center gap-1">
					<Mouse /> Scroll: length
				</p>
				<p class="flex flex-row items-center gap-1">
					<Hand /> Drag: angles
				</p>

				<p class="flex flex-row items-center gap-1"></p>
			</div>
		</Label>
		<Separator />
		<div class="flex-cols flex gap-2">
			<Keyboard />
			<div class="grid">
				<p>WASD / Arrows</p>
			</div>
		</div>
	</div>
</div>
<!-- <div class="grid grid-cols-3 grid-rows-2 justify-center">
	<MoveUp class="col-start-2 col-span-2 place-content-center items-center justify-center keyboard-key"/>
	<MoveLeft class="keyboard-key"/> <MoveDown class="translate-y-[0.2rem]"/> <MoveRight class="keyboard-key"/>
</div> -->
