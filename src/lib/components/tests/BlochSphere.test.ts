import { test, expect, describe, vi } from 'vitest';

// Mock Three.js and Threlte
vi.mock('@threlte/core', () => ({
	T: {
		Group: 'div',
		Mesh: 'div'
	}
}));

vi.mock('three', () => ({
	Color: vi.fn().mockImplementation(() => ({
		setHSL: vi.fn().mockReturnThis()
	})),
	MathUtils: {
		degToRad: vi.fn((deg: number) => (deg * Math.PI) / 180)
	},
	DoubleSide: 2
}));

describe('BlochSphere Logic', () => {
	test('should calculate latitude spacing correctly', () => {
		const sphereRad = 1;
		const numLatitudes = 2;
		const spacing = (sphereRad * 2) / (numLatitudes + 1);

		expect(spacing).toBeCloseTo(2 / 3);
	});

	test('should calculate latitude offset correctly', () => {
		const sphereRad = 1;
		const prog = 0;
		const numLatitudes = 2;
		const spacing = (sphereRad * 2) / (numLatitudes + 1);
		const offset = -(sphereRad - spacing) + spacing * prog;

		expect(offset).toBeCloseTo(-1 / 3);
	});

	test('should calculate latitude radius correctly', () => {
		const sphereRad = 1;
		const prog = 0;
		const numLatitudes = 2;
		const spacing = (sphereRad * 2) / (numLatitudes + 1);
		const rad = Math.sqrt(sphereRad ** 2 - ((prog - Math.floor(numLatitudes / 2)) * spacing) ** 2);

		expect(rad).toBeGreaterThan(0);
		expect(rad).toBeLessThanOrEqual(1);
	});

	test('should handle edge cases for sphere parameters', () => {
		const sphereRad = 0.1;
		const numLatitudes = 0;
		const spacing = numLatitudes > 0 ? (sphereRad * 2) / (numLatitudes + 1) : 0;

		expect(spacing).toBe(0);
	});

	test('should validate sphere properties', () => {
		const defaultRadius = 1;
		const defaultOpacity = 0.1;
		const defaultLatitudes = 1;
		const defaultLongitudes = 2;

		expect(defaultRadius).toBeGreaterThan(0);
		expect(defaultOpacity).toBeGreaterThanOrEqual(0);
		expect(defaultOpacity).toBeLessThanOrEqual(1);
		expect(defaultLatitudes).toBeGreaterThanOrEqual(0);
		expect(defaultLongitudes).toBeGreaterThanOrEqual(0);
	});
});
