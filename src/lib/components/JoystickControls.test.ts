import { test, expect, describe, vi, beforeEach } from 'vitest';
import { FakeDensityMatrix } from './Model.svelte';

// Mock Svelte features
vi.mock('svelte', () => ({
	onMount: vi.fn((fn) => fn()),
	$state: vi.fn((value) => value),
	$derived: vi.fn((fn) => (typeof fn === 'function' ? fn() : fn))
}));

describe('JoystickControls Logic', () => {
	let testDM: FakeDensityMatrix;

	beforeEach(() => {
		testDM = new FakeDensityMatrix(0, 0, 1);

		// Mock requestAnimationFrame
		global.requestAnimationFrame = vi.fn((callback) => {
			callback(0);
			return 0;
		});
	});

	test('should create FakeDensityMatrix with correct initial values', () => {
		expect(testDM.phi).toBe(0);
		expect(testDM.theta).toBe(0);
		expect(testDM.length).toBe(1);
	});

	test('should update phi correctly', () => {
		testDM.phi = Math.PI;
		expect(testDM.phi).toBeCloseTo(Math.PI);
	});

	test('should update theta correctly', () => {
		testDM.theta = Math.PI / 2;
		expect(testDM.theta).toBeCloseTo(Math.PI / 2);
	});

	test('should handle phi wrapping', () => {
		testDM.phi = 3 * Math.PI;
		expect(testDM.phi).toBeCloseTo(Math.PI);
	});

	test('should handle length clamping', () => {
		testDM.length = 1.5;
		expect(testDM.length).toBe(1);

		testDM.length = -0.5;
		expect(testDM.length).toBe(0);
	});

	test('should calculate Bloch vector correctly', () => {
		const blochV = testDM.blochV;
		expect(blochV).toHaveLength(3);
		expect(typeof blochV[0]).toBe('number');
		expect(typeof blochV[1]).toBe('number');
		expect(typeof blochV[2]).toBe('number');
	});

	test('should handle coordinate updates', () => {
		const initialPhi = testDM.phi;
		const initialTheta = testDM.theta;

		testDM.phi = Math.PI / 4;
		testDM.theta = Math.PI / 3;

		expect(testDM.phi).not.toBe(initialPhi);
		expect(testDM.theta).not.toBe(initialTheta);
	});

	test('should maintain valid Bloch vector length', () => {
		testDM.phi = Math.PI / 2;
		testDM.theta = Math.PI / 4;
		testDM.length = 0.8;

		const blochV = testDM.blochV;
		const length = Math.sqrt(blochV[0] ** 2 + blochV[1] ** 2 + blochV[2] ** 2);
		expect(length).toBeCloseTo(0.8, 1);
	});
});
