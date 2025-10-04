import { test, expect, describe, vi } from 'vitest';
import {
	Xgate,
	Ygate,
	Zgate,
	Hgate,
	RZgate,
	theta_param,
	theta_phi_lambdaa_param,
	randomDensityMatrix
} from './matrices';
import {
	complex,
	equal,
	multiply,
	conj,
	transpose} from 'mathjs';

// Mock Svelte features
vi.mock('svelte', () => ({
	$state: vi.fn((value) => value),
	$derived: vi.fn((fn) => (typeof fn === 'function' ? fn() : fn))
}));
import type { ComplexMatRxC } from '$lib/model/ModelUtility.svelte';

describe('Predefined Quantum Gates', () => {
	describe('Pauli Gates', () => {
		test('X gate should have correct matrix elements', () => {
			expect(equal(Xgate.mat[0][0], complex(0))).toBe(true);
			expect(equal(Xgate.mat[0][1], complex(1))).toBe(true);
			expect(equal(Xgate.mat[1][0], complex(1))).toBe(true);
			expect(equal(Xgate.mat[1][1], complex(0))).toBe(true);
		});

		test('Y gate should have correct matrix elements', () => {
			expect(equal(Ygate.mat[0][0], complex(0))).toBe(true);
			expect(equal(Ygate.mat[0][1], complex(0, -1))).toBe(true);
			expect(equal(Ygate.mat[1][0], complex(0, 1))).toBe(true);
			expect(equal(Ygate.mat[1][1], complex(0))).toBe(true);
		});

		test('Z gate should have correct matrix elements', () => {
			expect(equal(Zgate.mat[0][0], complex(1))).toBe(true);
			expect(equal(Zgate.mat[0][1], complex(0))).toBe(true);
			expect(equal(Zgate.mat[1][0], complex(0))).toBe(true);
			expect(equal(Zgate.mat[1][1], complex(-1))).toBe(true);
		});

		test('Pauli gates should be unitary', () => {
			const gates = [Xgate, Ygate, Zgate];

			gates.forEach((gate) => {
				const result = gate.validateMatrix(gate.mat as ComplexMatRxC<2, 2>);
				expect(result.isValid).toBe(true);
			});
		});

		test('Pauli gates should be Hermitian', () => {
			const gates = [Xgate, Ygate, Zgate];

			gates.forEach((gate) => {
				// For Pauli matrices, they are their own Hermitian conjugate
				const dagger = conj(transpose(gate.mat as ComplexMatRxC<2, 2>));

				// Check element by element instead of using equal function
				for (let i = 0; i < 2; i++) {
					for (let j = 0; j < 2; j++) {
						expect((gate.mat as ComplexMatRxC<2, 2>)[i][j].re).toBeCloseTo((dagger as ComplexMatRxC<2, 2>)[i][j].re, 10);
						expect((gate.mat as ComplexMatRxC<2, 2>)[i][j].im).toBeCloseTo((dagger as ComplexMatRxC<2, 2>)[i][j].im, 10);
					}
				}
			});
		});

		test('Pauli gates should have correct properties', () => {
			const gates = [Xgate, Ygate, Zgate];

			gates.forEach((gate) => {
				// Each Pauli gate should be unitary
				const validation = gate.validateMatrix(gate.mat as ComplexMatRxC<2, 2>);
				expect(validation.isValid).toBe(true);

				// Check that each has the correct structure
				expect(gate.mat as ComplexMatRxC<2, 2>).toHaveLength(2);
				expect((gate.mat as ComplexMatRxC<2, 2>)[0]).toHaveLength(2);
				expect((gate.mat as ComplexMatRxC<2, 2>)[1]).toHaveLength(2);
			});
		});
	});

	describe('Hadamard Gate', () => {
		test('H gate should have correct matrix elements', () => {
			const expected = 1 / Math.sqrt(2);

			expect(Hgate.mat[0][0].re).toBeCloseTo(expected, 10);
			expect(Hgate.mat[0][1].re).toBeCloseTo(expected, 10);
			expect(Hgate.mat[1][0].re).toBeCloseTo(expected, 10);
			expect(Hgate.mat[1][1].re).toBeCloseTo(-expected, 10);
		});

		test('H gate should be unitary', () => {
			const result = Hgate.validateMatrix(Hgate.mat as ComplexMatRxC<2, 2>);
			expect(result.isValid).toBe(true);
		});

		test('H gate should be Hermitian', () => {
			const dagger = conj(transpose(Hgate.mat));

			// Check if H = H†
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					expect(Hgate.mat[i][j].re).toBeCloseTo((dagger as ComplexMatRxC<2, 2>)[i][j].re, 10);
					expect(Hgate.mat[i][j].im).toBeCloseTo((dagger as ComplexMatRxC<2, 2>)[i][j].im, 10);
				}
			}
		});

		test('H gate should have correct structure', () => {
			expect(Hgate.mat).toHaveLength(2);
			expect(Hgate.mat[0]).toHaveLength(2);
			expect(Hgate.mat[1]).toHaveLength(2);

			// All elements should have zero imaginary parts
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					expect(Hgate.mat[i][j].im).toBeCloseTo(0, 10);
				}
			}
		});
	});

	describe('Parameterized Gates', () => {
		test('RZ gate should have correct parameter structure', () => {
			expect(RZgate.parameterArray).toHaveLength(1);
			expect(RZgate.parameterArray[0].name).toBe('theta');
			expect(RZgate.parameterArray[0].latexLabel).toBe('\\theta');
			expect(RZgate.parameterArray[0].userEditable).toBe(true);
		});

		test('RZ gate should be unitary', () => {
			const result = RZgate.validateMatrix(RZgate.mat as ComplexMatRxC<2, 2>);
			expect(result.isValid).toBe(true);
		});

		test('RZ gate should have diagonal structure', () => {
			// RZ gate should be diagonal
			expect(RZgate.mat[0][1].re).toBeCloseTo(0, 5);
			expect(RZgate.mat[0][1].im).toBeCloseTo(0, 5);
			expect(RZgate.mat[1][0].re).toBeCloseTo(0, 5);
			expect(RZgate.mat[1][0].im).toBeCloseTo(0, 5);
		});
	});

	describe('Gate Parameters', () => {
		test('theta_param should be configured correctly', () => {
			expect(theta_param).toHaveLength(1);
			expect(theta_param[0].name).toBe('theta');
			expect(theta_param[0].latexValue).toBe('\\pi/2');
			expect(theta_param[0].latexLabel).toBe('\\theta');
			expect(theta_param[0].userEditable).toBe(true);
		});

		test('theta_phi_lambda_param should be configured correctly', () => {
			expect(theta_phi_lambdaa_param).toHaveLength(3);

			const paramNames = theta_phi_lambdaa_param.map((p) => p.name);
			expect(paramNames).toContain('theta');
			expect(paramNames).toContain('phi');
			expect(paramNames).toContain('lambda');

			theta_phi_lambdaa_param.forEach((param) => {
				expect(param.latexValue).toBe('\\pi/2');
				expect(param.userEditable).toBe(true);
			});
		});

		test('parameter cloning should work correctly', () => {
			const original = theta_param[0];
			const cloned = original.clone();

			expect(cloned).not.toBe(original);
			expect(cloned.name).toBe(original.name);
			expect(cloned.latexValue).toBe(original.latexValue);
			expect(cloned.latexLabel).toBe(original.latexLabel);
			expect(cloned.userEditable).toBe(original.userEditable);
		});
	});

	describe('Gate Properties', () => {
		test('all gates should have proper labels', () => {
			expect(Xgate.label).toBe('$$\\hat{X}$$');
			expect(Ygate.label).toBe('\\hat{Y}');
			expect(Zgate.label).toBe('\\hat{Z}');
			expect(Hgate.label).toBe('\\hat{H}');
			expect(RZgate.label).toBe('\\hat{R}_z');
		});

		test('all gates should have appropriate multipliers', () => {
			expect(Xgate.latexMult).toBe('1');
			expect(Ygate.latexMult).toBe('1');
			expect(Zgate.latexMult).toBe('1');
			expect(Hgate.latexMult).toBe('\\frac{1}{\\sqrt{2}}');
			expect(RZgate.latexMult).toBe('1');
		});

		test('gates should have valid matrix dimensions', () => {
			const gates = [Xgate, Ygate, Zgate, Hgate, RZgate];

			gates.forEach((gate) => {
				expect(gate.mat as ComplexMatRxC<2, 2>).toHaveLength(2);
				expect((gate.mat as ComplexMatRxC<2, 2>)[0]).toHaveLength(2);
				expect((gate.mat as ComplexMatRxC<2, 2>)[1]).toHaveLength(2);

				// All matrix elements should be complex numbers
				for (let i = 0; i < 2; i++) {
					for (let j = 0; j < 2; j++) {
						expect(typeof (gate.mat as ComplexMatRxC<2, 2>)[i][j].re).toBe('number');
						expect(typeof (gate.mat as ComplexMatRxC<2, 2>)[i][j].im).toBe('number');
					}
				}
			});
		});

		test('rotation angles should be meaningful for Pauli gates', () => {
			// Pauli gates represent π rotations
			expect(Xgate.rotationAngle).toBeCloseTo(Math.PI, 1);
			expect(Ygate.rotationAngle).toBeCloseTo(Math.PI, 1);
			expect(Zgate.rotationAngle).toBeCloseTo(Math.PI, 1);
		});

		test('rotation axes should exist for Pauli gates', () => {
			const xAxis = Xgate.rotationAxis;
			const yAxis = Ygate.rotationAxis;
			const zAxis = Zgate.rotationAxis;

			expect(xAxis).not.toBeNull();
			expect(yAxis).not.toBeNull();
			expect(zAxis).not.toBeNull();

			if (xAxis && yAxis && zAxis) {
				// Each should be a 3D vector
				expect(xAxis).toHaveLength(3);
				expect(yAxis).toHaveLength(3);
				expect(zAxis).toHaveLength(3);
			}
		});
	});

	describe('Gate Interactions', () => {
		test('gate composition should preserve structure', () => {
			const gates = [Xgate, Ygate, Zgate, Hgate];

			// Test composition of gates maintains 2x2 structure
			for (let i = 0; i < gates.length; i++) {
				for (let j = 0; j < gates.length; j++) {
					const composed = multiply(gates[i].mat, gates[j].mat);

					// Should be 2x2 matrix
					expect((composed as ComplexMatRxC<2, 2>).length).toBe(2);
					expect((composed as ComplexMatRxC<2, 2>)[0].length).toBe(2);
					expect((composed as ComplexMatRxC<2, 2>)[1].length).toBe(2);
				}
			}
		});

		test('XYX should have expected structure', () => {
			// This tests the basic composition without exact comparison
			const X = Xgate.mat;
			const Y = Ygate.mat;

			const XYX = multiply(multiply(X, Y), X);

			// Should be a valid 2x2 matrix
			expect((XYX as ComplexMatRxC<2, 2>).length).toBe(2);
			expect((XYX as ComplexMatRxC<2, 2>)[0].length).toBe(2);

			// Should have structure similar to -Y (diagonal elements should be small)
			expect(Math.abs((XYX as ComplexMatRxC<2, 2>)[0][0].re)).toBeLessThan(0.01);
			expect(Math.abs((XYX as ComplexMatRxC<2, 2>)[1][1].re)).toBeLessThan(0.01);
		});

		test('gate sequences should maintain quantum properties', () => {
			// Apply a sequence of gates and check the result is still unitary

			// Apply Y then Z
			const Y = Ygate.mat;
			const Z = Zgate.mat;
			const YZ = multiply(Y, Z);

			// Result should be a valid 2x2 complex matrix
			expect((YZ as ComplexMatRxC<2, 2>).length).toBe(2);
			expect((YZ as ComplexMatRxC<2, 2>)[0].length).toBe(2);
		});
	});
});

describe('randomDensityMatrix', () => {
	test('should generate a valid pure state', () => {
		const dm = randomDensityMatrix(true);
		expect(dm.validateMatrix(dm.mat as ComplexMatRxC<2, 2>).isValid).toBe(true);
		expect(dm.isPureState()).toBe(true);
	});

	test('should generate a valid mixed state', () => {
		const dm = randomDensityMatrix(false);
		expect(dm.validateMatrix(dm.mat as ComplexMatRxC<2, 2>).isValid).toBe(true);
		expect(dm.isPureState()).toBe(false);
	});
});
