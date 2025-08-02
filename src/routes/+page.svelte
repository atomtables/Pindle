<script>
    import LockScreen from "$lib/android/LockScreen.svelte";
    import GameScreen from "$lib/android/GameScreen.svelte";
    import ResultScreen from "$lib/android/ResultScreen.svelte";
    import InstructionsScreen from "$lib/android/InstructionsScreen.svelte";
    import {onMount} from "svelte";

    let activated = $state({});
    let instructions = $state(false);
    let gamescreen = $state({});

    onMount(() => window.scroll(0, 1))
</script>

<div class="w-screen h-dvh flex items-center justify-center select-none [-webkit-user-select:none] touch-manipulation">
    <div class="relative parent overflow-hidden w-full md:w-md mx-auto h-full md:h-auto md:aspect-9/16 md:shadow-glow md:shadow-black md:dark:shadow-white bg-neutral-800/50 transition-all">
        <div class="-z-2 absolute top-0 right-0 w-full h-full bg-[url(/background.webp)] bg-cover android-unlock android-unlock-background"></div>
        {#if !activated.go}
            {#if instructions}
                <InstructionsScreen bind:instructions />
            {:else}
                <LockScreen bind:instructions bind:activated />
            {/if}
        {:else if !gamescreen.complete}
            <GameScreen old={activated} bind:next={gamescreen}/>
        {:else}
            <ResultScreen bind:gamescreen bind:activated/>
        {/if}
    </div>
</div>
