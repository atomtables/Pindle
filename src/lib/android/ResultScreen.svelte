<script>
    import { fly, fade } from "svelte/transition";
    import { quintIn } from "svelte/easing";

    let { activated = $bindable(), gamescreen = $bindable() } = $props();
    let animateAway = $state(false);

    const share = () => {
        let data = {
            title: "Check out Pindle",
            text: `I completed Pindle in ${gamescreen.attempts} attempts on ${gamescreen.difficulty}! How can you do?`,
            url: window.location.href
        }
        if (navigator.canShare && navigator.canShare(data)) {
            navigator.share(data).catch(console.error);
        } else {
            const subject = encodeURIComponent("Check out Pindle");
            const body = encodeURIComponent(`I completed Pindle in ${gamescreen.attempts} attempts on ${gamescreen.difficulty}! How can you do? Check it out: ${window.location.href}`);
            const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
            window.location.href = mailtoLink;
        }
    }

    let onoutroend = $state();
</script>

{#if !animateAway}
    <div class="w-full h-full p-2 flex flex-col justify-between" in:fly|global={{y: "100%", delay: 900}} out:fade|global={{easing: quintIn, duration: 300}} onoutroend={() => onoutroend?.()}>
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
            <button onclick={share} class="cursor-pointer bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 active:bg-neutral-500 dark:active:bg-neutral-500 transition-colors p-2 w-full text-left uppercase font-bold flex flex-row items-center">
                <img src="/android/share.svg" alt="Share" class="w-8 aspect-square mr-2">
                <span class="mt-0.5">Share</span>
            </button>
            <button onclick={() => {animateAway = true; onoutroend = () => gamescreen = {}}} class="cursor-pointer bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 active:bg-neutral-500 dark:active:bg-neutral-500 transition-colors p-2 w-full text-left uppercase font-bold flex flex-row items-center">
                <img src="/android/refresh.svg" alt="Restart" class="w-8 aspect-square mr-2">
                <span class="mt-0.5">Restart</span>
            </button>
            <button onclick={() => (animateAway = true, onoutroend = () => {activated = false; gamescreen = {}})} class="cursor-pointer bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 active:bg-neutral-500 dark:active:bg-neutral-500 transition-colors p-2 w-full text-left uppercase font-bold flex flex-row items-center">
                <img src="/android/close.svg" alt="Close" class="w-8 aspect-square mr-2">
                <span class="mt-0.5">Leave</span>
            </button>
        </div>
    </div>
{/if}