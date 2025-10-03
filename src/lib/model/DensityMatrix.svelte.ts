import type { Complex } from 'mathjs';
import { FancyMatrix } from './FancyMatrix.svelte';
import { MatrixParam, type ComplexMatRxC, math, newComplexMat2x2, MatrixValidity, dagger, type ComplexMat } from './ModelUtility.svelte';
import { StateVector } from './StateVector.svelte';
import { GateMatrix } from './GateMatrix.svelte';


export class DensityMatrix extends FancyMatrix {
    #a: Complex;
    #b: Complex;
    #c: Complex;
    #d: Complex;
    _SV: StateVector;
    // Note that the values of y and z are swapped to account
    // for the fact that threejs uses a different notation
    // This **should** allow us to forget about the different
    // notation in the rest of the code
    // #blochV: [number, number, number];
    constructor(latexMat: string[][], latexMult: string, label: string, params: MatrixParam[] = [], mat?: ComplexMatRxC<2, 2>) {
        super(latexMat, latexMult, label, params, mat);
        this._extendedLabel = `\\rho^{${label}}`;
        this.#a = $derived(this._mat[0][0]);
        this.#b = $derived(this._mat[1][0]);
        this.#c = $derived(this._mat[0][1]);
        this.#d = $derived(this._mat[1][1]);
        // Create new state vector with the truncated latex display
        const sv = this.getStateVector();
        // //////// //
        // WARNING: //
        // //////// //
        // A bit of an hack necessary when creating a new DM which represents a mixed state (e.g. done when adding
        // a mixed state to the history). If the state is mixed then the associated state vector defaults to |0>.
        // I think this is better than having to deal with `null` StateVectors inside DensityMatrix since we
        // are making sure that when the state is mixed the StateVector display is hidden
        this._SV = new StateVector(sv ? sv.map(row => row.map(x => math.round(x, 2).toString())) : [['1'], ['0']], '1', this.label, undefined, this.getStateVector() as ComplexMatRxC<2, 1>);
    }

    protected fallbackLatexMat(): string[][] {
        return [['1', '0'], ['0', '0']];
    }
    // https://faculty.csbsju.edu/frioux/q-intro/BlochVectorEntropy.pdf
    get blochV(): [number, number, number] {
        // return this.#blochV  as [number, number, number];
        const pauliX = newComplexMat2x2([0, 1, 1, 0]);
        const pauliY = newComplexMat2x2([0, '-i', 'i', 0]);
        const pauliZ = newComplexMat2x2([1, 0, 0, -1]);
        // Note that the values of y and z are swapped to account
        // for the fact that threejs uses a different notation
        // This **should** allow us to forget about the different
        // notation in the rest of the code
        const paulis: ComplexMatRxC<2, 2>[] = [pauliX!, pauliY!, pauliZ!];
        const blochV = [];
        for (const p of paulis) {
            blochV.push(math.trace(math.multiply(this._mat, p)));
        }
        return blochV as [number, number, number];
    }

