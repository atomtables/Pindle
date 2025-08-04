<script>
    import {onMount, tick} from "svelte";
    import {fade, fly} from "svelte/transition";
    import {cubicOut, quintOut} from "svelte/easing";
    import Constants from "$lib/gameplay/Constants.js";
    import {LocalStore} from "$lib/LocalState.svelte.js";
    import { PUBLIC_DAILY_URL } from "$env/static/public";

    let {activated = $bindable(), instructions = $bindable()} = $props();

    let date = $state(new Date());
    let dailyDone = new LocalStore("daily", new Date(0))
    let daily = $state({done: true, leaderboard: true});
    let dailyPrompt = $state(false);
    const dailyStart = async () => {
        let res;
        try {
            res = await fetch(`${PUBLIC_DAILY_URL}/register`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: daily.name,
                    leaderboard: daily.leaderboard
                })
            })
        } catch (e) {
            throw new Error(`Failed to connect to the server. ${e.message}. Try again later.`)
        }
        const data = await res.json();
        if (!res.ok) {
            throw new Error(`Failed to connect to the server. "${data.message}" Try again later.`)
        }
        if (data.code === 0) {
            dailyPrompt = false;
            await tick();
            await new Promise(r => setTimeout(() => r(), 200));
            activated.sessionId = data.sessionId;
            activated.daily = true;
            activated.difficulty = (await daily.req).difficulty;
            document.querySelectorAll(".android-unlock").forEach(el => {
                el.style.animationFillMode = 'forwards';
                el.classList.add("activate");
            });
            dailyDone.value = new Date();
            setTimeout(() => activated.go = true, 300)
        }
    }
    onMount(() => {
        const interval = setInterval(() => {
            date = new Date();
        }, 1000);
        cursor.screenHeight = document.querySelector('.android-unlock-screen')?.parentElement?.clientHeight;
        if (document.querySelector(".android-unlock-background").classList.contains("activate")) {
            document.querySelector(".android-unlock-background").style.animationFillMode = "forwards";
            document.querySelector(".android-unlock-background").style.animationDelay = '0s';
            document.querySelector(".android-unlock-background").style.animationDirection = "reverse";
            setTimeout(() => {
                let el = document.querySelector(".android-unlock-background");
                el.style.animationDirection = "";
                el.style.animationDelay = "";
                el.classList.remove("activate");
                el.style.animation = "none";
                void el.offsetWidth;
                el.style.animation = "";
            }, 500);
        }
        activated = {
            difficulty: 0,
            gamemode: 0,
        }
        if (Object.prototype.toString.call(dailyDone.value) === '[object Date]' && dailyDone.value.toString() !== 'Invalid Date') {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            console.log(dailyDone.value.toDateString());
            console.log(today.toDateString())
            if ((dailyDone.value.toDateString() !== today.toDateString())) {
                daily.done = false;
                daily.req = new Promise((resolve, reject) => {
                    fetch(PUBLIC_DAILY_URL).then((res) => {
                        if (res.ok) {
                            res.json().then(data => resolve(data));
                        } else {
                            reject(new Error("Failed to fetch daily"));
                        }
                    })
                })
            } else {
                daily.done = true;
            }
        }
        return () => {
            clearInterval(interval);
        };
    });

    const difficultyS = $derived(Constants.difficulty[activated.difficulty])
    const gamemodeS = $derived(Constants.gamemode[activated.gamemode])

    const isNearElement = (x, y, element, distance) => {
        const rect = element.getBoundingClientRect();
        const dx = x - Math.max(rect.left, Math.min(x, rect.right));
        const dy = y - Math.max(rect.top, Math.min(y, rect.bottom));
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) <= distance;
    }

    let cursor = $state({
        mousedown: false,
        initialY: 0,
        currentY: 0,
        screenHeight: 0,
        nearIt: false,
        deactivateIt: null,
        auxExit: null,
        auxClickedOnce: false,
    })

    let draggedElement = null;
    let appleftT = $state();

    const nextscreen = () => setTimeout(() => activated.go = true, 300 + 1000 * (parseFloat(document.querySelector(".android-unlock").style.animationDelay.replace('calc(', '').replace(')', '').replace('s', '')) || 0))

    function down(event) {
        if (event.target.closest('button[preventInteraction]') || event.target.closest('div[preventInteraction]')) {
            return;
        }
        if (event.type.includes('touch')) event.preventDefault();
        if (event.target.closest('img[preventInteraction]')) {
            event.preventDefault()
        }
        const clientX = event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
        const clientY = event.type.includes('touch') ? event.touches[0].clientY : event.clientY;

        for (const img of document.querySelectorAll('img[preventInteraction]')) {
            if (isNearElement(clientX, clientY, img, 75)) {
                cursor.nearIt = true;
                cursor.initialY = clientY;
                cursor.currentY = clientY;
                draggedElement = img;
                appleftT.style.width = `225px`
                appleftT.style.height = "225px"
                statusMessage = "Swipe left to view instructions"
                setTimeout(() => appleftT.classList.remove("transition-all", "duration-300"), 50)
                cursor.deactivateIt = setTimeout(() => {
                    if (!cursor.nearIt) {
                        appleftT.style.width = ``
                        appleftT.style.height = ``
                        statusMessage = "";
                        appleftT.classList.add("transition-all", "duration-300")
                    }
                    cursor.deactivateIt = null;
                    cursor.auxClickedOnce = false;
                }, 1000)
                return;
            }
        }

        cursor.mousedown = true;
        cursor.initialY = clientY;
        cursor.currentY = clientY;
    }
    function move(event) {
        let currentX;
        if (event.type.includes('touch')) {
            event.preventDefault();
            currentX = event.touches[0].clientX;
            cursor.currentY = event.touches[0].clientY;
        } else {
            currentX = event.clientX;
            cursor.currentY = event.clientY;
        }
        if (cursor.nearIt) {
            // get distance
            const distance = Math.sqrt(Math.pow(currentX - draggedElement.getBoundingClientRect().left, 2) + Math.pow(cursor.currentY - draggedElement.getBoundingClientRect().top, 2));
            appleftT.style.width = `${Math.max(225, distance * 3)}px`;
            appleftT.style.height = `${Math.max(225, distance * 3)}px`;
            return;
        }

        if (cursor.mousedown) {
            const percent = (cursor.currentY - cursor.initialY) / cursor.screenHeight;
            document.querySelectorAll(".android-unlock").forEach(el => {
                el.style.animationDirection = "";
                if (0 < percent < 1)
                    el.style.animationDelay = `${(Math.floor(percent * 100000) / 100000) * 0.5}s`
                else
                    el.style.animationDelay = "-0.0s";
            });
        }
    }
    function up(event) {
        if (event.target.closest('button[preventInteraction]') || event.target.closest('div[preventInteraction]')) {
            return;
        }
        if (event.type.includes('touch')) event.preventDefault();
        const percent = -(cursor.currentY - cursor.initialY) / cursor.screenHeight;
        if (cursor.nearIt) {
            appleftT.classList.add("transition-all", "duration-300")
            draggedElement = null;
            cursor.nearIt = false;

            console.log(appleftT.style.width.replace('px', ''), parseFloat(appleftT.style.width.replace('px', '')))
            if (parseFloat(appleftT.style.width.replace('px', '')) > 900 || cursor.auxClickedOnce) {
                console.log("triggered")
                appleftT.style.width = "2500px";
                appleftT.style.height = "2500px";
                clearTimeout(cursor.deactivateIt)
                document.querySelector(".android-unlock-background").style.animationFillMode = "forwards";
                cursor.auxExit = () => instructions = true;
                cursor.deactivateIt = null
                console.log("auxExit", cursor.auxExit)
                return;
            } else {
                clearTimeout(cursor.deactivateIt)
                appleftT.style.width = `225px`
                appleftT.style.height = "225px"
                cursor.deactivateIt = setTimeout(() => {
                    if (!cursor.nearIt) {
                        appleftT.style.width = ``
                        appleftT.style.height = ``
                        statusMessage = "";
                        appleftT.classList.add("transition-all", "duration-300")
                    }
                    cursor.deactivateIt = null;
                    cursor.auxClickedOnce = false;
                }, 1000)
                cursor.auxClickedOnce = true;
            }
            return;
        }
        if (cursor.currentY === cursor.initialY) {
            if (window.matchMedia("(min-width: 768px)").matches) {
                document.querySelectorAll(".android-unlock").forEach(el => {
                    el.style.animationFillMode = 'forwards';
                    el.classList.add("activate");
                });
                nextscreen()
                return
            }
        }

        if (cursor.mousedown) {
            cursor.mousedown = false;
            if (percent >= 0.35) {
                document.querySelectorAll(".android-unlock").forEach(el => {
                    el.style.animationFillMode = 'forwards';
                    el.classList.add("activate");
                });
                nextscreen()
            } else {
                document.querySelectorAll(".android-unlock").forEach(el => {
                    let val = el.style.animationDelay;
                    el.style.animationDelay = `calc(-1.5s - ${val})`;
                    el.style.animationDirection = "reverse";
                    el.classList.add("activate");
                    setTimeout(() => {
                        el.style.animationDirection = "";
                        el.style.animationDelay = "";
                        el.classList.remove("activate");
                        el.style.animation = "none";
                        void el.offsetWidth;
                        el.style.animation = "";
                    }, -parseFloat(val.replace('calc(', '').replace(')', '').replace('s', '')) * 1000);
                });
            }
        }
    }

    let statusMessage = $state("");
    let instructionsB = $state();
    let dailyB = $state();
    let settingsPrompt = $state(false);

    function instructionsF(event) {
        if (!this.clickOnce) {
            // dark mode
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                instructionsB.style.backgroundColor = "color-mix(in oklab, var(--color-neutral-700) 100%, transparent)";
            } else {
                instructionsB.style.backgroundColor = "color-mix(in oklab, var(--color-neutral-300) 100%, transparent)";
            }
            instructionsB.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.23)";
            statusMessage = "Tap again to open"
            this.clickOnce = true;
            setTimeout(() => {
                if (!instructionsB) return;
                statusMessage = "";
                instructionsB.style.backgroundColor = "";
                instructionsB.style.boxShadow = "";
                this.clickOnce = false;
            }, 1000);
        } else {
            statusMessage = "";
            settingsPrompt = true;
        }
    }
    function dailyF(event) {
        if (!this.clickOnce) {
            // dark mode
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                dailyB.style.backgroundColor = "color-mix(in oklab, var(--color-neutral-700) 100%, transparent)";
            } else {
                dailyB.style.backgroundColor = "color-mix(in oklab, var(--color-neutral-300) 100%, transparent)";
            }
            dailyB.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.23)";
            statusMessage = "Tap again to open"
            this.clickOnce = true;
            setTimeout(() => {
                if (!dailyB) return;
                statusMessage = "";
                dailyB.style.backgroundColor = "";
                dailyB.style.boxShadow = "";
                this.clickOnce = false;
            }, 1000);
        } else {
            statusMessage = "";
            dailyPrompt = true;
        }
    }
    let difficulty = $state(0);
    let gamemode = $state(0);
