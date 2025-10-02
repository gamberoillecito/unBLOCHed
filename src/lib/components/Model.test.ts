import { test, expect, describe, vi } from 'vitest';
import {
	FancyMatrix,
	DensityMatrix,
	GateMatrix,
	FakeDensityMatrix,
	MatrixParam,
	GatePath,
	print_mat,
	type ComplexMat,
	type ComplexMatRxC
} from './Model.svelte';
import { complex, identity, multiply, conj, transpose, equal } from 'mathjs';

// Mock $state and $derived for Svelte testing
vi.mock('svelte', () => ({
	$state: vi.fn((value) => value),
	$derived: vi.fn((fn) => (typeof fn === 'function' ? fn() : fn))
}));

describe('MatrixParam', () => {
	test('should create MatrixParam correctly', () => {
		const param = new MatrixParam('theta', '\\pi/2', '\\theta', true);

		expect(param.name).toBe('theta');
		expect(param.latexValue).toBe('\\pi/2');
		expect(param.latexLabel).toBe('\\theta');
		expect(param.userEditable).toBe(true);
	});

	test('should clone MatrixParam correctly', () => {
		const param = new MatrixParam('phi', '\\pi/4', '\\phi', false);
		const cloned = param.clone();

		expect(cloned).not.toBe(param);
		expect(cloned.name).toBe(param.name);
		expect(cloned.latexValue).toBe(param.latexValue);
		expect(cloned.latexLabel).toBe(param.latexLabel);
		expect(cloned.userEditable).toBe(param.userEditable);
	});
});

describe('FancyMatrix', () => {
	test('should create valid identity matrix', () => {
		const latexMat = [
			['1', '0'],
			['0', '1']
		];
		const fm = new FancyMatrix(latexMat, '1', 'I');

		expect(fm.mat[0][0]).toStrictEqual(complex(1, 0));
		expect(fm.mat[0][1]).toStrictEqual(complex(0, 0));
		expect(fm.mat[1][0]).toStrictEqual(complex(0, 0));
		expect(fm.mat[1][1]).toStrictEqual(complex(1, 0));
	});

	test('should handle complex numbers correctly', () => {
		const latexMat = [
			['1', 'i'],
			['0', '2+i']
		];
		const fm = new FancyMatrix(latexMat, '1', 'test');

		expect(fm.mat[0][1]).toStrictEqual(complex(0, 1));
		expect(fm.mat[1][1]).toStrictEqual(complex(2, 1));
	});

	test('should validate matrix correctly', () => {
		const validMat: ComplexMatRxC<2,2> = [
			[complex(1), complex(0)],
			[complex(0), complex(1)]
		];
		const fm = new FancyMatrix(
			[
				['1', '0'],
				['0', '1']
			],
			'1',
			'test'
		);

		const result = fm.validateMatrix(validMat);
		expect(result.isValid).toBe(true);
	});

	test('should reject invalid matrix with infinity', () => {
		const fm = new FancyMatrix(
			[
				['1', '0'],
				['0', '1']
			],
			'1',
			'test'
		);
		const invalidMat: ComplexMatRxC<2,2>  = [
			[complex(Infinity), complex(0)],
			[complex(0), complex(1)]
		];

		const result = fm.validateMatrix(invalidMat);
		expect(result.isValid).toBe(false);
		expect(result.message).toBe('Invalid input');
	});

	test('should set matrix value correctly', () => {
		const fm = new FancyMatrix(
			[
				['0', '0'],
				['0', '0']
			],
			'1',
			'test'
		);
		const newMat: ComplexMatRxC<2,2>  = [
			[complex(1), complex(2)],
			[complex(3), complex(4)]
		];

		const result = fm.setMatrixValue(newMat);
		expect(result.isValid).toBe(true);
		expect(fm.mat[0][0]).toStrictEqual(complex(1));
		expect(fm.mat[1][1]).toStrictEqual(complex(4));
	});

	test('should set individual value correctly', () => {
		const fm = new FancyMatrix(
			[
				['1', '0'],
				['0', '1']
			],
			'1',
			'test'
		);
		const result = fm.setValue(complex(5), 0, 1);

		expect(result.isValid).toBe(true);
		expect(fm.mat[0][1]).toStrictEqual(complex(5));
	});

	test('should handle parameters correctly', () => {
		const param = new MatrixParam('theta', '\\pi/2', '\\theta', true);
		const fm = new FancyMatrix(
			[
				['cos(theta)', '0'],
				['0', '1']
			],
			'1',
			'test',
			[param]
		);

		expect(fm.parameterArray).toHaveLength(1);
		expect(fm.parameterArray[0].name).toBe('theta');
	});

	test('should clone correctly', () => {
		const fm = new FancyMatrix(
			[
				['1', 'i'],
				['0', '1']
			],
			'2',
			'original'
		);
		const cloned = fm.clone();

		expect(cloned).not.toBe(fm);
		expect(cloned.label).toBe('original');
		expect(cloned.latexMult).toBe('2');
		expect(equal(cloned.mat[0][1], fm.mat[0][1])).toBe(true);
	});

	test('should handle latex multiplier correctly', () => {
		const fm = new FancyMatrix(
			[
				['1', '0'],
				['0', '1']
			],
			'2',
			'test'
		);

		expect(fm.mat[0][0]).toStrictEqual(complex(2, 0));
		expect(fm.mat[1][1]).toStrictEqual(complex(2, 0));
	});
});

