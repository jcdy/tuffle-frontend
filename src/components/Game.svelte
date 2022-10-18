<script lang="ts">
	import { fade } from "svelte/transition";
	import Header from "./Header.svelte";
	import { Board } from "./board";
	import Keyboard from "./keyboard";
	import Modal from "./Modal.svelte";
	import { getContext, onMount, setContext } from "svelte";
	import Settings from "./settings";
	import {
		Seperator,
		Tutorial,
		Statistics,
		Distribution,
		Timer,
		Toaster,
	} from "./widgets";
	import {
		contractNum,
		DELAY_INCREMENT,
		PRAISE,
		getState,
		modeData,
		ROWS,
		COLS,
		newSeed,
		createNewGame,
		seededRandomInt,
		createLetterStates,
		words,
	} from "../utils";
	import { letterStates, settings, mode } from "../stores";

	export let word: string;
	export let stats: Stats;
	export let game: GameState;
	export let toaster: Toaster;

	setContext("toaster", toaster);
	const version = getContext<string>("version");

	// implement transition delay on keys
	const delay = DELAY_INCREMENT * ROWS + 800;

	let showTutorial = $settings.tutorial === 3;
	let showSettings = false;
	let showStats = false;
	let showRefresh = false;

	let board: Board;
	let timer: Timer;

	function submitWord() {
	  // `game.guesses` is the number of guesses the user has submitted.
		// This checks if the word at index game.guesses has less letters
		// than the number of columns, and reports to the user if there are
		// not enough letters in their guess.
		if (game.board.words[game.guesses].length !== COLS) {
			toaster.pop("Not enough letters");
			board.shake(game.guesses);
		} else if (words.contains(game.board.words[game.guesses])) {
		  // `words.contains` accesses a dictionary of all valid words.
			const state = getState(word, game.board.words[game.guesses]);
			game.board.state[game.guesses] = state;
			state.forEach((e, i) => {
				const ls = $letterStates[game.board.words[game.guesses][i]];
				if (ls === "🔳" || e === "🟩") {
					$letterStates[game.board.words[game.guesses][i]] = e;
				}
			});
			++game.guesses;
			if (game.board.words[game.guesses - 1] === word) {
				win();
			} else if (game.guesses === ROWS) {
				lose();
			}
		} else {
			toaster.pop("Not in word list");
			board.shake(game.guesses);
		}
	}

	function win() {
		board.bounce(game.guesses - 1);
		game.active = false;
		setTimeout(
			() => toaster.pop(PRAISE[game.guesses - 1]),
			DELAY_INCREMENT * COLS + DELAY_INCREMENT
		);
		setTimeout(setShowStatsTrue, delay * 1.4);
		++stats.guesses[game.guesses];
		++stats.played;
		if ("streak" in stats) {
			stats.streak =
				modeData.modes[$mode].seed - stats.lastGame > modeData.modes[$mode].unit
					? 1
					: stats.streak + 1;
			if (stats.streak > stats.maxStreak) stats.maxStreak = stats.streak;
		}
		stats.lastGame = modeData.modes[$mode].seed;
		localStorage.setItem(`stats-${$mode}`, JSON.stringify(stats));
	}

	function lose() {
		// Display the tuffle if the player fails to guess it.
		toaster.pop("The tuffle was: " + word, 2);
		game.active = false;
		setTimeout(setShowStatsTrue, delay);
		++stats.guesses.fail;
		++stats.played;
		if ("streak" in stats) stats.streak = 0;
		stats.lastGame = modeData.modes[$mode].seed;
		localStorage.setItem(`stats-${$mode}`, JSON.stringify(stats));
	}

	function concede() {
		showSettings = false;
		setTimeout(setShowStatsTrue, DELAY_INCREMENT);
		lose();
	}

	function reload() {
		modeData.modes[$mode].historical = false;
		modeData.modes[$mode].seed = newSeed($mode);
		game = createNewGame($mode);
		word = words.words[seededRandomInt(0, words.words.length, modeData.modes[$mode].seed)];
		$letterStates = createLetterStates();
		showStats = false;
		showRefresh = false;
		timer.reset($mode);
	}

	function setShowStatsTrue() {
		if (!game.active) showStats = true;
	}

	onMount(() => {
		if (!game.active) setTimeout(setShowStatsTrue, delay);
	});
	// $: toaster.pop(word);
</script>

<main class:guesses={game.guesses !== 0} style="--rows: {ROWS}; --cols: {COLS}">
	<Header
		bind:showRefresh
		tutorial={$settings.tutorial === 2}
		on:closeTutPopUp|once={() => ($settings.tutorial = 1)}
		showStats={stats.played > 0 || (modeData.modes[$mode].historical && !game.active)}
		on:stats={() => (showStats = true)}
		on:tutorial={() => (showTutorial = true)}
		on:settings={() => (showSettings = true)}
		on:reload={reload}
	/>
	<Board
		bind:this={board}
		bind:value={game.board.words}
		tutorial={$settings.tutorial === 1}
		on:closeTutPopUp|once={() => ($settings.tutorial = 0)}
		board={game.board}
		guesses={game.guesses}
		icon={modeData.modes[$mode].icon}
	/>
	<Keyboard
		on:keystroke={() => {
			if ($settings.tutorial) $settings.tutorial = 0;
			board.hideCtx();
		}}
		bind:value={game.board.words[game.guesses === ROWS ? 0 : game.guesses]}
		on:submitWord={submitWord}
		on:esc={() => {
			showTutorial = false;
			showStats = false;
			showSettings = false;
		}}
		disabled={!game.active || $settings.tutorial === 3}
	/>
</main>

<Modal
	bind:visible={showTutorial}
	on:close|once={() => $settings.tutorial === 3 && --$settings.tutorial}
	fullscreen={$settings.tutorial === 0}
>
	<Tutorial visible={showTutorial} />
</Modal>

<Modal bind:visible={showStats}>
	<Statistics data={stats} />
	<Distribution distribution={stats.guesses} {game} />
	<Timer
		bind:this={timer}
		on:reload={reload}
	/>
</Modal>

<Modal fullscreen={true} bind:visible={showSettings}>
	<Settings state={game} />
</Modal>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		height: 100%;
		max-width: var(--game-width);
		margin: auto;
		position: relative;
	}
</style>
