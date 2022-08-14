import * as A from 'fp-ts/lib/Array';
import type * as t from './type';

export const World = {
	create,
	from,
	load,
	set,
	tick,
};

function create(width: number, height: number): t.World {
	return {
		width,
		height,
		cells: createCells(width, height),
	};
}

function from(width: number, height: number, schema: string): t.World {
	return load(create(width, height), schema);
}

function load(world: t.World, template: string): t.World {
	const padToSize = (width: number, height: number, lines: string[]): string[] => {
		return padToWidth(width, padToHeight(height, lines));
	};

	const padToWidth = (width: number, lines: string[]): string[] => {
		const maxLen = lines.reduce((len, line) => Math.max(len, line.length), 0);
		const pad = ' '.repeat(Math.floor((width - maxLen) / 2));

		return lines.map((line) => `${pad}${line}`.padEnd(width));
	};

	const padToHeight = (height: number, lines: string[]): string[] => {
		const top = A.makeBy(Math.floor((height - lines.length) / 2), () => '');
		const bottom = A.makeBy(Math.ceil((height - lines.length) / 2), () => '');

		return [...top, ...lines, ...bottom];
	};

	const lineToCells = (line: string, y: number): t.Cell[] => {
		return [...line].map((char, x) => {
			if (char === 'h') {
				return {
					state: 'head',
					position: { x, y },
				};
			} else if (char === 't') {
				return {
					state: 'tail',
					position: { x, y },
				};
			} else if (char === '#') {
				return {
					state: 'conductor',
					position: { x, y },
				};
			}

			return {
				state: 'empty',
				position: { x, y },
			};
		});
	};

	return {
		...world,
		cells: padToSize(world.width, world.height, template.split(/\n/)).flatMap(lineToCells),
	};
}

function set(world: t.World, position: t.Position, state: t.CellState): t.World {
	const idx = posToIdx(world.width, position);

	return {
		...world,
		cells: world.cells.map((cell, i) => (i === idx ? { ...cell, state } : cell)),
	};
}

function tick(world: t.World): t.World {
	return {
		...world,
		cells: world.cells.map((cell) => {
			if (cell.state === 'head') {
				return { ...cell, state: 'tail' };
			} else if (cell.state === 'tail') {
				return { ...cell, state: 'conductor' };
			} else if (becomesHead(world, cell)) {
				return { ...cell, state: 'head' };
			}

			return cell;
		}),
	};
}

function becomesHead(world: t.World, cell: t.Cell): boolean {
	if (cell.state !== 'conductor') {
		return false;
	}
	const neighborHeadCount = neighbors(world, cell.position).filter(
		(cell) => cell.state === 'head'
	).length;

	return neighborHeadCount === 1 || neighborHeadCount === 2;
}

function createCells(width: number, height: number): t.Cell[] {
	return A.makeBy(width * height, (idx) => ({
		state: 'empty',
		position: idxToPos(width, idx),
	}));
}

function idxToPos(width: number, idx: number): t.Position {
	return {
		x: idx % width,
		y: Math.floor(idx / width),
	};
}

function neighbors({ width, cells }: t.World, { x, y }: t.Position): t.Cell[] {
	const t = y - 1;
	const r = x + 1;
	const b = y + 1;
	const l = x - 1;

	return [
		{ x: l, y: t },
		{ x: x, y: t },
		{ x: r, y: t },
		{ x: r, y: y },
		{ x: r, y: b },
		{ x: x, y: b },
		{ x: l, y: b },
		{ x: l, y: y },
	]
		.map((position) => cells[posToIdx(width, position)])
		.filter((cell) => cell !== undefined);
}

function posToIdx(width: number, { x, y }: t.Position): number {
	return x + y * width;
}
