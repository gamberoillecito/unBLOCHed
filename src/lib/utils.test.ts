import { test, expect, describe } from 'vitest';
import {
	cn,
	type WithoutChild,
	type WithoutChildren,
	type WithoutChildrenOrChild,
	type WithElementRef
} from './utils';

describe('Utility Functions', () => {
	describe('cn function', () => {
		test('should merge class names correctly', () => {
			const result = cn('bg-red-500', 'text-white');
			expect(result).toBe('bg-red-500 text-white');
		});

		test('should handle conditional classes', () => {
			const result = cn('base-class', true && 'conditional-class', false && 'not-included');
			expect(result).toBe('base-class conditional-class');
		});

		test('should handle overlapping Tailwind classes', () => {
			const result = cn('bg-red-500', 'bg-blue-500');
			// twMerge should keep the last one
			expect(result).toBe('bg-blue-500');
		});

		test('should handle empty inputs', () => {
			const result = cn();
			expect(result).toBe('');
		});

		test('should handle null and undefined inputs', () => {
			const result = cn('base', null, undefined, 'end');
			expect(result).toBe('base end');
		});

		test('should handle arrays of classes', () => {
			const result = cn(['class1', 'class2'], 'class3');
			expect(result).toBe('class1 class2 class3');
		});

		test('should handle objects with boolean values', () => {
			const result = cn({
				'included-class': true,
				'excluded-class': false,
				'another-included': true
			});
			expect(result).toBe('included-class another-included');
		});

		test('should handle complex combinations', () => {
			const isActive = true;
			const size = 'lg';

			const result = cn(
				'btn',
				'btn-primary',
				{
					'btn-active': isActive,
					'btn-inactive': !isActive
				},
				size === 'lg' && 'btn-lg',
				['focus:ring-2', 'focus:ring-blue-500']
			);

			expect(result).toContain('btn');
			expect(result).toContain('btn-primary');
			expect(result).toContain('btn-active');
			expect(result).toContain('btn-lg');
			expect(result).toContain('focus:ring-2');
			expect(result).not.toContain('btn-inactive');
		});

		test('should handle Tailwind merge conflicts correctly', () => {
			// Test margin conflicts
			const result1 = cn('m-2', 'm-4');
			expect(result1).toBe('m-4');

			// Test background conflicts - twMerge resolves conflicts
			const result3 = cn('bg-red-500', 'bg-blue-600');
			expect(result3).toBe('bg-blue-600');
		});
	});
});

describe('TypeScript Type Utilities', () => {
	describe('WithoutChild type', () => {
		test('should remove child property from type', () => {
			interface TestInterface {
				name: string;
				child?: string;
				value: number;
			}

			type WithoutChildType = WithoutChild<TestInterface>;

			// This test is mainly for type checking
			const obj: WithoutChildType = {
				name: 'test',
				value: 42
				// child should not be allowed here
			};

			expect(obj.name).toBe('test');
			expect(obj.value).toBe(42);
		});

		test('should not affect types without child property', () => {
			interface TestInterface {
				name: string;
				value: number;
			}

			type WithoutChildType = WithoutChild<TestInterface>;

			const obj: WithoutChildType = {
				name: 'test',
				value: 42
			};

			expect(obj.name).toBe('test');
			expect(obj.value).toBe(42);
		});
	});

	describe('WithoutChildren type', () => {
		test('should remove children property from type', () => {
			interface TestInterface {
				name: string;
				children?: React.ReactNode;
				value: number;
			}

			type WithoutChildrenType = WithoutChildren<TestInterface>;

			const obj: WithoutChildrenType = {
				name: 'test',
				value: 42
				// children should not be allowed here
			};

			expect(obj.name).toBe('test');
			expect(obj.value).toBe(42);
		});
	});

	describe('WithoutChildrenOrChild type', () => {
		test('should remove both child and children properties', () => {
			interface TestInterface {
				name: string;
				child?: string;
				children?: React.ReactNode;
				value: number;
			}

			type CleanType = WithoutChildrenOrChild<TestInterface>;

			const obj: CleanType = {
				name: 'test',
				value: 42
				// Neither child nor children should be allowed here
			};

			expect(obj.name).toBe('test');
			expect(obj.value).toBe(42);
		});
	});

	describe('WithElementRef type', () => {
		test('should add ref property to type', () => {
			interface TestInterface {
				name: string;
				value: number;
			}

			type WithRefType = WithElementRef<TestInterface, HTMLDivElement>;

			const obj: WithRefType = {
				name: 'test',
				value: 42,
				ref: null // HTMLDivElement | null
			};

			expect(obj.name).toBe('test');
			expect(obj.value).toBe(42);
			expect(obj.ref).toBe(null);
		});

		test('should default to HTMLElement if not specified', () => {
			interface TestInterface {
				name: string;
			}

			type WithRefType = WithElementRef<TestInterface>;

			const obj: WithRefType = {
				name: 'test',
				ref: null // HTMLElement | null
			};

			expect(obj.name).toBe('test');
			expect(obj.ref).toBe(null);
		});
	});
});