describe('DensityMatrix', () => {
	test('should create valid pure state density matrix', () => {
		const dm = new DensityMatrix(
			[
				['1', '0'],
				['0', '0']
			],
			'1',
			'ρ'
		);

		expect(dm.mat[0][0]).toStrictEqual(complex(1, 0));
		expect(dm.mat[1][1]).toStrictEqual(complex(0, 0));
	});

	test('should validate trace = 1 requirement', () => {
		const dm = new DensityMatrix(
			[
				['0.5', '0'],
				['0', '0.5']
			],
			'1',
			'ρ'
		);
		const validResult = dm.validateMatrix(dm.mat as ComplexMatRxC<2, 2>);

		expect(validResult.isValid).toBe(true);
	});

	test('should reject matrix with trace ≠ 1', () => {
		const dm = new DensityMatrix(
			[
				['1', '0'],
				['0', '0']
			],
			'1',
			'ρ'
		);
		const invalidMat: ComplexMatRxC<2,2>  = [
			[complex(2), complex(0)],
			[complex(0), complex(0)]
		];

		const result = dm.validateMatrix(invalidMat);
		expect(result.isValid).toBe(false);
	});

	test('should reject non-Hermitian matrix', () => {
		const dm = new DensityMatrix(
			[
				['1', '0'],
				['0', '0']
			],
			'1',
			'ρ'
		);
		const nonHermitian: ComplexMatRxC<2,2>  = [
			[complex(0.5), complex(1)],
			[complex(0), complex(0.5)]
		];

		const result = dm.validateMatrix(nonHermitian);
		expect(result.isValid).toBe(false);
		expect(result.message).toBe('Not Hermitian');
	});

	test('should calculate Bloch vector correctly for |0⟩ state', () => {
		const dm = new DensityMatrix(
			[
				['1', '0'],
				['0', '0']
			],
			'1',
			'ρ'
		);
		const blochV = dm.blochV;

		expect(blochV[0]).toBeCloseTo(0); // x
		expect(blochV[1]).toBeCloseTo(0); // y 
		expect(blochV[2]).toBeCloseTo(1); // z 
	});

	test('should calculate Bloch vector correctly for |1⟩ state', () => {
		const dm = new DensityMatrix(
			[
				['0', '0'],
				['0', '1']
			],
			'1',
			'ρ'
		);
		const blochV = dm.blochV;

		expect(blochV[0]).toBeCloseTo(0); // x
		expect(blochV[1]).toBeCloseTo(0); // y
		expect(blochV[2]).toBeCloseTo(-1); // z
	});

	test('should detect pure state correctly', () => {
		const pureDM = new DensityMatrix(
			[
				['1', '0'],
				['0', '0']
			],
			'1',
			'ρ'
		);
		expect(pureDM.isPureState()).toBe(true);
	});

	test('should detect mixed state correctly', () => {
		const mixedDM = new DensityMatrix(
			[
				['0.5', '0'],
				['0', '0.5']
			],
			'1',
			'ρ'
		);
		expect(mixedDM.isPureState()).toBe(false);
	});

	test('should apply gate correctly', () => {
		const dm = new DensityMatrix(
			[
				['1', '0'],
				['0', '0']
			],
			'1',
			'ρ'
		);
		const xGate = new GateMatrix(
			[
				['0', '1'],
				['1', '0']
			],
			'1',
			'X'
		);

		dm.apply_gate(xGate);

		// After X gate, |0⟩ becomes |1⟩
		expect(dm.mat[0][0]).toBeCloseTo(0);
		expect(dm.mat[1][1]).toBeCloseTo(1);
	});
});

