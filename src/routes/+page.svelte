<script>
    import LockScreen from "$lib/android/LockScreen.svelte";
    import GameScreen from "$lib/android/GameScreen.svelte";

    let activated = $state(false);
    const activate = () => activated = true;
</script>

<div class="w-svw h-svh grid place-items-center select-none [-webkit-user-select:none]">
    <div class="relative overflow-hidden w-full md:w-md mx-auto h-full md:h-auto md:aspect-9/16 md:shadow-glow md:shadow-black md:dark:shadow-white transition-all">
        {#if !activated}
            <LockScreen activated={activate} />
        {:else}
            <GameScreen difficulty="easy" answer="1234" />
        {/if}
    </div>
</div>