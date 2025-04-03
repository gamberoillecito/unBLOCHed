import {
    complex,
    type Complex, 
    multiply as matmul,
    transpose,
    conj    
} from 'mathjs'
import { js } from 'three/tsl';

export type ComplexMat2x2 = [[Complex, Complex], [Complex, Complex]];


export function print_mat(mat: ComplexMat2x2) {
    console.log(`[${mat[0][0]}, ${mat[0][1]},\n${mat[1][0]}, ${mat[1][1]}]`)
}

function dagger(mat:ComplexMat2x2) {
    return conj(transpose(mat))
}

export class DensityMatrix {
    mat: ComplexMat2x2 = $state([
        [complex(1), complex(0)], 
        [complex(0), complex(0)]
    ]);
    #a = $derived(this.mat[0][0]);
    #b = $derived(this.mat[0][1]);
    #c = $derived(this.mat[1][0]);
    #d = $derived(this.mat[1][1]);

    // Note that the values of y and z are swapped to account
    // for the fact that threejs uses a different notation
    // This *should* allow us to forget about the different
    // notation in the rest of the code
    #blochV: [number, number, number] = $derived([
        2*this.#b.re,
        2*this.#a.re - 1,
        2*this.#b.im
    ])

    constructor(){
        return
        // console.log("inizio")
        // print_mat(this.mat)
        // this.apply_gate()
        // console.log("dopo apply")
        // print_mat(this.mat)
        // this.apply_gate()
    }

    // apply_gate(gate_mat: ComplexMat2x2 ) {
    apply_gate(gate_mat: ComplexMat2x2) {
        // let gate_mat:ComplexMat2x2 =  [
        // [complex(0), complex(1)], 
        // [complex(1), complex(0)]]

        console.log("apply gate")
        console.log("this.mat")
        print_mat(this.mat);
        console.log("gate_mat")
        print_mat(gate_mat);
        let gate_dag = dagger(gate_mat)
        this.mat = matmul(gate_mat, matmul(this.mat, gate_dag)) as ComplexMat2x2;
    }



    // get mat(){
    //     return this.#mat;
    // }
    // set mat(){
    //     return this.#mat;
    // }

    get blochV(){
        return this.#blochV  as [number, number, number];
    }

    get phase(){
        return 1; 
    }

    set a(value: Complex){
        this.mat[0][0] = value;
    }
    set b(value: Complex){
        this.mat[0][1] = value;
    }
    set c(value: Complex){
        this.mat[1][0] = value;
    }
    set d(value: Complex){
        this.mat[1][1] = value;
    }

    get a(){
        return this.#a;
    }
    get b(){
        return this.#b;
    }
    get c(){
        return this.#c;
    }
    get d(){
        return this.#d;
    }
}
