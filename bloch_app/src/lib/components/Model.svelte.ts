import {complex, type Complex} from 'mathjs'

export class DensityMatrix {
    #mat: [[Complex, Complex], [Complex, Complex]] = $state([
        [complex(1), complex(0)], 
        [complex(0), complex(0)]
    ]);
    #a = $derived(this.#mat[0][0]);
    #b = $derived(this.#mat[0][1]);
    #c = $derived(this.#mat[1][0]);
    #d = $derived(this.#mat[1][1]);

    #blochV: [number, number, number] = $derived([
        2*complex(this.#b).re,
        2*complex(this.#b).im,
        2*complex(this.#a).re - 1
    ])


    get mat(){
        return this.#mat;
    }

    get blochV(){
        return this.#blochV  as [number, number, number];
    }

    get bvLen(){
        return Math.sqrt(this.blochV[0]**2 + this.blochV[1]**2 + this.blochV[2]**2);
    }

    get phase(){
        return 1; 
    }

    set a(value: Complex){
        this.#mat[0][0] = value;
    }
    set b(value: Complex){
        this.#mat[0][1] = value;
    }
    set c(value: Complex){
        this.#mat[1][0] = value;
    }
    set d(value: Complex){
        this.#mat[1][1] = value;
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