</script>

<svelte:window on:mousedown={down} on:mousemove={move} on:mouseup={up} on:touchend|nonpassive={up}
               on:touchmove|nonpassive={move} on:touchstart|nonpassive={down}/>

{#if settingsPrompt}
    <div preventInteraction class="absolute w-full h-full flex items-center px-5 bg-neutral-800/75 z-500" in:fade={{duration: 200, easing: cubicOut}} out:fade={{duration: 400, easing: cubicOut}}>
        <div class="bg-neutral-200 dark:bg-neutral-700 w-full px-4 pt-4 pb-2" in:fly={{y: 40, duration: 200, easing: cubicOut}} out:fly={{y: 40, duration: 400, easing: cubicOut}}>
            <div class="text-xl mb-2 font-bold">
                Difficulty and Mode
            </div>
            <div class="text-sm mb-5 space-y-2">
                <div class="flex flex-row items-start space-x-2">
                    <div class="mt-1.5">Difficulty:</div>
                    <div class="flex flex-col w-full">
                        <div class="flex flex-row justify-evenly bg-neutral-200 dark:bg-neutral-800 border-2 border-neutral-500 dark:border-neutral-500 rounded-lg overflow-hidden *:p-1 *:transition-all *:cursor-pointer divide-x divide-white">
                            <button onclick={() => difficulty = 0} class="flex-1 {difficulty === 0 ? 'bg-neutral-300 dark:bg-neutral-700 text-black dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}">Easy</button>
                            <button onclick={() => difficulty = 1} class="flex-1 {difficulty === 1 ? 'bg-neutral-300 dark:bg-neutral-700 text-black dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}">Medium</button>
                            <button onclick={() => difficulty = 2} class="flex-1 {difficulty === 2 ? 'bg-neutral-300 dark:bg-neutral-700 text-black dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}">Hard</button>
                            <button onclick={() => difficulty = 3} class="flex-1 {difficulty === 3 ? 'bg-neutral-300 dark:bg-neutral-700 text-black dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}">Impossible</button>
                        </div>
                        <div class="text-xs text-neutral-700 dark:text-neutral-300 mt-1">
                            {#if difficulty === 0}
                                A random 4-digit PIN
                            {:else if difficulty === 1}
                                A random 6-digit PIN
                            {:else if difficulty === 2}
                                A random 8-digit PIN. This should be hard enough on its own.
                            {:else if difficulty === 3}
                                A random number of digits and a random PIN. Even if the digits appear to be in the correct location, you may not be correct...
                            {/if}
                        </div>
                    </div>
                </div>
                <div class="flex flex-row items-start space-x-2">
                    <div class="mt-1.5">Gamemode:</div>
                    <div class="flex flex-col w-full">
                        <div class="flex flex-row justify-evenly bg-neutral-200 dark:bg-neutral-800 border-2 border-neutral-500 dark:border-neutral-500 rounded-lg overflow-hidden *:p-1 *:transition-all *:cursor-pointer divide-x divide-white">
                            <button onclick={() => gamemode = 0} class="flex-1 {gamemode === 0 ? 'bg-neutral-300 dark:bg-neutral-700 text-black dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}">Normal</button>
                            <button onclick={() => gamemode = 1} class="flex-1 {gamemode === 1 ? 'bg-neutral-300 dark:bg-neutral-700 text-black dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}">Trycount</button>
                            <button onclick={() => gamemode = 2} class="flex-1 {gamemode === 2 ? 'bg-neutral-300 dark:bg-neutral-700 text-black dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}">Minute</button>
                        </div>
                        <div class="text-xs text-neutral-700 dark:text-neutral-300 mt-1">
                            {#if gamemode === 0}
                                No limits, no expectations. You have the freedom you need. If you still need to quit, then maybe you should. It doesn't get easier than this.
                            {:else if gamemode === 1}
                                You have 10 tries to guess the PIN. 10 tries is all it takes. Losing on this gamemode is understandable. I get it.
                            {:else if gamemode === 2}
                                You have 1 minute. 1 minute to correctly guess the PIN. Trust me, there's a strategy, and randomly guessing is NOT the strategy.
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-row justify-end items-end space-x-2">
                <!--suppress CommaExpressionJS -->
                <button onclick={() => (difficulty = activated.difficulty, gamemode = activated.gamemode, settingsPrompt = false)} class="cursor-pointer bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300/50 dark:hover:bg-neutral-600 active:bg-neutral-400/50 dark:active:bg-neutral-500 transition-colors p-2 text-left uppercase font-bold flex flex-row items-center">
                    <img src="/android/close.svg" alt="Restart" class="w-6 aspect-square mr-1 invert dark:invert-0">
                    <span class="text-sm mr-2">Cancel</span>
                </button>
                <!--suppress CommaExpressionJS -->
                <button onclick={() => (activated.difficulty = difficulty, activated.gamemode = gamemode, settingsPrompt = false)} class="cursor-pointer bg-amber-300 dark:bg-amber-700 hover:bg-amber-400/50 dark:hover:bg-amber-600 active:bg-amber-500/50 dark:active:bg-amber-500 transition-colors p-2 text-left uppercase font-bold flex flex-row items-center">
                    <img src="/android/play.svg" alt="Continue" class="w-6 aspect-square mr-1 invert dark:invert-0">
                    <span class="text-sm mr-2">Set</span>
                </button>
            </div>
        </div>
    </div>
{/if}

{#if dailyPrompt}
    <div preventInteraction class="absolute w-full h-full flex items-center px-5 bg-neutral-800/75 z-500" in:fade={{duration: 200, easing: cubicOut}} out:fade={{duration: 400, easing: cubicOut}}>
        <div class="bg-neutral-200 dark:bg-neutral-700 w-full px-4 pt-4 pb-2" in:fly={{y: 40, duration: 200, easing: cubicOut}} out:fly={{y: 40, duration: 400, easing: cubicOut}}>
            <div class="text-xl mb-2 font-bold">
                Pindle Daily Game
            </div>
            <div class="text-sm mb-5 space-y-2">
                {#await daily.req}
                {:then req}
                    <div class="flex flex-col space-y-2">
                        <div class="text-neutral-700 dark:text-neutral-300">
                            {#if daily.done}
                                You have already played today's game. Come back tomorrow for a new challenge!
                            {:else}
                                <div class="flex flex-col">
                                    <div>
                                        You can play the daily game once per day, obviously. <br>
                                        Today's game is of a <b>{Constants.difficulty[req?.difficulty]} difficulty</b>, and you can
                                        place on the leaderboard if you do well. (Realistically everyone's on the leaderboard, it's
                                        just a matter of how low they are...)
                                    </div>
                                    <div class="flex flex-row items-center space-x-2 mt-2">
                                        <input type="checkbox" bind:checked={daily.leaderboard} class="cursor-pointer">
                                        <div>I want to play to join the leaderboard, and thereforth agree to the Terms of Service and Privacy Policy.</div>
                                    </div>
                                    {#if daily.leaderboard}
                                        <div class="flex flex-row items-center space-x-2 mt-2">
                                            <div class="flex-shrink-0">Public Name:</div>
                                            <input type="text" bind:value={daily.name} class="flex-grow border-1 border-neutral-500/75 p-1 rounded-full">
                                        </div>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    </div>
                {/await}
            </div>
            <div class="flex flex-row justify-end items-end space-x-2">
                <button onclick={() => dailyPrompt = false} class="cursor-pointer bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300/50 dark:hover:bg-neutral-600 active:bg-neutral-400/50 dark:active:bg-neutral-500 transition-colors p-2 text-left uppercase font-bold flex flex-row items-center">
                    <img src="/android/close.svg" alt="Restart" class="w-6 aspect-square mr-1 invert dark:invert-0">
                    <span class="text-sm mr-2">Cancel</span>
                </button>
                <button onclick={() => daily.load = dailyStart()} class="cursor-pointer bg-amber-300 dark:bg-amber-700 hover:bg-amber-400/50 dark:hover:bg-amber-600 active:bg-amber-500/50 dark:active:bg-amber-500 transition-colors p-2 text-left uppercase font-bold flex flex-row items-center">
                    <img src="/android/play.svg" alt="Continue" class="w-6 aspect-square mr-1 invert dark:invert-0">
                    <span class="text-sm mr-2">
                    {#if !daily.load}
                        Play
                    {:else}
                        {#await daily.load}
                            loading...
                        {:catch error}
                            Play
                        {/await}
                    {/if}
                </span>
                </button>
            </div>
            {#await daily.load catch error}
                <div class="text-red-500 mt-2">
                    {error.message}
                </div>
            {/await}
        </div>
    </div>
{/if}

{#if !cursor.auxExit}
    <div class="relative h-full pt-2 xs:p-0" in:fly|global={{y: "100%"}} out:fade|global={{duration: 500}}
         onoutrostart={() => document.querySelector(".android-unlock-background").classList.add("activate")}
         onoutroend={() => cursor.auxExit?.()}>
        <div class="h-full android-unlock android-unlock-screen">
            <div class="absolute top-4 left-4 text-neutral-100">
                <b>an atomtables game</b>
            </div>
            <div class="absolute top-3 right-3 flex flex-row-reverse items-center">
                <img src="/android/avatar.png" alt="Android Default Avatar" class="w-8 h-8">
                <img src="/android/battery.png" alt="Android Default Avatar"
                     class="h-5 aspect-square ml-1">
                <img src="/android/cellular.png" alt="Android Default Avatar"
                     class="h-5 aspect-square ml-1">
                <img src="/android/wifi.png" alt="Android Default Avatar"
                     class="h-5 aspect-square ml-1">
                <img src="/android/bluetooth.png" alt="Android Default Avatar"
                     class="h-5 aspect-square ml-1">
            </div>
            <div class="absolute top-32 xs:top-48 w-full text-center">
                <div class="android-unlock android-unlock-clock">
                    <div class="w-full text-center text-8xl xs:text-9xl font-thin text-neutral-100">
                        PINdle
                    </div>
                    <div class="w-full text-center text-neutral-100">
                        {date.toLocaleDateString('en-us', {weekday: 'long', month: 'long', day: 'numeric'})}
                    </div>
                </div>
                <div class="px-5 z-0">
                    <button preventInteraction onclick={instructionsF} bind:this={instructionsB}
                            class="z-0 transition-colors duration-150 ease-in-out border-b-1 border-neutral-500/50 px-2 py-3 mt-4 bg-neutral-300/80 dark:bg-neutral-700/60  flex flex-row w-full items-center android-unlock android-unlock-notifications">
                        <img src="favicon.svg" alt="Pindle Icon" class="w-10 h-10 mr-2 rounded-full">
                        <span class="flex flex-col text-left">
                            <span class="">Change your difficulty</span>
                            <span class="text-sm text-neutral-600 dark:text-neutral-400">Add a little challenge, maybe spice things up.</span>
                        </span>
                    </button>
                    {#if !daily.done}
                        {#await daily.req then req}
                            <button preventInteraction onclick={dailyF} bind:this={dailyB}
                                    class="z-0 transition-colors duration-150 ease-in-out border-b-1 border-neutral-500/50 px-2 py-3 bg-neutral-300/80 dark:bg-neutral-700/60  flex flex-row w-full items-center android-unlock android-unlock-notifications">
                                <img src="favicon.svg" alt="Pindle Icon" class="w-10 h-10 mr-2 rounded-full">
                                <span class="flex flex-col text-left">
                                <span class="">Daily Game?</span>
                                    <span class="text-sm text-neutral-500 dark:text-neutral-400">Play a {Constants.difficulty[req?.difficulty]} game and have a chance to get on the leaderboard.</span>
                                </span>
                            </button>
                        {/await}
                    {/if}
                </div>
            </div>
            <div class="absolute bottom-16 text-sm text-neutral-200 opacity-85 w-full text-center z-50">
                {#if statusMessage}
                    <i>{statusMessage}</i>
                {:else}
                    <div class="flex flex-col justify-center">
                        <span>Swipe <span class="hidden md:inline">(or click)</span> to start an <b>{difficultyS} {gamemodeS}</b> game</span>
                        <span class="text-xs">Swipe left <span class="hidden md:inline">(or double-click left)</span> to view instructions</span>
                    </div>
                {/if}
            </div>
            <div class="z-50 absolute bottom-6 w-full flex flex-row justify-between items-center px-6">
                <img preventInteraction src="favicon.svg" alt="Difficulty Selector"
                     class="z-51 h-6 aspect-square opacity-75 android-unlock android-unlock-icons-inactive">
                <img src="/android/lock.png" alt="Android Default Avatar"
                     class="{cursor.nearIt && 'z-50'} h-6 aspect-square opacity-75 android-unlock android-unlock-icons-active">
                <!--<img src="favicon.svg" alt="Android Default Avatar" class="h-6 aspect-square opacity-75"> for themes-->
                <div class="w-6"></div>
            </div>
        </div>
    </div>
{/if}
<div bind:this={appleftT}
     class="z-40 absolute -bottom-2 -left-2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 transition-all duration-300 bg-neutral-50 rounded-full"
     out:fade|global={{easing: quintOut, duration: 300}}></div>
{#if cursor.nearIt || cursor.deactivateIt}
    <img src="favicon.svg" alt="Android Default Avatar"
         transition:fade|global={{duration: 500, easing: quintOut}}
         class="z-50 absolute bottom-6 left-6 h-6 aspect-square opacity-75 android-unlock android-unlock-icons-active">
{/if}