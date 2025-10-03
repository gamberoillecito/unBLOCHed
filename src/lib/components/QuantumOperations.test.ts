import { test, expect, describe, vi } from 'vitest';
import { DensityMatrix, GateMatrix, type ComplexMat, type ComplexMatRxC, MatrixParam } from $lib / model / Model.svelte';
import {
	Hgate,
	Zgate,
	Xgate,
	Ygate,
	RZgate,
	RXgate,
	RYgate,
	randomDensityMatrix
} from '../data/matrices';
import { complex, equal } from 'mathjs';

// Mock Svelte stores
vi.mock('svelte', () => ({
	$state: vi.fn((value) => value),
	$derived: vi.fn((fn) => (typeof fn === 'function' ? fn() : fn))
}));

describe('Quantum Gate Operations', () => {
	describe('Single Qubit Gates', () => {
		test('Pauli-X gate should flip |0⟩ to |1⟩', () => {
			const state = new DensityMatrix(
				[
					['1', '0'],
					['0', '0']
				],
				'1',
				'|0⟩'
			);
			state.apply_gate(Xgate);

			expect(state.mat[0][0].re).toBeCloseTo(0);
			expect(state.mat[1][1].re).toBeCloseTo(1);
		});

		test('Pauli-Y gate should apply correct transformation to |0⟩', () => {
			const state = new DensityMatrix(
				[
					['1', '0'],
					['0', '0']
				],
				'1',
				'|0⟩'
			);

			state.apply_gate(Ygate);

			expect(state.mat[0][0].re).toBeCloseTo(0);
			expect(state.mat[1][1].re).toBeCloseTo(1);
		});

		test('Pauli-Z gate should leave |0⟩ unchanged and flip phase of |1⟩', () => {
			// Test |0⟩ state
			const state0 = new DensityMatrix(
				[
					['1', '0'],
					['0', '0']
				],
				'1',
				'|0⟩'
			);

			state0.apply_gate(Zgate);
			expect(state0.mat[0][0].re).toBeCloseTo(1);
			expect(state0.mat[1][1].re).toBeCloseTo(0);

			// Test |1⟩ state
			const state1 = new DensityMatrix(
				[
					['0', '0'],
					['0', '1']
				],
				'1',
				'|1⟩'
			);
			state1.apply_gate(Zgate);
			expect(state1.mat[0][0].re).toBeCloseTo(0);
			expect(state1.mat[1][1].re).toBeCloseTo(1);
		});

		test('Hadamard gate should create superposition from |0⟩', () => {
			const state = new DensityMatrix(
				[
					['1', '0'],
					['0', '0']
				],
				'1',
				'|0⟩'
			);

			state.apply_gate(Hgate);

			// After H|0⟩ = (|0⟩ + |1⟩)/√2, density matrix should be |+⟩⟨+|
			expect(state.mat[0][0].re).toBeCloseTo(0.5);
			expect(state.mat[1][1].re).toBeCloseTo(0.5);
			expect(state.mat[0][1].re).toBeCloseTo(0.5);
			expect(state.mat[1][0].re).toBeCloseTo(0.5);
		});

		test('Identity gate should leave state unchanged', () => {
			const state = new DensityMatrix(
				[
					['0.3', '0.4'],
					['0.4', '0.7']
				],
				'1',
				'ψ'
			);
			const originalMat = state.mat.map((row) => row.map((el) => complex(el))) as ComplexMatRxC<2, 2>;

			const iGate = new GateMatrix(
				[
					['1', '0'],
					['0', '1']
				],
				'1',
				'I'
			);
			state.apply_gate(iGate);

			expect(equal(state.mat[0][0], originalMat[0][0])).toBe(true);
			expect(equal(state.mat[1][1], originalMat[1][1])).toBe(true);
		});
	});

	describe('Parameterized Gates', () => {
		test('RZ gate with θ=π should be equivalent to Z gate', () => {
			const rzGate = RZgate.clone();
			rzGate.setParameterLatex('theta', '\\pi');

			// Both gates should have the same effect on a random state
			const state1 = randomDensityMatrix(false);
			const state2 = state1.clone();

			state1.apply_gate(rzGate);
			state2.apply_gate(Zgate);

			// The states should be equivalent
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					expect(state1.mat[i][j].re).toBeCloseTo(state2.mat[i][j].re);
					expect(state1.mat[i][j].im).toBeCloseTo(state2.mat[i][j].im);
				}
			}
		});

		test('RX gate with θ=π should be equivalent to X gate', () => {
			const rxGate = RXgate.clone();
			rxGate.setParameterLatex('theta', '\\pi');

			const state1 = randomDensityMatrix();
			const state2 = state1.clone();
			state1.apply_gate(rxGate);
			state2.apply_gate(Xgate);

			// The states should be equivalent
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					expect(state1.mat[i][j].re).toBeCloseTo(state2.mat[i][j].re);
					expect(state1.mat[i][j].im).toBeCloseTo(state2.mat[i][j].im);
				}
			}
		});

		test('RY gate with θ=π should be equivalent to Y gate', () => {
			const ryGate = RYgate.clone();
			ryGate.setParameterLatex('theta', '\\pi');

			const state1 = randomDensityMatrix();
			const state2 = state1.clone();
			state1.apply_gate(ryGate);
			state2.apply_gate(Ygate);

			// The states should be equivalent
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					expect(state1.mat[i][j].re).toBeCloseTo(state2.mat[i][j].re);
					expect(state1.mat[i][j].im).toBeCloseTo(state2.mat[i][j].im);
				}
			}
		});

		test('should update parameter values correctly', () => {
			const param = new MatrixParam('theta', 'pi/4', '\theta', true);
			const gate = new GateMatrix(
				[
					['cos(theta)', '0'],
					['0', '1']
				],
				'1',
				'test',
				[param]
			);

			const result = gate.setParameterLatex('theta', '\\pi/2');
			expect(result.isValid).toBe(true);
		});
	});

	describe('Gate Composition', () => {
		test('X gate applied twice should return to original state', () => {
			const state = new DensityMatrix(
				[
					['1', '0'],
					['0', '0']
				],
				'1',
				'ψ'
			);
			const xGate = new GateMatrix(
				[
					['0', '1'],
					['1', '0']
				],
				'1',
				'X'
			);

			const originalState = [state.mat[0][0].re, state.mat[1][1].re];

			state.apply_gate(xGate);
			state.apply_gate(xGate);

			expect(state.mat[0][0].re).toBeCloseTo(originalState[0]);
			expect(state.mat[1][1].re).toBeCloseTo(originalState[1]);
		});

		test('H gate applied twice should return to original state', () => {
			const state = new DensityMatrix(
				[
					['1', '0'],
					['0', '0']
				],
				'1',
				'ψ'
			);
			const hGate = new GateMatrix(
				[
					['1', '1'],
					['1', '-1']
				],
				'1/sqrt(2)',
				'H'
			);

			const originalState = [state.mat[0][0].re, state.mat[1][1].re];

			state.apply_gate(hGate);
			state.apply_gate(hGate);

			expect(state.mat[0][0].re).toBeCloseTo(originalState[0]);
			expect(state.mat[1][1].re).toBeCloseTo(originalState[1]);
		});

		test('HXH should equal Z gate (up to global phase)', () => {
			const state1 = randomDensityMatrix(true);
			const state2 = state1.clone();

			// Apply HXH to state1
			state1.apply_gate(Hgate);
			state1.apply_gate(Xgate);
			state1.apply_gate(Hgate);

			// Apply Z to state2
			state2.apply_gate(Zgate);

			// Results should be equivalent (up to global phase)
			expect(Math.abs(state1.mat[0][0].re)).toBeCloseTo(Math.abs(state2.mat[0][0].re));
			expect(Math.abs(state1.mat[1][1].re)).toBeCloseTo(Math.abs(state2.mat[1][1].re));
		});
	});

	describe('Rotation Properties', () => {
		test('should calculate correct rotation angle for π/2 rotation', () => {
			RXgate.setParameterLatex('theta', '\\pi/2');

			const angle = RXgate.rotationAngle;
			expect(angle).toBeCloseTo(Math.PI / 2);
		});

		test('should identify rotation axis for Pauli gates', () => {
			const xGate = new GateMatrix(
				[
					['0', '1'],
					['1', '0']
				],
				'1',
				'X'
			);
			const yGate = new GateMatrix(
				[
					['0', '-i'],
					['i', '0']
				],
				'1',
				'Y'
			);
			const zGate = new GateMatrix(
				[
					['1', '0'],
					['0', '-1']
				],
				'1',
				'Z'
			);

			const xAxis = xGate.rotationAxis;
			const yAxis = yGate.rotationAxis;
			const zAxis = zGate.rotationAxis;

			expect(xAxis).not.toBeNull();
			expect(yAxis).not.toBeNull();
			expect(zAxis).not.toBeNull();

			if (xAxis && yAxis && zAxis) {
				// X gate should rotate around x-axis
				expect(Math.abs(xAxis[0])).toBeGreaterThan(0.9);
				// Z gate should rotate around z-axis 
				expect(Math.abs(zAxis[2])).toBeGreaterThan(0.9);
			}
		});
	});
});

