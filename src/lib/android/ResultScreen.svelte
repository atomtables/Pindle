<script>
    import { fly, fade } from "svelte/transition";
    import { quintIn } from "svelte/easing";

    let { activated = $bindable(), gamescreen = $bindable() } = $props();
</script>

<div class="w-full h-full p-2 flex flex-col justify-between" in:fly={{y: "100%", delay: 900}} out:fade={{easing: quintIn}}>
    <div>
        <div class="font-thin text-8xl text-green-500">
            Success!
        </div>
        <div class="px-1 font-light text-2xl">
            Solved in <b>{gamescreen.attempts} attempts.</b>
        </div>
    </div>
    <div class="h-96">
        Leaderboard not available
    </div>
    <div class="flex flex-col space-y-2">
        <button class="cursor-pointer bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 active:bg-neutral-500 dark:active:bg-neutral-500 transition-colors p-2 w-full text-left uppercase font-bold flex flex-row items-center">
            <img src="/android/refresh.svg" alt="Restart" class="w-8 aspect-square mr-2">
            <span class="mt-0.5">Restart</span>
        </button>
        <button onclick={() => (activated = false, gamescreen = {})} class="cursor-pointer bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 active:bg-neutral-500 dark:active:bg-neutral-500 transition-colors p-2 w-full text-left uppercase font-bold flex flex-row items-center">
            <img src="/android/close.svg" alt="Close" class="w-8 aspect-square mr-2">
            <span class="mt-0.5">Leave</span>
        </button>
    </div>
</div>