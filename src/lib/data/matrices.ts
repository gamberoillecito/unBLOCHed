	import { GateMatrix } from "$lib/components/Model.svelte";
	import { DensityMatrix } from "$lib/components/Model.svelte";	
	import { MatrixParam } from "$lib/components/Model.svelte";
	
	export let theta_param = [new MatrixParam('theta', '\\pi/2', '\\theta', true)];
	export let theta_phi_lambdaa_param = [
		new MatrixParam('theta', '\\pi/2', '\\theta', true),
		new MatrixParam('phi', '\\pi/2', '\\phi', true),
		new MatrixParam('lambda', '\\pi/2', '\\lambda', true),
	];
	export const Xgate = new GateMatrix(
		[
			['0', '1'],
			['1', '0']
		],
		'1',
		'$$\\hat{X}$$'
	);
	export const Ygate = new GateMatrix(
		[
			['0', '-i'],
			['i', '0']
		],
		'1',
		'\\hat{Y}'
	);
	export const Zgate = new GateMatrix(
		[
			['1', '0'],
			['0', '-1']
		],
		'1',
		'\\hat{Z}'
	);
	export const Hgate = new GateMatrix(
		[
			['1', '1'],
			['1', '-1']
		],
		'\\frac{1}{\\sqrt{2}}',
		'\\hat{H}'
	);
	export const RZgate = new GateMatrix(
		[
			['e^{-i \\theta/2}', '0'],
			['0', 'e^{i \\theta/2}']
		],
		'1',
		'\\hat{R}_z',
		theta_param.map((x) => x.clone())
	);
	export const RXgate = new GateMatrix(
		[
			['\\cos(\\theta/2)', '-i \\sin(\\theta/2)'],
			['-i \\sin(\\theta/2)', '\\cos(\\theta/2)']
		],
		'1',
		'\\hat{R}_x',
		theta_param.map((x) => x.clone())
	);
	export const RYgate = new GateMatrix(
		[
			['\\cos(\\theta/2)', '-\\sin(\\theta/2)'],
			['\\sin(\\theta/2)', '\\cos(\\theta/2)']
		],
		'1',
		'\\hat{R}_y',
		theta_param.map((x) => x.clone())
	);
	
	export const U3gate = new GateMatrix(
		[
			['\\cos(\\theta/2)', '-e^{i \\lambda} \\sin(\\theta/2)'],
			['e^{i \\phi} \\sin(\\theta/2)', 'e^{i (\\phi + \\lambda)}\\cos(\\theta/2)']
		],
		'1',
		'\\hat{U}_3',
		theta_phi_lambdaa_param.map((x) => x.clone())
	);

	export const ket0 = new DensityMatrix(
		[
			['1', '0'],
			['0', '0']
		],
		'1',
		'\rho_{|0\\rangle}'
	);
	export const ket1 = new DensityMatrix(
		[
			['0', '0'],
			['0', '1']
		],
		'1',
		'\rho_{|1\\rangle}'
	);
	export const ketPlus = new DensityMatrix(
		[
			['1', '1'],
			['1', '1']
		],
		'\\frac{1}{2}',
		'\rho_{|+\\rangle}'
	);
	export const ketMinus = new DensityMatrix(
		[
			['1', '-1'],
			['-1', '1']
		],
		'\\frac{1}{2}',
		'\rho_{|-\\rangle}'
	);
	export const ketI = new DensityMatrix(
		[
			['1', 'i'],
			['-i', '1']
		],
		'\\frac{1}{2}',
		'\rho_{|i\\rangle}'
	);
	export const ketMinI = new DensityMatrix(
		[
			['1', '-i'],
			['i', '1']
		],
		'\\frac{1}{2}',
		'\rho_{|-i\\rangle}'
	);
	export const predefinedGates = [Xgate, Ygate, Zgate, Hgate, RXgate, RYgate, RZgate, U3gate];
	export const predefinedStates = [ket0, ket1, ketPlus, ketMinus, ketI, ketMinI];