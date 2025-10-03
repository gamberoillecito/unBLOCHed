import { test, expect, describe, vi, beforeEach } from 'vitest';
import {
	MatrixParam,
} from '$lib/model/ModelUtility.svelte';
import { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
import { FancyMatrix } from '$lib/model/FancyMatrix.svelte';

// Mock Svelte features
vi.mock('svelte', () => ({
	getContext: vi.fn(() => ({ preventOpening: false })),
	$state: vi.fn((value) => value),
	$derived: vi.fn((fn) => (typeof fn === 'function' ? fn() : fn))
}));

// Mock MathLive
vi.mock('mathlive', () => ({
	convertLatexToMarkup: vi.fn((latex: string) => `<span>${latex}</span>`)
}));

describe('DynamicMatrix Logic', () => {
	let testMatrix: FancyMatrix;

	beforeEach(() => {
		testMatrix = new FancyMatrix(
			[
				['1', '0'],
				['0', '1']
			],
			'1',
			'TestMatrix'
		);
	});

	test('should create matrix with proper structure', () => {
		expect(testMatrix.mat).toHaveLength(2);
		expect(testMatrix.mat[0]).toHaveLength(2);
		expect(testMatrix.label).toBe('TestMatrix');
	});

	test('should handle matrix validation', () => {
		const validMatrix = testMatrix.mat;
		const result = testMatrix.validateMatrix(validMatrix);
		expect(result.isValid).toBe(true);
	});

	test('should handle density matrix creation', () => {
		const densityMatrix = new DensityMatrix(
			[
				['1', '0'],
				['0', '0']
			],
			'1',
			'ρ'
		);
		expect(densityMatrix.mat[0][0].re).toBeCloseTo(1);
		expect(densityMatrix.mat[1][1].re).toBeCloseTo(0);
	});

	test('should handle matrix parameters', () => {
		const param = new MatrixParam('theta', 'pi/2', '\\theta', true);
		expect(param.name).toBe('theta');
		expect(param.userEditable).toBe(true);
	});

	test('should handle complex matrix elements', () => {
		const complexMatrix = new FancyMatrix(
			[
				['1+i', '2-i'],
				['-i', '3']
			],
			'1',
			'Complex'
		);
		expect(complexMatrix.mat[0][1].im).toBeCloseTo(-1);
		expect(complexMatrix.mat[1][0].im).toBeCloseTo(-1);
	});

	test('should clone matrices correctly', () => {
		const cloned = testMatrix.clone();
		expect(cloned).not.toBe(testMatrix);
		expect(cloned.label).toBe(testMatrix.label);
	});
});
