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
    <div class="w-full h-full max-md:pb-2">
        <div class="w-full h-full p-2 pb-[env(safe-area-inset-bottom)] md:pb-2 flex flex-col justify-between text-neutral-100" in:fly|global={{y: "100%", delay: 900}} out:fly|global={{y: "-100%"}} onoutroend={() => onoutroend?.()}>
            {#if gamescreen.win}
                <div>
                    <div class="font-thin text-7xl xs:text-8xl text-green-500">
                        Success!
                    </div>
                    <div class="px-1 font-light text-2xl">
                        Solved in <b>{gamescreen.attempts} attempts.</b>
                    </div>
                </div>
            {:else}
                <div>
                    <div class="font-thin text-7xl xs:text-8xl text-red-500">
                        Failure...
                    </div>
                    <div class="px-1 font-light text-2xl">
                        {#if gamescreen.quit}
                            Quit after <b>{gamescreen.attempts} attempts.</b>
                        {:else}
                            Solved in <b>{gamescreen.attempts} attempts.</b>
                        {/if}
                    </div>
                    <div class="font-bold px-1">The answer was {gamescreen.correct}...</div>
                </div>
            {/if}
            <div class="h-96">
                Leaderboard not available
            </div>
            <div class="flex flex-col space-y-2">
                <button onclick={share} class="cursor-pointer bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 active:bg-neutral-500 dark:active:bg-neutral-500 transition-colors p-2 w-full text-left uppercase font-bold flex flex-row items-center">
                    <img src="/android/share.svg" alt="Share" class="w-8 aspect-square mr-2 invert dark:invert-0">
                    <span class="mt-0.5 text-neutral-900 dark:text-neutral-100">Share</span>
                </button>
                <button onclick={() => {animateAway = true; onoutroend = () => gamescreen = {}}} class="cursor-pointer bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 active:bg-neutral-500 dark:active:bg-neutral-500 transition-colors p-2 w-full text-left uppercase font-bold flex flex-row items-center">
                    <img src="/android/refresh.svg" alt="Restart" class="w-8 aspect-square mr-2 invert dark:invert-0">
                    <span class="mt-0.5 text-neutral-900 dark:text-neutral-100">Restart</span>
                </button>
                <button onclick={() => (animateAway = true, onoutroend = () => {activated = false; gamescreen = {}})} class="cursor-pointer bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 active:bg-neutral-500 dark:active:bg-neutral-500 transition-colors p-2 w-full text-left uppercase font-bold flex flex-row items-center">
                    <img src="/android/close.svg" alt="Close" class="w-8 aspect-square mr-2 invert dark:invert-0">
                    <span class="mt-0.5 text-neutral-900 dark:text-neutral-100">Leave</span>
                </button>
            </div>
        </div>
    </div>
{/if}