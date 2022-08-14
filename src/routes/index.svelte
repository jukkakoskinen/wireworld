<script lang="ts">
	import * as A from 'fp-ts/lib/Array';
	import { Template } from '$lib/template';
	import type * as t from '$lib/type';
	import { World } from '$lib/world';

	let frames: t.World[] = [World.from(32, 16, Template.byKey.and)];
	let cursor: number = 0;
	let template: keyof typeof Template.byKey | null;
	let tickInterval: number | undefined;

	$: world = frames[cursor];
	$: grid = A.chunksOf(world.width)(world.cells);

	function load(): void {
		if (!template) {
			return;
		}
		frames = [World.load(world, Template.byKey[template])];
		cursor = 0;
	}

	function next(): void {
		if (cursor === frames.length - 1) {
			frames = [...frames, World.tick(world)];
		}
		cursor = Math.min(frames.length - 1, cursor + 1);
	}

	function nextState({ state }: t.Cell): t.CellState {
		if (state === 'empty') {
			return 'conductor';
		} else if (state === 'conductor') {
			return 'head';
		} else if (['head', 'tail'].includes(state)) {
			return 'empty';
		}

		return state;
	}

	function prev(): void {
		cursor = Math.max(0, cursor - 1);
	}

	function set(cell: t.Cell): void {
		frames = [World.set(frames[0], cell.position, nextState(cell))];
		cursor = frames.length - 1;
		template = null;
	}

	function start(): void {
		clearInterval(tickInterval);
		tickInterval = window.setInterval(next, 100);
	}

	function stop(): void {
		clearInterval(tickInterval);
		tickInterval = undefined;
		frames = [frames[0]];
		cursor = 0;
	}
</script>

<svelte:head>
	<title>Wireworld</title>
</svelte:head>

<div class="bg-black font-mono min-h-screen text-white">
	<div class="mx-auto max-w-xl p-4 md:p-12">
		<h1 class="mb-2 text-xl">Wireworld</h1>
		<p class="mb-6 text-neutral-400">
			"Wireworld is a cellular automaton first proposed by Brian Silverman in 1987, as part of his
			program Phantom Fish Tank."
			<span class="text-white"
				>&mdash;&nbsp;<a
					class="underline"
					href="https://en.wikipedia.org/wiki/Wireworld"
					rel="noreferrer noopener"
					target="_blank">Wikipedia</a
				></span
			>
		</p>
		<label class="border border-neutral-400 divide-x divide-neutral-400 flex mb-4">
			<span class="px-4 py-2">Template</span>
			<select
				class="bg-black border-0 flex-1 px-4 py-2 focus:ring-0"
				bind:value={template}
				on:change={load}
			>
				{#if template === null}
					<option value={null}>CUSTOM</option>
				{/if}
				{#each Object.keys(Template.byKey) as name}
					<option value={name}>{name.toLocaleUpperCase()}</option>
				{/each}
			</select>
		</label>
		<div
			class="border border-neutral-400 divide-neutral-900 divide-y flex flex-col mb-4 relative text-lg md:text-xl"
		>
			{#each grid as row}
				<div class="divide-neutral-900 divide-x flex">
					{#each row as cell}
						<button
							class="aspect-square flex-1"
							class:bg-green-400={cell.state === 'head'}
							class:bg-green-600={cell.state === 'tail'}
							class:bg-green-800={cell.state === 'conductor'}
							on:click={() => set(cell)}
						/>
					{/each}
				</div>
			{/each}
			<div class="absolute left-0 p-2 pointer-events-none text-neutral-400 top-0 text-sm">
				Frame {cursor + 1}/{frames.length}
			</div>
		</div>
		<div class="flex mb-6 space-x-2">
			{#if tickInterval}
				<button class="border border-neutral-400 flex-1 py-2" on:click={stop}>Stop</button>
			{:else}
				<button class="border border-neutral-400 flex-1 py-2" on:click={start}>Start</button>
				<button
					class="border border-neutral-400 flex items-center justify-center py-2 w-16"
					on:click={prev}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
				<button
					class="border border-neutral-400 flex items-center justify-center py-2 w-16"
					on:click={next}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			{/if}
		</div>
		<div class="text-neutral-400 text-sm md:bottom-4 md:fixed md:right-4">
			Made by <a class="text-white underline" href="https://www.jukkakoskinen.fi">Jukka Koskinen</a>
		</div>
	</div>
</div>