describe('FakeDensityMatrix', () => {
	test('should create FakeDensityMatrix with correct initial values', () => {
		const fdm = new FakeDensityMatrix(0, 0, 1);

		expect(fdm.phi).toBe(0);
		expect(fdm.theta).toBe(0);
		expect(fdm.length).toBe(1);
	});

	test('should calculate Bloch vector correctly from spherical coordinates', () => {
		const fdm = new FakeDensityMatrix(0, 0, 1); // |0⟩ state
		const blochV = fdm.blochV;

		expect(blochV[0]).toBeCloseTo(0); // x
		expect(blochV[1]).toBeCloseTo(0); // y
		expect(blochV[2]).toBeCloseTo(1); // z
	});

	test('should handle phi modulo 2π correctly', () => {
		const fdm = new FakeDensityMatrix();
		fdm.phi = 3 * Math.PI;

		expect(fdm.phi).toBeCloseTo(Math.PI);
	});

	test('should handle theta modulo 2π correctly', () => {
		const fdm = new FakeDensityMatrix();
		fdm.theta = 3 * Math.PI;

		expect(fdm.theta).toBeCloseTo(Math.PI);
	});

	test('should clamp length between 0 and 1', () => {
		const fdm = new FakeDensityMatrix();
		fdm.length = 2;
		expect(fdm.length).toBe(1);

		fdm.length = -0.5;
		expect(fdm.length).toBe(0);
	});
});

describe('GateMatrix', () => {
	test('should create valid Pauli-X gate', () => {
		const xGate = new GateMatrix(
			[
				['0', '1'],
				['1', '0']
			],
			'1',
			'X'
		);

		expect(xGate.mat[0][0]).toStrictEqual(complex(0));
		expect(xGate.mat[0][1]).toStrictEqual(complex(1));
		expect(xGate.mat[1][0]).toStrictEqual(complex(1));
		expect(xGate.mat[1][1]).toStrictEqual(complex(0));
	});

	test('should validate unitarity correctly', () => {
		const xGate = new GateMatrix(
			[
				['0', '1'],
				['1', '0']
			],
			'1',
			'X'
		);
		const result = xGate.validateMatrix(xGate.mat as ComplexMatRxC<2, 2>);

		expect(result.isValid).toBe(true);
	});

	test('should reject non-unitary matrix', () => {
		const gate = new GateMatrix(
			[
				['1', '0'],
				['0', '1']
			],
			'1',
			'test'
		);
		const nonUnitary: ComplexMatRxC<2,2>  = [
			[complex(2), complex(0)],
			[complex(0), complex(1)]
		];

		const result = gate.validateMatrix(nonUnitary);
		expect(result.isValid).toBe(false);
		expect(result.message).toBe('Not unitary');
	});

	test('should calculate rotation angle for Pauli-X', () => {
		const xGate = new GateMatrix(
			[
				['0', '1'],
				['1', '0']
			],
			'1',
			'X'
		);
		const angle = xGate.rotationAngle;

		expect(angle).toBeCloseTo(Math.PI);
	});

	test('should calculate rotation axis for Pauli-X', () => {
		const xGate = new GateMatrix(
			[
				['0', '1'],
				['1', '0']
			],
			'1',
			'X'
		);
		const axis = xGate.rotationAxis;

		expect(axis).not.toBeNull();
		if (axis) {
			expect(Math.abs(axis[0])).toBeCloseTo(1); // x-axis rotation
			expect(Math.abs(axis[1])).toBeCloseTo(0);
			expect(Math.abs(axis[2])).toBeCloseTo(0);
		}
	});

	test('should handle identity gate (no rotation)', () => {
		const iGate = new GateMatrix(
			[
				['1', '0'],
				['0', '1']
			],
			'1',
			'I'
		);
		const axis = iGate.rotationAxis;

		expect(axis).toBeNull();
	});

	test('should create Hadamard gate correctly', () => {
		const hGate = new GateMatrix(
			[
				['1', '1'],
				['1', '-1']
			],
			'\\frac{1}{\\sqrt{2}}',
			'\\hat{H}'
		);

		// Check if it's approximately correct (accounting for normalization)
		const expected = 1 / Math.sqrt(2);
		expect(hGate.mat[0][0].re).toBeCloseTo(expected);
		expect(hGate.mat[1][1].re).toBeCloseTo(-expected);
	});

	test('should handle parameterized gates', () => {
		const param = new MatrixParam('theta', 'pi/2', '\\theta', true);
		const rzGate = new GateMatrix(
			[
				['exp(-i*theta/2)', '0'],
				['0', 'exp(i*theta/2)']
			],
			'1',
			'Rz',
			[param]
		);

		expect(rzGate.parameterArray).toHaveLength(1);
		expect(rzGate.parameterArray[0].name).toBe('theta');
	});
});

