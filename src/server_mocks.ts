import { ROWS, COLS, createLetterStates } from "./utils";

export type ServerResponse = {
	guessedWords: Array<string>,
	boardColors: Array<string>,
	letterColors: string,
	showInvalidGuessAnimation: boolean,
}
// TODO
// Stub functions for the Server API calls for local testing
export async function wordleKeyPressed(key: string)
	: Promise<ServerResponse> {

	console.log("Wordle Key Pressed ", key);

	// const response = await fetch(
	// 	'http://localhost:18080/wordle_key_pressed/' + key);
  const response = await fetch(
		'https://wordlebackend-1.amajc.repl.co/wordle_key_pressed/' + key);
	const data = await response.json();
  // const data = {
	// 	guessedWords: ["DINOS", "HALLS", "HALLS",
	// 				"COOfD", "HALLS", "HALLS"],
	// 	boardColors: ["BBGGY",  "BBGGY", "BBGGY",
	// 				"BBGGY", "BBGGY", "BBGGY"],
	// 	letterColors: "BBBBBBBBBBBBBBBBBBBBBBGYDB",
	// 	showInvalidGuessAnimation:false,
	// }
  // console.log("wordleKeyPressed server response 1: ", data);

	// let sr = {
	// 	guessedWords: data['guessedWords'],
	// 	boardColors: data['boardColors'],
	// 	letterColors: data['letterColors'],
	// 	showInvalidGuessAnimation:false,
  //   guessCount: 4,
	// };
  //
	// console.log("wordleKeyPressed server response 2: ", sr);
  // console.log("wordleKeyPressed cleaned: ", cleanResponse(sr));
	return cleanResponse(data);
}

export async function checkGuess(): Promise<ServerResponse> {
  console.log("checkGuess enter pressed");
	const response = await fetch(
		'https://wordlebackend-1.amajc.repl.co/enter_pressed');
	const data = await response.json();


	// console.log("checkGuess server response 2: ", sr);
  // console.log("checkGuess cleaned: ", cleanResponse(sr));
	return cleanResponse(data);
}

export async function deleteKeyPressed()
	: Promise<ServerResponse> {

	// const response = await fetch(
	// 	'http://localhost:18080/delete_pressed');
  const response = await fetch(
		'https://wordlebackend-1.amajc.repl.co/delete_pressed');
	const data = await response.json();

	// let sr = {
	// 	guessedWords: data['guessedWords'],
	// 	boardColors: data['boardColors'],
	// 	letterColors: data['letterColors'],
	// 	showInvalidGuessAnimation:false,
  //   guessCount: 4,
	// };

	return cleanResponse(data);
}

export async function newGame()
	: Promise<ServerResponse> {
  const response = await fetch(
		'https://wordlebackend-1.amajc.repl.co/new_game');
	const data = await response.json();
	return cleanResponse(data);
}

function cleanResponse(data)
	: ServerResponse {
  let server_response = {
    answer: data["answer"],
    boardColors: data['boardColors'],
		guessedWords: data['guessedWords'],
		letterColors: data['letterColors'],
    gameStatus: data["gameStatus"],
    errorMessage: data["errorMessage"],
	};

  let cleanedGuesses = server_response.guessedWords.concat(
		Array(ROWS - server_response.guessedWords.length)
		.fill(""));

	let cleanedColors = server_response.boardColors.concat(
		Array(ROWS - server_response.boardColors.length)
		.fill("BBBBB"));

	let cleanedLetterColors = (server_response.letterColors
		+ "BBBBBBBBBBBBBBBBBBBBBBBBBB").substring(0, 26);

	let cleaned_server_response = {
    answer: data["answer"],
    boardColors: cleanedColors,
		guessedWords: cleanedGuesses,
		letterColors: cleanedLetterColors,
    gameStatus: data["gameStatus"],
    errorMessage: data["errorMessage"],
	};
  console.log(Date.now());
  console.log(cleaned_server_response);
	return cleaned_server_response;
}

export function emptyResponse(): ServerResponse {
	return {
		guessedWords: Array(6).fill(""),
		boardColors: Array(6).fill("BBBBB"),
		letterColors: "BBBBBBBBBBBBBBBBBBBBBBBBBB",
		showInvalidGuessAnimation:false,
	}
}

// Returns a 2D array representing the letter colors.
export function boardStateFromServerResponse(
	server_response: ServerResponse): LetterState[][] {
	let boardColors = server_response["boardColors"];
	let letterStates = [];

	for (let i = 0; i < boardColors.length; i++) {
		letterStates.push([]);
		for (let j = 0; j < boardColors[i].length; j++) {
			switch(boardColors[i][j]) {
				case "G":
					letterStates[i].push("🟩");
					break;
				case "Y":
					letterStates[i].push("🟨");
					break;
				// case "D":
				// 	letterStates[i].push("⬛");
				// 	break;
				case "B":
				default:
					letterStates[i].push("⬛");
				break;
			}
		}
	}
	return letterStates;
}

export function letterStateFromServerResponse(server_response:
	ServerResponse): { [key: string]: LetterState; } {

	let letterColors = server_response["letterColors"];
	let letterStates = createLetterStates();

	let letters = "abcdefghijklmnopqrstuvwxyz";

	for (let i = 0; i < letters.length; i++) {
		let val;
		switch(letterColors[i]) {
			case "G":
				val = "🟩";
				break;
			case "Y":
				val = "🟨";
				break;
			case "D":
				val = "⬛";
				break;
			case "B":
			default:
				val = "🔳";
			break;
		}
		letterStates[letters[i]] = val;
	}
	return letterStates;
}
