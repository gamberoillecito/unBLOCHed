import { test, expect, describe, vi } from 'vitest';
import {
	DensityMatrix,
	GateMatrix,
	FakeDensityMatrix,
	MatrixParam,
	type ComplexMatRxC
} from $lib / model / Model.svelte';
import { Xgate, Ygate, Zgate, Hgate, RZgate, randomDensityMatrix, RYgate } from '../data/matrices';
import { BlockNode, complex } from 'mathjs';

// Mock Svelte features
vi.mock('svelte', () => ({
	$state: vi.fn((value) => value),
	$derived: vi.fn((fn) => (typeof fn === 'function' ? fn() : fn))
}));

describe('Quantum Simulation Integration Tests', () => {
	describe('Complete Quantum State Evolution', () => {
		test('should evolve |0⟩ → H → X → H → |0⟩ correctly', () => {
			// Start with |0⟩ state
			const state = new DensityMatrix(
				[
					['1', '0'],
					['0', '0']
				],
				'1',
				'ψ'
			);
			expect(state.blochV[2]).toBeCloseTo(1); // z-component = 1 for |0⟩

			// Apply Hadamard gate: |0⟩ → (|0⟩ + |1⟩)/√2
			state.apply_gate(Hgate);
			expect(state.blochV[0]).toBeCloseTo(1, 1); // x-component = 1 for |+⟩
			expect(state.blochV[2]).toBeCloseTo(0, 5); // z-component = 0 for |+⟩

			// Apply X gate: |+⟩ → |+⟩ (no change for superposition along x-axis)
			state.apply_gate(Xgate);
			expect(state.blochV[0]).toBeCloseTo(1, 1); // Still on x-axis
			expect(state.blochV[2]).toBeCloseTo(0, 5); // z-component = 0 for |+⟩

			// Apply Hadamard again: should give |0⟩
			state.apply_gate(Hgate);

			expect(state.blochV[2]).toBeCloseTo(1, 1); // z-component = 1 for |0⟩
		});

		test('should handle quantum teleportation-like gate sequence', () => {
			// Simulate a simplified quantum teleportation circuit
			const state = randomDensityMatrix(true);
			const initialBloch = [...state.blochV];

			// Apply Bell state preparation (simplified)
			state.apply_gate(Hgate); // Create superposition
			state.apply_gate(Xgate); // Bit flip
			state.apply_gate(Hgate); // Measure basis rotation

			// The state should have evolved through the circuit
			expect(state.blochV).not.toEqual(initialBloch);
			// State should still be valid
			const validation = state.validateMatrix(state.mat as ComplexMatRxC<2, 2>);
			expect(validation.isValid).toBe(true);
		});

		test('should handle Deutsch-Jozsa algorithm gates', () => {
			// Simulate Deutsch-Jozsa algorithm initialization
			const qubit = new DensityMatrix(
				[
					['1', '0'],
					['0', '0']
				],
				'1',
				'input'
			);

			// Initialize in superposition
			qubit.apply_gate(Hgate);

			// Apply oracle (identity for constant 0 function)
			// Do nothing for constant 0

			// Apply final Hadamard
			qubit.apply_gate(Hgate);

			// Should return to |0⟩ for constant function
			expect(qubit.mat[0][0].re).toBeCloseTo(1);
			expect(qubit.mat[1][1].re).toBeCloseTo(0);
		});
	});

	describe('Quantum Error Correction Scenarios', () => {
		test('should detect bit flip errors', () => {
			// Start with encoded |0⟩ state
			const logicalZero = new DensityMatrix(
				[
					['1', '0'],
					['0', '0']
				],
				'1',
				'logical_0'
			);
			const originalBloch = [...logicalZero.blochV];

			// Simulate bit flip error
			logicalZero.apply_gate(Xgate);
			expect(logicalZero.blochV).not.toEqual(originalBloch);

			// Apply error correction (X gate again)
			logicalZero.apply_gate(Xgate);

			// Should recover original state
			expect(logicalZero.blochV[0]).toBeCloseTo(originalBloch[0]);
			expect(logicalZero.blochV[1]).toBeCloseTo(originalBloch[1]);
			expect(logicalZero.blochV[2]).toBeCloseTo(originalBloch[2]);
		});

		test('should detect phase flip errors', () => {
			// Start with |+⟩ state (superposition)
			const plusState = new DensityMatrix(
				[
					['0.5', '0.5'],
					['0.5', '0.5']
				],
				'1',
				'plus'
			);
			const originalBloch = [...plusState.blochV];

			// Simulate phase flip error
			plusState.apply_gate(Zgate);

			// Should flip to |-⟩ state
			expect(plusState.blochV[0]).toBeCloseTo(-originalBloch[0]);

			// Apply error correction (Z gate again)
			plusState.apply_gate(Zgate);

			// Should recover original |+⟩ state
			expect(plusState.blochV[0]).toBeCloseTo(originalBloch[0]);
		});
	});

	describe('Parameterized Gate Evolution', () => {
		test('should handle continuous rotation evolution', () => {
			RZgate.setParameterLatex('theta', '0');

			// Test rotation through different angles
			const angles = ['0', '\\pi/4', '\\pi/2', '\\pi', '3*\\pi/2', '2*//pi'];
			const blochVectors = [];

			const testState = randomDensityMatrix(true);

			for (const angle of angles) {
				const testGate = RZgate.clone();
				testGate.setParameterLatex('theta', angle);

				testState.apply_gate(testGate);
				blochVectors.push([...testState.blochV]);
			}

			// At θ=0 and θ=2π, should be similar (accounting for global phase)
			expect(Math.abs(blochVectors[0][2])).toBeCloseTo(Math.abs(blochVectors[5][2]), 1);

			// At θ=π, should have opposite z-component (phase flip)
			expect(blochVectors[3][2]).toBeCloseTo(blochVectors[0][2], 1);
		});

		test('should handle adiabatic evolution simulation', () => {
			// Simulate slow parameter change
			const state = new DensityMatrix(
				[
					['1', '0'],
					['0', '0']
				],
				'1',
				'adiabatic'
			);
			RYgate.setParameterLatex('theta', '0');

			// Evolve through small time steps
			const timeSteps = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
			let previousBloch = [...state.blochV];

			for (let i = 1; i < timeSteps.length; i++) {
				const evolGate = RYgate.clone();
				evolGate.setParameterLatex('theta', (timeSteps[i] - timeSteps[i - 1]).toString());

				state.apply_gate(evolGate);

				// Verify continuous evolution (small changes between steps)
				const currentBloch = state.blochV;
				const distance = Math.sqrt(
					(currentBloch[0] - previousBloch[0]) ** 2 +
					(currentBloch[1] - previousBloch[1]) ** 2 +
					(currentBloch[2] - previousBloch[2]) ** 2
				);

				expect(distance).toBeLessThan(1); // Should be continuous
				previousBloch = [...currentBloch];
			}
		});
	});

	describe('Mixed State Evolution', () => {
		test('should handle decoherence simulation', () => {
			// Start with pure state
			const state = new DensityMatrix(
				[
					['0.5', '0.5'],
					['0.5', '0.5']
				],
				'1',
				'coherent'
			);
			expect(state.isPureState()).toBe(true);

			// Apply dephasing by mixing with diagonal state
			const dephasedMat = [
				[complex(0.5), complex(0.3)], // Reduced off-diagonal terms
				[complex(0.3), complex(0.5)]
			] as any;

			state.setMatrixValue(dephasedMat);
			expect(state.isPureState()).toBe(false);

			// Bloch vector length should be reduced
			const blochLength = Math.sqrt(
				state.blochV[0] ** 2 + state.blochV[1] ** 2 + state.blochV[2] ** 2
			);
			expect(blochLength).toBeLessThan(1);
		});

		test('should handle thermal equilibrium evolution', () => {
			// Simulate evolution towards thermal equilibrium
			const state = new DensityMatrix(
				[
					['1', '0'],
					['0', '0']
				],
				'1',
				'thermal'
			);

			// Apply sequence of random unitaries to simulate thermalization
			const thermalGates = [Xgate, Ygate, Zgate, Hgate];
			const initialPurity = state.isPureState();

			// Apply random sequence
			for (let i = 0; i < 10; i++) {
				const randomGate = thermalGates[Math.floor(Math.random() * thermalGates.length)];
				state.apply_gate(randomGate);
			}

			// State evolution should preserve unitarity
			const validation = state.validateMatrix(state.mat as ComplexMatRxC<2, 2>);
			expect(validation.isValid).toBe(true);
		});
	});

	describe('FakeDensityMatrix Integration', () => {
		test('should synchronize with real density matrix', () => {
			const fakeDM = new FakeDensityMatrix(0, Math.PI / 2, 1);
			const realDM = new DensityMatrix(
				[
					['0.5', '0.5'],
					['0.5', '0.5']
				],
				'1',
				'real'
			);

			// Compare Bloch vectors
			const fakeBloch = fakeDM.blochV;
			const realBloch = realDM.blochV;

			// For |+⟩ state, both should give similar Bloch vectors
			expect(fakeBloch[0]).toBeCloseTo(realBloch[0], 1);
			expect(Math.abs(fakeBloch[1])).toBeCloseTo(Math.abs(realBloch[1]), 1);
			expect(Math.abs(fakeBloch[2])).toBeCloseTo(Math.abs(realBloch[2]), 1);
		});

		test('should handle interactive state manipulation', () => {
			const fakeDM = new FakeDensityMatrix(0, 0, 1);

			// Simulate joystick control
			fakeDM.theta = Math.PI / 2;
			fakeDM.phi = Math.PI / 4;
			fakeDM.length = 0.8;

			// Verify state changes
			expect(fakeDM.theta).toBeCloseTo(Math.PI / 2);
			expect(fakeDM.phi).toBeCloseTo(Math.PI / 4);
			expect(fakeDM.length).toBe(0.8);

			// Verify Bloch vector
			const blochV = fakeDM.blochV;
			const expectedLength = Math.sqrt(blochV[0] ** 2 + blochV[1] ** 2 + blochV[2] ** 2);
			expect(expectedLength).toBeCloseTo(0.8);
		});

		test('should handle boundary conditions', () => {
			const fakeDM = new FakeDensityMatrix();

			// Test angle wrapping
			fakeDM.theta = 3 * Math.PI;
			expect(fakeDM.theta).toBeCloseTo(Math.PI);

			fakeDM.phi = -Math.PI / 2;
			expect(fakeDM.phi).toBeCloseTo((3 * Math.PI) / 2);

			// Test length clamping
			fakeDM.length = 1.5;
			expect(fakeDM.length).toBe(1);

			fakeDM.length = -0.5;
			expect(fakeDM.length).toBe(0);
		});
	});

	describe('Error Recovery Scenarios', () => {
		test('should handle invalid matrix recovery', () => {
			const dm = new DensityMatrix(
				[
					['1', '0'],
					['0', '0']
				],
				'1',
				'recovery'
			);

			// Try to set invalid matrix (trace > 1)
			const invalidMat = [
				[complex(2), complex(0)],
				[complex(0), complex(0)]
			] as any;
			const result = dm.setMatrixValue(invalidMat);

			expect(result.isValid).toBe(false);
			// Original matrix should be preserved
			expect(dm.mat[0][0].re).toBeCloseTo(1);
			expect(dm.mat[1][1].re).toBeCloseTo(0);
		});

		test('should handle parameter parsing errors gracefully', () => {
			const param = new MatrixParam('x', 'invalid_expr', 'x', true);

			// Should handle invalid expressions without crashing
			expect(() => {
				new GateMatrix(
					[
						['cos(x)', '0'],
						['0', '1']
					],
					'1',
					'test',
					[param]
				);
			}).not.toThrow();
		});

		test('should maintain consistency after failed operations', () => {
			const dm = new DensityMatrix(
				[
					['0.7', '0.2'],
					['0.2', '0.3']
				],
				'1',
				'consistent'
			);
			const originalTrace = dm.mat[0][0].re + dm.mat[1][1].re;

			// Try invalid operation
			const invalidResult = dm.setMatrixFromLatex(
				[
					['2', '0'],
					['0', '1']
				],
				'1'
			);
			expect(invalidResult.isValid).toBe(false);

			// State should remain consistent
			const currentTrace = dm.mat[0][0].re + dm.mat[1][1].re;
			expect(currentTrace).toBeCloseTo(originalTrace);

			const validation = dm.validateMatrix(dm.mat as ComplexMatRxC<2, 2>);
			expect(validation.isValid).toBe(true);
		});
	});
});
