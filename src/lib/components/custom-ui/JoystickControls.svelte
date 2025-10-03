<script lang="ts">
	import type { FakeDensityMatrix } from '$lib/model/DensityMatrix.svelte';
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

	let isDragging = $state(false);
	let lastX = $state(0);
	let lastY = $state(0);

	// NEW: RAF batching state
	let pendingDx = 0;
	let pendingDy = 0;
	let rafScheduled = false;
	let rafId: number | null = null;

	function scheduleApply() {
		if (rafScheduled) return;
		rafScheduled = true;
		rafId = requestAnimationFrame(() => {
			rafScheduled = false;
			rafId = null;
			// apply accumulated movement once per frame
			if (pendingDx !== 0 || pendingDy !== 0) {
				applyDelta(pendingDx, pendingDy);
				pendingDx = 0;
				pendingDy = 0;
			}
		});
	}

	// replace moveDrag with incremental accumulation + RAF scheduling
	function moveDrag(x: number, y: number) {
		if (!isDragging) return;
		// accumulate incremental deltas, update last positions for next event
		const dx = x - lastX;
		const dy = y - lastY;
		pendingDx += dx;
		pendingDy += dy;
		lastX = x;
		lastY = y;
		scheduleApply();
	}

	function endDrag() {
		isDragging = false;
		// flush pending and cancel RAF
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
			rafScheduled = false;
		}
		// apply any remaining small delta immediately
		if (pendingDx !== 0 || pendingDy !== 0) {
			applyDelta(pendingDx, pendingDy);
			pendingDx = 0;
			pendingDy = 0;
		}
		// remove listeners
		window.removeEventListener('mousemove', onWindowMouseMove);
		window.removeEventListener('mouseup', onWindowMouseUp);
		window.removeEventListener('touchmove', onWindowTouchMove);
		window.removeEventListener('touchend', onWindowTouchEnd);
	}

	// mouse handlers (wrap the unified functions)
	function handleMouseDown(e: MouseEvent) {
		// left button only
		if (e.button !== 0) return;
		startDrag(e.clientX, e.clientY);
	}

	function onWindowMouseMove(e: MouseEvent) {
		moveDrag(e.clientX, e.clientY);
	}

	function onWindowMouseUp(_: MouseEvent) {
		endDrag();
	}

	// touch handlers
	function handleTouchStart(e: TouchEvent) {
		if (!e.touches || e.touches.length === 0) return;
		// prevent scrolling while interacting
		e.preventDefault();
		const t = e.touches[0];
		startDrag(t.clientX, t.clientY);
	}

	function onWindowTouchMove(e: TouchEvent) {
		// prevent default to avoid page scroll during drag
		if (e.cancelable) e.preventDefault();
		const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
		if (!t) return;
		moveDrag(t.clientX, t.clientY);
	}

	function onWindowTouchEnd(_: TouchEvent) {
		endDrag();
	}

	function handleMouseMove(e: MouseEvent) {
		// kept for compatibility (if any local listeners call it)
		if (!isDragging) return;
		moveDrag(e.clientX, e.clientY);
	}

	function handleMouseUp() {
		endDrag();
	}

	function handleScroll(e: WheelEvent) {
		const lengthStep = 0.01;
		DM.length += -Math.sign(e.deltaY) * lengthStep;
	}

	function handleKeys(e: KeyboardEvent) {
		if (!joystickMode) return;

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

	// helper used elsewhere in file (kept, no change)
	function applyDelta(dx: number, dy: number) {
		const thetaStep = 0.01;
		const phiStep = 0.01;
		DM.theta = DM.theta - dy * thetaStep;
		DM.phi = (DM.phi + dx * phiStep) % (2 * Math.PI);
	}

	function startDrag(x: number, y: number) {
		// initialize dragging state and RAF batching
		isDragging = true;
		lastX = x;
		lastY = y;

		// reset any pending accumulated movement so we start fresh
		pendingDx = 0;
		pendingDy = 0;
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
			rafScheduled = false;
		}

		// add global listeners (mouse + touch)
		window.addEventListener('mousemove', onWindowMouseMove);
		window.addEventListener('mouseup', onWindowMouseUp);
		window.addEventListener('touchmove', onWindowTouchMove, { passive: false });
		window.addEventListener('touchend', onWindowTouchEnd);
	}
</script>

<div class="flex flex-col items-center gap-2">
	<button
		id="joystick-btn"
		class="grid aspect-square w-[300px] grid-cols-3 grid-rows-3 place-content-center place-items-center items-center rounded-[1em] border-2 @lg:h-[200px] @lg:w-[200px]"
		onmousedown={handleMouseDown}
		ontouchstart={handleTouchStart}
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

	<div class="hidden flex-col @lg:flex">
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
				<p>WASD / Arrows / +-</p>
			</div>
		</div>
	</div>
</div>
<!-- <div class="grid grid-cols-3 grid-rows-2 justify-center">
	<MoveUp class="col-start-2 col-span-2 place-content-center items-center justify-center keyboard-key"/>
	<MoveLeft class="keyboard-key"/> <MoveDown class="translate-y-[0.2rem]"/> <MoveRight class="keyboard-key"/>
</div> -->
