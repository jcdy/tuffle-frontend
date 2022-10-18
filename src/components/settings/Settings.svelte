<script lang="ts">
	import { onMount } from "svelte";

	import { settings } from "../../stores";
	import Setting from "./Setting.svelte";

	let root: HTMLElement;
	onMount(() => {
		root = document.documentElement;
	});
	$: {
		if (root) {
			$settings.dark ? root.classList.remove("light") : root.classList.add("light");
			localStorage.setItem("settings", JSON.stringify($settings));
		}
	}
</script>

<!-- To add more features to Tuffle, you can add more settings below! -->
<!-- <svelte:body class:light={!$settings.dark} /> -->
<div class="outer">
	<div class="settings-top">
		<h3>settings</h3>
		<Setting type="switch" bind:value={$settings.dark}>
			<span slot="title">Dark Mode</span>
		</Setting>
	</div>
</div>

<style>
	.outer {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	:global(.settings-top > div) {
		padding: 16px 0;
		border-bottom: 1px solid var(--border-primary);
	}
</style>
