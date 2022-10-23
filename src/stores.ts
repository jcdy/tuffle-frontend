import { writable } from "svelte/store";
import type { GameMode } from "./enums";
import { createDefaultSettings, createLetterStates } from "./utils";
import { emptyResponse } from "./server_api";

export const mode = writable<GameMode>();

export const letterStates = writable(createLetterStates());

export const settings = writable(createDefaultSettings());

export const server_response = writable(emptyResponse());