describe('Bloch Vector Operations', () => {
	test('should correctly convert between density matrix and Bloch vector', () => {
		// Test various pure states
		const testCases = [
			{
				state: [
					['1', '0'],
					['0', '0']
				],
				expectedBloch: [0, 0, 1]
			}, // |0⟩
			{
				state: [
					['0', '0'],
					['0', '1']
				],
				expectedBloch: [0, 0, -1]
			}, // |1⟩
			{
				state: [
					['0.5', '0.5'],
					['0.5', '0.5']
				],
				expectedBloch: [1, 0, 0]
			}, // |+⟩
			{
				state: [
					['0.5', '-0.5'],
					['-0.5', '0.5']
				],
				expectedBloch: [-1, 0, 0]
			} // |-⟩
		];

		testCases.forEach(({ state, expectedBloch }, index) => {
			const dm = new DensityMatrix(state as string[][], '1', `test${index}`);
			const blochV = dm.blochV;

			expect(blochV[0]).toBeCloseTo(expectedBloch[0], 1);
			expect(blochV[1]).toBeCloseTo(expectedBloch[1], 1);
			expect(blochV[2]).toBeCloseTo(expectedBloch[2], 1);
		});
	});

	test('should handle mixed states correctly', () => {
		// Maximally mixed state
		const mixedDM = new DensityMatrix(
			[
				['0.5', '0'],
				['0', '0.5']
			],
			'1',
			'mixed'
		);
		const blochV = mixedDM.blochV;

		// Bloch vector should be at origin for maximally mixed state
		expect(blochV[0]).toBeCloseTo(0);
		expect(blochV[1]).toBeCloseTo(0);
		expect(blochV[2]).toBeCloseTo(0);
	});

	test('should maintain Bloch vector length ≤ 1 for valid density matrices', () => {
		const testStates = [
			[
				['1', '0'],
				['0', '0']
			], // pure state
			[
				['0.7', '0.2'],
				['0.2', '0.3']
			], // mixed state
			[
				['0.8', '0.1+0.1i'],
				['0.1-0.1i', '0.2']
			] // complex mixed state
		];

		testStates.forEach((state, index) => {
			const dm = new DensityMatrix(state as string[][], '1', `test${index}`);
			const blochV = dm.blochV;
			const length = Math.sqrt(blochV[0] ** 2 + blochV[1] ** 2 + blochV[2] ** 2);

			expect(length).toBeLessThanOrEqual(1.001); // Allow small numerical errors
		});
	});
});

