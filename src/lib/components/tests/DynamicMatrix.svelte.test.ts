import { test, expect } from "vitest";
import { type ComplexMatRxC } from "$lib/model/ModelUtility.svelte";
import { DensityMatrix } from '$lib/model/DensityMatrix.svelte';
import { FancyMatrix } from '$lib/model/FancyMatrix.svelte';
import { complex } from "mathjs";

test('FancyMatrix', () => {
    let latexMat = [['1', 'i'], ['1', '0']];
    let latexMult = '1';
    let FM = new FancyMatrix(latexMat, latexMult, 'test');

    expect(FM.mat[0][0]).toStrictEqual(complex(1, 0));
    expect(FM.mat[0][1]).toStrictEqual(complex(0, 1));

    // Check validation and setting of invalid matrix
    latexMat[0][0] = 'f\\d'
    let res = FM.validateMatrix(FM.generateMatrixFromLatex(latexMat, latexMult));
    expect(res.isValid).toBe(false);
    expect(FM.latexMat[0][0]).toBe('1')
    res = FM.setMatrixFromLatex(latexMat, latexMult);
    expect(res.isValid).toBe(false);

    // Check validation and setting of matrix from value
    let expectedValueMat = [[complex(1), complex('i')], [complex(1), complex(0)]] as ComplexMatRxC<2, 2>;
    res = FM.setMatrixValue(expectedValueMat);
    expect(res.isValid).toBe(true)

    // Check if latex element coincide with set values
    expect(FM.latexMat[0][0]).toBe('1');

    res = FM.setValue(complex('1+i'), 1, 1);
    expect(res.isValid).toBe(true);

})

test('DensityMatrix', () => {
    let latexMat = [['1', '0'], ['0', '0']];
    let latexMult = '1';
    let FM = new DensityMatrix(latexMat, latexMult, 'testDM');

    expect(FM.mat[0][0]).toStrictEqual(complex(1, 0));
    expect(FM.mat[0][1]).toStrictEqual(complex(0, 0));

    // Check validation and setting of invalid matrix
    latexMat[0][0] = '2'
    let res = FM.setMatrixFromLatex(latexMat, latexMult);
    expect(res.isValid).toBe(false);
    expect(FM.latexMat[0][0]).toBe('1')

    // // Check validation and setting of matrix from value
    // let expectedValueMat = [[complex(1), complex('i')], [complex(1), complex(0)]] as ComplexMatRxC<2,2>;
    // res = FM.setMatrixValue(expectedValueMat);
    // expect(res.isValid).toBe(true)

    // // Check if latex element coincide with set values
    // expect(FM.latexMat[0][0]).toBe('1');

    // res = FM.setValue(complex('1+i'), 1, 1);
    // expect(res.isValid).toBe(true);

})