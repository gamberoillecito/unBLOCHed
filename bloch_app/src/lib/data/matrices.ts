	import { GateMatrix } from "$lib/components/Model.svelte";
	import { DensityMatrix } from "$lib/components/Model.svelte";	
	import { MatrixParam } from "$lib/components/Model.svelte";
	
	export let theta_param = [new MatrixParam('theta', '\\pi/30', '\\theta', true)];
	const Xgate = new GateMatrix(
		[
			['0', '1'],
			['1', '0']
		],
		'1',
		'$$\\hat{X}$$'
	);
	const Ygate = new GateMatrix(
		[
			['0', '-i'],
			['i', '0']
		],
		'1',
		'\\hat{Y}'
	);
	const Zgate = new GateMatrix(
		[
			['1', '0'],
			['0', '-1']
		],
		'1',
		'\\hat{Z}'
	);
	const Hgate = new GateMatrix(
		[
			['1', '1'],
			['1', '-1']
		],
		'\\frac{1}{\\sqrt{2}}',
		'\\hat{H}'
	);
	const RZgate = new GateMatrix(
		[
			['e^{-i \\theta/2}', '0'],
			['0', 'e^{i \\theta/2}']
		],
		'1',
		'R_z(\\theta)',
		theta_param.map((x) => x.clone())
	);
	const RXgate = new GateMatrix(
		[
			['\\cos(\\theta/2)', '-i \\sin(\\theta/2)'],
			['-i \\sin(\\theta/2)', '\\cos(\\theta/2)']
		],
		'1',
		'R_x(\\theta)',
		theta_param.map((x) => x.clone())
	);
	const RYgate = new GateMatrix(
		[
			['\\cos(\\theta/2)', '-\\sin(\\theta/2)'],
			['\\sin(\\theta/2)', '\\cos(\\theta/2)']
		],
		'1',
		'R_y(\\theta)',
		theta_param.map((x) => x.clone())
	);

	const ket0 = new DensityMatrix(
		[
			['1', '0'],
			['0', '0']
		],
		'1',
		'|0\\rangle'
	);
	const ket1 = new DensityMatrix(
		[
			['0', '0'],
			['0', '1']
		],
		'1',
		'|1\\rangle'
	);
	const ketPlus = new DensityMatrix(
		[
			['1', '1'],
			['1', '1']
		],
		'\\frac{1}{2}',
		'|+\\rangle'
	);
	const ketMinus = new DensityMatrix(
		[
			['1', '-1'],
			['-1', '1']
		],
		'\\frac{1}{2}',
		'|-\\rangle'
	);
	const ketI = new DensityMatrix(
		[
			['1', 'i'],
			['-i', '1']
		],
		'\\frac{1}{2}',
		'|i\\rangle'
	);
	const ketMinI = new DensityMatrix(
		[
			['1', '-i'],
			['i', '1']
		],
		'\\frac{1}{2}',
		'|-i\\rangle'
	);
	export const predefinedGates = [Xgate, Ygate, Zgate, Hgate, RXgate, RYgate, RZgate];
	export const predefinedStates = [ket0, ket1, ketPlus, ketMinus, ketI, ketMinI];