describe('GatePath', () => {
	test('should create GatePath correctly', () => {
		const startPoint: [number, number, number] = [0, 0, 1];
		const axis: [number, number, number] = [1, 0, 0];
		const angle = Math.PI;

		const path = new GatePath(startPoint, axis, angle);

		expect(path.startingPoint).toEqual(startPoint);
		expect(path.axis).toEqual(axis);
		expect(path.angle).toBe(angle);
	});
});

describe('Utility Functions', () => {
	test('print_mat should not throw', () => {
		const mat: ComplexMatRxC<2,2>  = [
			[complex(1), complex(0)],
			[complex(0), complex(1)]
		];

		expect(() => print_mat(mat)).not.toThrow();
	});
});

describe('Integration Tests', () => {
	test('should handle complete gate application workflow', () => {
		// Create initial |0⟩ state
		const dm = new DensityMatrix(
			[
				['1', '0'],
				['0', '0']
			],
			'1',
			'ρ'
		);
		expect(dm.blochV[2]).toBeCloseTo(1); // z-component = 1

		// Apply X gate (bit flip)
		const xGate = new GateMatrix(
			[
				['0', '1'],
				['1', '0']
			],
			'1',
			'X'
		);
		dm.apply_gate(xGate);
		expect(dm.blochV[2]).toBeCloseTo(-1); // now z-component = -1

		// Apply X gate again (should return to original)
		dm.apply_gate(xGate);
		expect(dm.blochV[2]).toBeCloseTo(1); // back to z-component = 1
	});

	test('should handle Hadamard gate on |0⟩ state', () => {
		const dm = new DensityMatrix(
			[
				['1', '0'],
				['0', '0']
			],
			'1',
			'ρ'
		);
		const hGate = new GateMatrix(
			[
				['1', '1'],
				['1', '-1']
			],
			'\\frac{1}{\\sqrt{2}}',
			'\\hat{H}'
		);

		dm.apply_gate(hGate);

		// After H gate, |0⟩ becomes (|0⟩ + |1⟩)/√2, so Bloch vector should be on x-axis
		const blochV = dm.blochV;
		expect(blochV[0]).toBeCloseTo(1); // x-component should be 1
		expect(blochV[1]).toBeCloseTo(0); // z-component should be 0
		expect(blochV[2]).toBeCloseTo(0); // y-component should be 0
	});

	test('should preserve quantum mechanics properties', () => {
		// Test that density matrices maintain trace = 1 under unitary evolution
		const dm = new DensityMatrix(
			[
				['0.6', '0.3'],
				['0.3', '0.4']
			],
			'1',
			'ρ'
		);
		const yGate = new GateMatrix(
			[
				['0', '-i'],
				['i', '0']
			],
			'1',
			'Y'
		);

		const initialTrace = dm.mat[0][0].re + dm.mat[1][1].re;
		expect(initialTrace).toBeCloseTo(1);

		dm.apply_gate(yGate);

		const finalTrace = dm.mat[0][0].re + dm.mat[1][1].re;
		expect(finalTrace).toBeCloseTo(1);
	});
});