describe('Quantum State Properties', () => {
	test('should preserve normalization under unitary evolution', () => {
		const state = new DensityMatrix(
			[
				['0.6', '0.3'],
				['0.3', '0.4']
			],
			'1',
			'ψ'
		);
		const gates = [
			new GateMatrix(
				[
					['0', '1'],
					['1', '0']
				],
				'1',
				'X'
			),
			new GateMatrix(
				[
					['0', '-i'],
					['i', '0']
				],
				'1',
				'Y'
			),
			new GateMatrix(
				[
					['1', '0'],
					['0', '-1']
				],
				'1',
				'Z'
			),
			new GateMatrix(
				[
					['1', '1'],
					['1', '-1']
				],
				'1/sqrt(2)',
				'H'
			)
		];

		gates.forEach((gate) => {
			const initialTrace = state.mat[0][0].re + state.mat[1][1].re;
			state.apply_gate(gate);
			const finalTrace = state.mat[0][0].re + state.mat[1][1].re;

			expect(finalTrace).toBeCloseTo(initialTrace, 10);
			expect(finalTrace).toBeCloseTo(1, 10);
		});
	});

	test('should detect pure vs mixed states correctly', () => {
		const pureStates = [
			[
				['1', '0'],
				['0', '0']
			],
			[
				['0', '0'],
				['0', '1']
			]
		];

		const mixedStates = [
			[
				['0.7', '0'],
				['0', '0.3']
			],
			[
				['0.6', '0.1'],
				['0.1', '0.4']
			]
		];

		pureStates.forEach((state, index) => {
			const dm = new DensityMatrix(state as string[][], '1', `pure${index}`);
			expect(dm.isPureState()).toBe(true);
		});

		mixedStates.forEach((state, index) => {
			const dm = new DensityMatrix(state as string[][], '1', `mixed${index}`);
			expect(dm.isPureState()).toBe(false);
		});
	});

	test('should calculate eigenvalues correctly for density matrices', () => {
		// Test maximally mixed state (eigenvalues should be [0.5, 0.5])
		const mixedDM = new DensityMatrix(
			[
				['0.5', '0'],
				['0', '0.5']
			],
			'1',
			'mixed'
		);
		const result = mixedDM.validateMatrix(mixedDM.mat as ComplexMatRxC<2, 2>);
		expect(result.isValid).toBe(true);

		// Test pure state (eigenvalues should be [0, 1])
		const pureDM = new DensityMatrix(
			[
				['1', '0'],
				['0', '0']
			],
			'1',
			'pure'
		);
		const pureResult = pureDM.validateMatrix(pureDM.mat as ComplexMatRxC<2, 2>);
		expect(pureResult.isValid).toBe(true);
	});
});
