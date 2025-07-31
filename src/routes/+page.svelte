<script>
    import LockScreen from "$lib/android/LockScreen.svelte";
    import GameScreen from "$lib/android/GameScreen.svelte";
    import ResultScreen from "$lib/android/ResultScreen.svelte";

    let activated = $state(false);
    let gamescreen = $state({});
</script>

<div class="w-screen h-dvh pb-[env(safe-area-inset-bottom)] grid place-items-center select-none [-webkit-user-select:none]">
    <div class="relative overflow-hidden w-full md:w-md mx-auto h-full md:h-auto md:aspect-9/16 md:shadow-glow md:shadow-black md:dark:shadow-white transition-all">
        {#if !activated}
            <LockScreen bind:activated={activated}/>
        {:else if !gamescreen.complete}
            <GameScreen difficulty="easy" answer="1224" bind:next={gamescreen}/>
        {:else}
            <ResultScreen bind:gamescreen={gamescreen} bind:activated={activated} />
        {/if}
    </div>
</div>