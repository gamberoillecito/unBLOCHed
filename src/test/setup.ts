import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Svelte runtime for testing
vi.mock('svelte', async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		$state: vi.fn((value) => value),
		$derived: vi.fn((fn) => (typeof fn === 'function' ? fn() : fn)),
		getContext: vi.fn(() => ({ preventOpening: false })),
		onMount: vi.fn((fn) => fn()),
		mount: vi.fn()
	};
});

// Mock MathLive for testing
vi.mock('mathlive', () => ({
	convertLatexToMarkup: vi.fn((latex: string) => `<span>${latex}</span>`)
}));

// Mock Threlte components for 3D testing
vi.mock('@threlte/core', () => ({
	T: {
		Group: 'div',
		Mesh: 'div'
	}
}));

// Mock Three.js objects
vi.mock('three', () => ({
	Color: vi.fn().mockImplementation(() => ({
		setHSL: vi.fn().mockReturnThis()
	})),
	MathUtils: {
		degToRad: vi.fn((deg: number) => (deg * Math.PI) / 180)
	},
	DoubleSide: 2
}));