    get phi() {
        const phi = math.atan2(this.#b.im, this.#b.re);
        return (phi + 2 * Math.PI) % (2 * Math.PI);
    }

    // According to Nielsen-Chuang page 100
    isPureState(matrix: ComplexMatRxC<2, 2> | null = null): boolean {

        const mat = math.matrix(matrix ?? this._mat);
        const TrRhoSquared = math.trace(math.multiply(mat, mat)) as unknown as Complex;
        if (math.smaller(TrRhoSquared.re, 1)) {
            return false;
        }
        return true;

    }

    // Validation perfomed according to Theorem 2.5 Nielsen-Chuang
    // Added also check to see if it is Hermitian but I'm not sure it is needed (
    // although without this check the matrix rho =[[1,0], [1,0]] results valid)
    // https://mathworld.wolfram.com/PositiveDefiniteMatrix.html
    validateMatrix(newMat: ComplexMatRxC<2, 2>): MatrixValidity {
        const preliminary_validation = super.validateMatrix(newMat);
        if (preliminary_validation.isValid) {
            // Convert the matrix to mathjs object to
            // make operations easier
            const mat = math.matrix(newMat);


            // Hermitian
            if (!math.deepEqual(mat, dagger(mat))) {
                return new MatrixValidity(false, 'Not Hermitian');
            }

            // (2) Positive semidefinite
            const ei = math.eigs(mat).values.valueOf() as Complex[];

            for (let v of ei) {
                v = math.complex(v);

                if (math.isZero(v.im)) { // not complex
                    if (math.smallerEq(v.re, 1) && math.largerEq(v.re, 0)) { //between 0 and 1
                        continue;
                    }
                }

                return new MatrixValidity(false, 'Not a positive operator');

            }

            // (1) Unitary trace
            const Tr = math.trace(mat) as unknown as Complex;

            if (!math.isZero(Tr.im)) {
                // console.log(Tr);
                // console.log(math.typeOf(Tr));
                console.error(`The matrix has imaginary trace ${Tr}, this should be caught by the other checks`);
                return new MatrixValidity(false, 'Negative eigenvalues, please report this to the developer');
            }

            if (!math.equal(Tr.re, 1)) {
                return new MatrixValidity(false, `$\\operatorname{tr}[\\rho] \\neq 1$`);
            }


            return new MatrixValidity(true);
        }
        return preliminary_validation;
    }

    copy(FM: this): void {
        super.copy(FM);
        this.updateSV();
    }

    get a() {
        return this.#a;
    }
    get b() {
        return this.#b;
    }
    get c() {
        return this.#c;
    }
    get d() {
        return this.#d;
    }

    // Applies the given gate to the DensityMatrix
    apply_gate(GM: GateMatrix) {
        // this._mat = matmul(gate_mat, matmul(this._mat, gate_mat.T())) as ComplexMat2x2<2,2>;
        const gate_mat = GM.mat;
        const gate_dag = dagger(gate_mat);
        const newMat = math.multiply(gate_mat, math.multiply(this._mat, gate_dag)) as ComplexMatRxC<2, 2>;
        const res = this.setMatrixValue(newMat);
        return res
    }

    L() {
        return math.sqrt(this.blochV[0] ^ 2 + this.blochV[1] ^ 2 + this.blochV[2] ^ 2);
    }

    get SV() {
        return this._SV;
    }

    getStateVector(method: 'angles' | 'eigen' = 'eigen'): ComplexMatRxC<2, 1> | null {
        // First check if it's a pure state
        if (!this.isPureState()) {
            return null; // Can't get a state vector from a mixed state
        }

        if (method == 'angles') {
            const theta = math.acos(this.blochV[2]) as number;
            return [
                [math.complex(math.cos(theta / 2))],
                [math.complex(
                    math.multiply(
                        math.sin(theta / 2),
                        math.exp(
                            math.multiply(math.i, this.phi)
                        )
                    )
                )]
            ];
        }

        else if (method == 'eigen') {
            // This method is the one adopted by Qiskit
            // https://github.com/Qiskit/qiskit/blob/stable/2.1/qiskit/quantum_info/states/densitymatrix.py#L808
            // Calculate eigendecomposition
            const eigVec = math.eigs(math.matrix(this._mat)).eigenvectors;

            // Find index of eigenvalue closest to 1
            const eigVec1 = eigVec.filter(e => math.equal(1, e.value));
            if (eigVec1.length !== 1) {
                return null;
            }
            // Extract the corresponding eigenvector
            const eigVecRow = eigVec1[0].vector;
            const norm = math.norm(eigVecRow);
            // Normalize the eigenvector
            const eigVecRowNorm = math.divide(eigVecRow, norm).valueOf() as number[];

            return [[math.complex(eigVecRowNorm[0])], [math.complex(eigVecRowNorm[1])]];
        }
        else {
            console.error('Invalid method');
            return null;
        }

    }

    private updateSV() {

        const v = this.getStateVector();
        if (v != null) {
            this._SV.setMatrixValue(v);
        }
    }
    setMatrixFromLatex(newLatexMat: (string)[][], mult: string): MatrixValidity {
        const res = super.setMatrixFromLatex(newLatexMat, mult);
        if (res.isValid) {
            this.updateSV();
        }
        return res;

    }
    setMatrixValue(newMat: ComplexMat): MatrixValidity {
        const res = super.setMatrixValue(newMat);
        if (res.isValid) {
            this.updateSV();
        }
        return res;
    }
}

export class FakeDensityMatrix extends DensityMatrix {
    private _phi: number;
    private _theta: number;
    private _length: number;
    constructor(phi: number = 0, theta: number = 0, length: number = 1) {
        const params = [
            new MatrixParam(`theta`, `0`, `\\theta`, false),
            new MatrixParam(`phi`, `0`, `\\phi`, false),
        ];
        const latexMult = '1';
        const label = '\\rho';
        const latexMat = [
            ['\\cos^2(\\frac{\\theta}{2})', '\\frac{1}{2} \\sin(\\theta) e^{-i \\phi}'],
            ['\\frac{1}{2} \\sin(\\theta) e^{i \\phi}', '\\sin^2(\\frac{\\theta}{2})']
        ];
        super(latexMat, latexMult, label, params);
        this._phi = $state(phi);
        this._theta = $state(theta);
        this._length = $state(length);
    }

    get phi() {
        return this._phi;
    }

    set phi(p: number) {
        this._phi = math.mod(p, math.multiply(2, math.pi));
        this.setParameterLatex('phi', `${this._phi}`);
    }

    get theta() {
        return this._theta;
    }

    set theta(t: number) {
        this._theta = math.mod(t, math.multiply(2, math.pi));
        this.setParameterLatex('theta', `${this._theta}`);
    }

    get length() {
        return this._length;
    }


    set length(v: number) {
        this._length = math.min(math.max(v, 0), 1);
    }



    get blochV(): [number, number, number] {
        const x = this.length * Math.sin(this.theta) * Math.cos(this.phi);
        const y = this.length * Math.sin(this.theta) * Math.sin(this.phi);
        const z = this.length * Math.cos(this.theta);
        return [x, y, z];
    }

}

