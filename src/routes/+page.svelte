<script>
    import LockScreen from "$lib/android/LockScreen.svelte";
    import GameScreen from "$lib/android/GameScreen.svelte";
    import ResultScreen from "$lib/android/ResultScreen.svelte";
    import InstructionsScreen from "$lib/android/InstructionsScreen.svelte";

    let activated = $state(false);
    let instructions = $state(false);
    let gamescreen = $state({});
</script>

<div class="w-screen h-dvh grid place-items-center select-none [-webkit-user-select:none]">
    <div class="relative overflow-hidden bg-neutral-200/50 dark:bg-neutral-800/50 w-full md:w-md mx-auto h-full md:h-auto md:aspect-9/16 md:shadow-glow md:shadow-black md:dark:shadow-white transition-all">
        <div class="-z-50 absolute top-0 right-0 w-full h-full bg-[url(/background.jpg)] bg-cover android-unlock android-unlock-background"></div>
        {#if !activated}
            {#if instructions}
                <InstructionsScreen bind:instructions />
            {:else}
                <LockScreen bind:instructions bind:activated />
            {/if}
        {:else if !gamescreen.complete}
            <GameScreen difficulty="easy" answer="1224" bind:next={gamescreen}/>
        {:else}
            <ResultScreen bind:gamescreen bind:activated/>
        {/if}
    </div>
</div>