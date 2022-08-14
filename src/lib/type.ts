export type Cell = Readonly<{
	state: CellState;
	position: Position;
}>;

export type CellState = 'empty' | 'head' | 'tail' | 'conductor';

export type Position = Readonly<{
	x: number;
	y: number;
}>;

export type World = Readonly<{
	width: number;
	height: number;
	cells: Cell[];
}>;
