<script>
    import {fly} from "svelte/transition";
    import {formatTime} from "$lib/helpers.js";
    import Constants from "$lib/gameplay/Constants.js";
    import {LocalStore} from "$lib/LocalState.svelte.js";
    import {onMount} from "svelte";
    import { PUBLIC_DAILY_URL } from "$env/static/public";
    import { Success, Failure, Quit } from "$lib/quotes.js";

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
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
        }
    }
    let onoutroend = $state();
    const time = $derived(formatTime(gamescreen.time));
    let bestScore = new LocalStore(`best-${activated.difficulty}-${activated.gamemode}`, {})

    function scrollToUserEntry() {
        if (!gamescreen.dailyId) return;

        setTimeout(() => {
            const userEntry = document.getElementById(gamescreen.dailyId);
            if (userEntry) {
                userEntry.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 1500);
    }

    let leaderboard = (async () => {
        let lb = await fetch(`${PUBLIC_DAILY_URL}/leaderboard`)
        if (lb.ok) {
            lb = await lb.json();
            console.log(lb);
            setTimeout(scrollToUserEntry, 0);
            return lb;
        } else {
            throw new Error("Failed to get the leaderboard. There may be an error.")
        }
    })();
</script>

{#if !animateAway}
    <div class="w-full h-full max-md:pb-2">
        <div class="w-full h-full p-2 pb-[env(safe-area-inset-bottom)] md:pb-2 flex flex-col justify-between text-neutral-100" in:fly|global={{y: "100%", delay: 900}} out:fly|global={{y: "-100%"}} onoutroend={() => onoutroend?.()}>
            <div>
                {#if gamescreen.win}
                    <div>
                        <div class="font-thin text-7xl xs:text-8xl text-green-500">
                            Success!
                        </div>
                        <div class="px-1 font-light text-2xl pt-1">
                            {#if gamescreen.best}
                                <div class="flex flex-row items-center">
                                    <img src="/android/trophy.svg" alt="Trophy" class="w-8 mr-2 aspect-square object-cover invert dark:invert-0">
                                    <span>Smashed your record high!</span>
                                </div>
                            {:else if gamescreen.daily}
                                Successfully beat the daily challenge!
                            {:else}
                                Successfully solved the stumper.
                            {/if}
                        </div>
                        <div class="px-1 font-light text-lg pt-1">
                            "{Success()}"
                        </div>
                    </div>
                {:else}
                    <div class="flex flex-col">
                        <div class="font-thin text-7xl/18 xs:text-8xl/20 pt-1 text-red-500">
                            Failure...
                        </div>
                        <div class="px-1 font-light text-2xl pt-1">
                            {#if gamescreen["quit"]}
                                Forfeited the game.
                            {:else if gamescreen["timeout"]}
                                Took too long to solve.
                            {:else if gamescreen["attempts"]}
                                Tried way too many times.
                            {:else}
                                Broke the game such that it didn't know why you lost. Truly extraordinary.
                            {/if}
                        </div>
                        <div class="px-1 font-light text-lg pt-1">
                            {#if gamescreen["quit"]}
                                "{Quit()}"
                            {:else}
                                "{Failure()}"
                            {/if}
                        </div>
                    </div>
                {/if}
                {#if !gamescreen.daily}
                    <div class="flex flex-col divide-neutral-400/75 divide-y-2 border-2 border-neutral-400/75 mt-2">
                        <div class="p-2 font-light">Statistics for your <b>{Constants.difficulty[activated.difficulty]} {Constants.gamemode[activated.gamemode]}</b> attempts</div>
                        <div class="flex flex-row justify-between *:p-2">
                            <div class="text-xl font-light flex-shrink">This game</div>
                            <div class="flex flex-row items-center justify-evenly flex-1">
                                <div class="text-xl font-bold flex-1 text-center">{gamescreen.attempts} attempt{gamescreen.attempts !== 1 ? 's' : ''}</div>
                                <div class="text-xl font-bold flex-1 text-center">{time} seconds</div>
                            </div>
                        </div>
                        <div class="flex flex-row justify-between *:p-2">
                            <div class="text-xl font-light flex-shrink">Best score</div>
                            <div class="flex flex-row items-center justify-evenly flex-1">
                                {#if bestScore.value.attempts && bestScore.value.time}
                                    <div class="text-xl font-bold flex-1 text-center">{bestScore.value.attempts} attempt{gamescreen.attempts !== 1 ? 's' : ''}</div>
                                    <div class="text-xl font-bold flex-1 text-center">{formatTime(bestScore.value.time)} seconds</div>
                                {:else}
                                    <div class="text-xl font-bold flex-1 text-center">N/A</div>
                                    <div class="text-xl font-bold flex-1 text-center">N/A</div>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
            {#if gamescreen.daily}
                <div class="my-5 flex-1 w-full overflow-y-scroll scroll-auto border-y-2 border-neutral-500">
                    {#await leaderboard}
                        getting leaderboard...
                    {:then lb}
                        {#if lb && lb.length > 0}
                            <div class="flex flex-col divide-neutral-400/75 divide-y-2">
                                <div class="p-2 font-light">Leaderboard for <b>{Constants.difficulty[activated.difficulty]} on {new Date().toLocaleDateString()}</b></div>
                                {#each lb as entry, i (i)}
                                    <div class="flex flex-row justify-between *:p-2 {entry.id === gamescreen.dailyId && 'bg-neutral-500/50'}" id={entry.id}>
                                        <div class="text-xl font-light {entry.id === gamescreen.dailyId && '!font-bold'} flex-shrink">{i + 1}. {entry.name}</div>
                                        <div class="flex flex-row items-center justify-evenly flex-1">
                                            <div class="text-xl font-bold flex-1 text-center">{entry.attempts} attempt{entry.attempts !== 1 ? 's' : ''}</div>
                                            <div class="text-xl font-bold flex-1 text-center">{formatTime(entry.time)} sec.</div>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            No entries in the leaderboard yet.
                        {/if}
                    {:catch error}
                        Failed to load the leaderboard: {error.message}
                    {/await}
                </div>
            {/if}
            <div class="flex flex-col space-y-2">
                {#if !gamescreen.daily}
                    <button onclick={() => {animateAway = true; onoutroend = () => (gamescreen.history = true, gamescreen.complete = false)}} class="cursor-pointer bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 active:bg-neutral-500 dark:active:bg-neutral-500 transition-colors p-2 w-full text-left uppercase font-bold flex flex-row items-center">
                        <img src="/android/history.svg" alt="History" class="w-8 aspect-square mr-2 invert dark:invert-0">
                        <span class="mt-0.5 text-neutral-900 dark:text-neutral-100">View the answer</span>
                    </button>
                {/if}
                <button onclick={share} class="cursor-pointer bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 active:bg-neutral-500 dark:active:bg-neutral-500 transition-colors p-2 w-full text-left uppercase font-bold flex flex-row items-center">
                    <img src="/android/share.svg" alt="Share" class="w-8 aspect-square mr-2 invert dark:invert-0">
                    <span class="mt-0.5 text-neutral-900 dark:text-neutral-100">Share</span>
                </button>
                {#if !gamescreen.daily}
                    <button onclick={() => {animateAway = true; onoutroend = () => gamescreen = {}}} class="cursor-pointer bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 active:bg-neutral-500 dark:active:bg-neutral-500 transition-colors p-2 w-full text-left uppercase font-bold flex flex-row items-center">
                        <img src="/android/refresh.svg" alt="Restart" class="w-8 aspect-square mr-2 invert dark:invert-0">
                        <span class="mt-0.5 text-neutral-900 dark:text-neutral-100">Restart</span>
                    </button>
                {/if}
                <button onclick={() => (animateAway = true, onoutroend = () => {activated = false; gamescreen = {}})} class="cursor-pointer bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 active:bg-neutral-500 dark:active:bg-neutral-500 transition-colors p-2 w-full text-left uppercase font-bold flex flex-row items-center">
                    <img src="/android/close.svg" alt="Close" class="w-8 aspect-square mr-2 invert dark:invert-0">
                    <span class="mt-0.5 text-neutral-900 dark:text-neutral-100">Leave</span>
                </button>
            </div>
        </div>
    </div>
{/if}