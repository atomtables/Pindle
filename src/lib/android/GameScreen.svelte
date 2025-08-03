<script>
    import {onMount, tick} from "svelte";
    import {crossfade, fade, scale, slide, fly} from "svelte/transition";
    import {flip} from "svelte/animate";
    import {cubicOut, quintIn} from "svelte/easing";
    import {Counter} from "$lib/gameplay/Counter.js"
    import {RNG} from "$lib/gameplay/RNG.js";
    import Constants from "$lib/gameplay/Constants.js";
    import { fadescale, fadeslide } from "$lib/transitions";
    import { formatTime } from "$lib/helpers.js";
    import {LocalStore} from "$lib/LocalState.svelte.js";

    let { old: data, next = $bindable() } = $props();

    let answer = null;
    let status = $state("")
    let active = {};
    let lockPin = $state(false);
    let isToUnlock = $state(false)
    let showNum = $state({})
    let resolveNum = ({});
    let input = $state("");
    let exitPrompt = $state(false);

    let secondsRemaining = $state(-1);
    let timeRemainingS = $derived(formatTime(secondsRemaining))
    $effect(() => {
        if (data.gamemode === Constants.gamemodeId.minute && secondsRemaining === 0) loss("timeout")
    })

    let correctBeads = $state([]);
    let currentAttempt = $state(0);
    let shownAttempt = $state(0);

    let bestScore = new LocalStore(`best-${data.difficulty}-${data.gamemode}`, {
        attempts: 0,
        time: 0
    })

    const isFull = $derived( Constants.reachedLimit(data.difficulty, input.length) );
    $effect(() => { lockPin = isFull }) // i love you svelte developers

    const victory = () => {
        // see if current is better than best
        let best = false;
        if (Constants.conversion.get(bestScore.value.attempts, bestScore.value.time) <
            Constants.conversion.get(currentAttempt, activated.gamemode === Constants.gamemodeId.minute ? Constants.minute[activated.difficulty] - gamescreen.time : gamescreen.time)) {
            bestScore.value = {
                attempts: currentAttempt,
                time: activated.gamemode === Constants.gamemodeId.minute ? Constants.minute[activated.difficulty] - gamescreen.time : gamescreen.time
            }
            best = true;
        }
        next = ({
            complete: true,
            win: true,
            attempts: currentAttempt,
            tries: correctBeads,
            correct: answer,
            time: secondsRemaining,
            best
        });
    }
    const loss = factor => {
        next = ({
            complete: true,
            win: false,
            [factor]: true,
            attempts: currentAttempt,
            tries: correctBeads,
            correct: answer,
            time: secondsRemaining
        })
        console.log(next);
    };

    const onkeydown = e => {
        if (e.key === 'Backspace') {
            if (lockPin) return;
            if (input.length > 0) {
                input = input.slice(0, -1);
                // idk what this does??? I WALK A LONELY ROAD THE ONLY ONE THAT I HAVE EVER KNOWN
                // showNum[input.length] = new Promise(resolve => {
                //     resolveNum[input.length] = resolve;
                //     resolveNum[input.length + 1]?.();
                // });
            }
            return
        }
        // enter key
        if (e.key === "Enter") {
            if (lockPin) return;
            if (data.difficulty === Constants.difficultyId.impossible) submit();
            return;
        }
        if (e.key >= '0' && e.key <= '9') {
            const index = Number(e.key);
            const el = document.querySelector(`.android-pin-number:nth-child(${index > 0 ? index : 11})`);
            if (el) {
                el.classList.add("bg-neutral-500/50");
                active[index] = true;
                setTimeout(() => {
                    active[index] = false;
                    el.classList.remove("bg-neutral-500/50");
                }, 125);
            }
            onpinclick(e.key);
        } else if (e.key === 'Enter') {
            if (lockPin) return;
            if (data.difficulty === Constants.difficultyId.impossible) submit();
        } else if (e.key === 'Escape') {
            if (lockPin) return;
            exitPrompt = true;
        }
    };

    let timeoutExecutedOnce = false;
    const submit = () => {
        status = "";
        for (let [attempt] of correctBeads) {
            if (attempt === input) {
                status = "You entered that again...";
                break;
            }
        }
        showattempt()
        lockPin = true;
        isToUnlock = true;
        if (!timeoutExecutedOnce) timeoutExecutedOnce = setTimeout(() => {
            if (!next.history && data.gamemode === Constants.gamemodeId.trycount && currentAttempt >= Constants.trycount[data.difficulty]) {
                status = "";
                tick().then(() => loss("attempts"));
                return;
            }
            if (!next.history && input === answer) victory()
            else {
                input = ""
                timeoutExecutedOnce = isToUnlock = lockPin = false;
            }
        }, data.gamemode === Constants.gamemodeId.minute ? 300 : Constants.attemptTimeout(input.length))
    }
    const onpinclick = e => {
        if (!e || lockPin) return;
        input += e;

        if (isFull) submit()

        showNum[input.length - 1] = new Promise(resolve => {
            resolveNum[input.length - 1] = resolve;
            resolveNum[input.length - 2]?.();
            if (isFull) {
                resolve()
                return;
            }
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    };
    const showattempt = () => {
        let beads = [];
        let counter = new Counter(input);
        let inputs = counter.result;
        let answerdup = answer.split('');
        // get exact places
        for (let i = 0; i < input.length; i++) {
            if (input[i] === answer?.[i]) {
                beads.push(2);
                inputs[input[i]]--;
                answerdup[i] = null;
            }
        }
        for (let [k, v] of counter) {
            for (let j = 0; j < v; j++) {
                if (answerdup.includes(k)) {
                    answerdup[answerdup.indexOf(k)] = null;
                    beads.push(1);
                } else {
                    beads.push(0);
                }
            }
        }

        correctBeads.push([input, beads.sort().reverse()]);
        shownAttempt = ++currentAttempt;
    }

    let historicalAttempts = $state();

    const attemptTotal = $derived(
        next.history ? historicalAttempts :
            data.gamemode === Constants.gamemodeId.trycount ? Constants.trycount[data.difficulty] : currentAttempt
    );

    onMount(() => {
        let bull;
        if (!next.history) {
            answer = new RNG(data.difficulty).get()
            isToUnlock = false;
            lockPin = false;
            input = "";
            correctBeads = [];
            currentAttempt = 0;
            shownAttempt = 0;
            if (data.gamemode === Constants.gamemodeId.minute) {
                secondsRemaining = Constants.minute[data.difficulty];
                bull = setInterval(() => {
                    if (secondsRemaining > 0) {
                        secondsRemaining--;
                    }
                }, 1000);
            } else {
                secondsRemaining = 0;
                bull = setInterval(() => {
                    secondsRemaining++;
                }, 1000)
            }
        } else {
            answer = next.correct;
            isToUnlock = false;
            lockPin = false;
            input = "";
            correctBeads = next.tries;
            historicalAttempts = next.attempts;
            if (correctBeads.at(-1)[0] !== answer) {
                correctBeads.push([answer, Array(answer.length).fill(2)])
                currentAttempt = next.attempts + 1;
            } else currentAttempt = next.attempts;
            shownAttempt = currentAttempt;
            secondsRemaining = next.time || 0;
        }

        document.querySelectorAll(".android-pin-number").forEach((el, i) => {
            el.addEventListener("touchstart", e => {
                if (window.matchMedia('(width < 40rem)').matches) {
                    if ("vibrate" in navigator) {
                        navigator.vibrate(1000);
                    }
                    e.preventDefault()
                    el.classList.add("bg-neutral-500/50");
                    active[i] = true;
                    setTimeout(() => {
                        active[i] = false;
                    }, 75);
                    onpinclick(e.currentTarget.querySelector(".n")?.textContent?.trim())
                }
            });
            el.addEventListener("touchend", () => {
                if (window.matchMedia('(width < 40rem)').matches) {
                    if (!active[i]) el.classList.remove("bg-neutral-500/50");
                    else {
                        setTimeout(() => {
                            el.classList.remove("bg-neutral-500/50");
                        }, 65);
                    }
                }
            });
            if (!el.classList.contains("exclude")) {
                el.addEventListener("click", e => {
                    onpinclick(e.currentTarget.querySelector(".n").textContent.trim())
                });
            }
        });
        return () => clearInterval(bull)
    })
</script>

<svelte:window onkeydown={onkeydown}/>

<div class="absolute bottom-0 flex flex-col w-full text-center py-2">
    {#if correctBeads.length > 0 || data.gamemode !== Constants.gamemodeId.normal}
        <div class="text-sm text-neutral-400" in:fly={{y: 40}} out:fly|global={{y: -100, delay: 0, opacity: 0, easing: quintIn}}>
            {shownAttempt}/{attemptTotal} {data.gamemode === Constants.gamemodeId.minute ? `• ${timeRemainingS}` : ''} {shownAttempt > 0 ? `• ${correctBeads[shownAttempt - 1][0]}` : ''}
        </div>
        <div class="flex flex-row items-center justify-center" in:fly={{y: 40, delay: 50}} out:fly|global={{y: -100, delay: 0, opacity: 0, easing: quintIn}}>
            <button class="h-10 w-10 grid place-items-center rounded-full ease-linear duration-75 disabled:opacity-60 disabled:cursor-not-allowed not-disabled:hover:bg-neutral-400/50 not-disabled:hover:dark:bg-neutral-700/50 not-disabled:active:bg-neutral-500/50 not-disabled:dark:active:bg-neutral-500/50 cursor-pointer transition-all" onclick={() => shownAttempt--} disabled={shownAttempt <= 1}>
                <img alt="backward" class="h-5 right-1" src="/android/back.svg" />
            </button>
            <div class="flex flex-col items-center justify-between h-4">
                {#if correctBeads.length > 0}
                    {#each correctBeads as [attempt, beads], i (i)}
                        <div animate:flip>
                            {#if shownAttempt - 1 === i}
                                <div class="flex flex-row items-center justify-center" transition:slide={{axis: 'y'}}>
                                    {#each beads as bead, j (j)}
                                        <div in:fade|global={{duration: 300, delay: 150 * (j + 1)}} class="flex items-center justify-center">
                                            {#if bead === 2}
                                                <img alt="Dot Fill" class="h-4 aspect-square w-8" src="/android/dotfill.svg" />
                                            {:else if bead === 1}
                                                <img alt="Dot Fill" class="h-4 aspect-square w-8" src="/android/dot.svg" />
                                            {:else}
                                                <img alt="Dot Fill" class="h-4 aspect-square w-8" src="/android/dotempty.svg">
                                            {/if}
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/each}
                {:else}
                    <div class="text-neutral-400 text-sm/4 ">No attempts yet</div>
                {/if}
            </div>
            <button class="h-10 w-10 grid place-items-center rounded-full ease-linear duration-75 disabled:opacity-60 disabled:cursor-not-allowed not-disabled:hover:bg-neutral-400/50 not-disabled:hover:dark:bg-neutral-700/50 not-disabled:active:bg-neutral-500/50 not-disabled:dark:active:bg-neutral-500/50 cursor-pointer transition-all" onclick={() => shownAttempt++} disabled={shownAttempt >= currentAttempt}>
                <img alt="forward" class="h-5 right-1 " src="/android/forward.svg">
            </button>
        </div>
    {/if}
    {#if status}
        <div class="text-sm text-neutral-300" transition:slide={{y: 40}}>{status}</div>
    {/if}
    <div class="px-5" in:fly={{delay: 50, y: 40}} out:fly={{y: -100, delay: 100, opacity: 0, easing: quintIn}}>
        <div class="border-b-2 border-neutral-500 text-5xl  font-thin w-full p-2">
            <div class="flex flex-row justify-center items-center">
                <div class="w-max mx-auto h-8 flex flex-row items-center justify-center overflow-ellipsis">
                    {#each input as digit, i (i)}
                        <div animate:flip={{ duration: 300 }} out:slide={{duration: isToUnlock ? 300 : 0}} class="grid place-items-center">
                            {#if i < 14}
                                <!--{#await showNum[i]}-->
                                <!--    <div class="text-2xl font-light mx-1.25" style="font-family: 'Roboto Mono', monospace;"-->
                                <!--         in:scale out:fadeScale={{duration: 300}}>{digit}</div>-->
                                <!--{:then x}-->
                                <!--    <img alt="Dot Fill" class="h-2 aspect-square mx-2" src="/android/dotfill.svg"-->
                                <!--         in:fadeScale={{delay: 60, start: 0.1}}>-->
                                <!--{/await}-->
                                {#await showNum[i]}
                                    <div class="text-2xl font-light mx-1.25 text-neutral-100" style="font-family: 'Roboto Mono', monospace;"
                                         in:scale out:fadescale>{digit}</div>
                                {:then x}
                                    <img alt="Dot Fill" class="h-2 aspect-square w-6" src="/android/dotfill.svg"
                                         in:fadeslide={{delay: 100, duration: 80}}>
                                {/await}
                            {/if}
                            {#if i === 14}
                                <div class="text-2xl font-light mr-2" style="font-family: 'Roboto', monospace;"
                                     in:scale out:fadescale>...</div>
                            {/if}
                        </div>
                    {/each}
                </div>
                <button class="absolute right-2 h-12 w-12 grid place-items-center rounded-full ease-linear duration-75 hover:bg-neutral-400/50 dark:hover:bg-neutral-700/50 active:bg-neutral-500/50 dark:active:bg-neutral-500/50 cursor-pointer transition-all" onclick={() => !lockPin && (input = input.slice(0, -1))} disabled={input.length <= 0 || lockPin}>
                    <img alt="backspace" class="h-5 right-1" src="/android/backspace.svg">
                </button>
            </div>
        </div>
    </div>
    <div class="*:android-pin-number grid grid-cols-3 grid-rows-3 *:flex *:flex-col *:rounded-full *:ease-linear *:duration-75 *:hover:bg-neutral-300/50 *:dark:hover:bg-neutral-700/50 *:active:bg-neutral-500/50 *:dark:active:bg-neutral-500/50 *:cursor-pointer *:transition-all *:webkit-transition-all *:transition-discrete *:items-center *:justify-center *:text-3xl *:text-neutral-200 px-10 pt-3 pb-3 *:p-3 *:xs:p-5">
        <button class="android-pin-number" in:fly={{y: 40, delay: 100}} out:fly={{y: -100, delay: 100, opacity: 0, easing: quintIn}}>
            <span class="font-light n">1</span>
            <span class="text-xs text-neutral-400 opacity-0">VOICE</span>
        </button>
        <button class="android-pin-number" in:fly={{y: 40, delay: 100}} out:fly={{y: -100, delay: 100, opacity: 0, easing: quintIn}}>
            <span class="font-light n">2</span>
            <span class="text-xs text-neutral-400">ABC</span>
        </button>
        <button class="android-pin-number" in:fly={{y: 40, delay: 100}} out:fly={{y: -100, delay: 100, opacity: 0, easing: quintIn}}>
            <span class="font-light n">3</span>
            <span class="text-xs text-neutral-400">DEF</span>
        </button>
        <button class="android-pin-number" in:fly={{y: 40, delay: 150}} out:fly={{y: -100, delay: 150, opacity: 0, easing: quintIn}}>
            <span class="font-light n">4</span>
            <span class="text-xs text-neutral-400">GHI</span>
        </button>
        <button class="android-pin-number" in:fly={{y: 40, delay: 150}} out:fly={{y: -100, delay: 150, opacity: 0, easing: quintIn}}>
            <span class="font-light n">5</span>
            <span class="text-xs text-neutral-400">JKL</span>
        </button>
        <button class="android-pin-number" in:fly={{y: 40, delay: 150}} out:fly={{y: -100, delay: 150, opacity: 0, easing: quintIn}}>
            <span class="font-light n">6</span>
            <span class="text-xs text-neutral-400">MNO</span>
        </button>
        <button class="android-pin-number" in:fly={{y: 40, delay: 200}} out:fly={{y: -100, delay: 200, opacity: 0, easing: quintIn}}>
            <span class="font-light n">7</span>
            <span class="text-xs text-neutral-400">PQRS</span>
        </button>
        <button class="android-pin-number" in:fly={{y: 40, delay: 200}} out:fly={{y: -100, delay: 200, opacity: 0, easing: quintIn}}>
            <span class="font-light n">8</span>
            <span class="text-xs text-neutral-400">TUV</span>
        </button>
        <button class="android-pin-number" in:fly={{y: 40, delay: 200}} out:fly={{y: -100, delay: 200, opacity: 0, easing: quintIn}}>
            <span class="font-light n">9</span>
            <span class="text-xs text-neutral-400">WXYZ</span>
        </button>
        <div onclick={() => (next.complete = true, next.history = false)} class="android-pin-number {!next.history && 'exclude opacity-0'} !cursor-default" in:fly={{y: 40, delay: 250}} out:fly={{y: -100, delay: 250, opacity: 0, easing: quintIn}}>
            <span class="font-light n">back</span>
        </div>
        <button class="android-pin-number" in:fly={{y: 40, delay: 250}} out:fly={{y: -100, delay: 250, opacity: 0, easing: quintIn}}>
            <span class="text-[7px] opacity-0">s</span>
            <span class="font-light n">0</span>
            <span class="text-[7px] opacity-0">s</span>
        </button>
        <button class="android-pin-number {data.difficulty !== Constants.difficultyId.impossible ? 'opacity-0 !cursor-default' : 'exclude'}" in:fly={{y: 40, delay: 250}} out:fly={{y: -100, delay: 250, opacity: 0, easing: quintIn}} onclick={() => data.difficulty === Constants.difficultyId.impossible && submit()}>
            <img alt="Done" class="h-6 aspect-square opacity-75 android-unlock android-unlock-icons-active"
                 src="/android/done.png">
        </button>
    </div>
    <button onclick={() => exitPrompt = true} class="rounded-full text-sm text-neutral-300 mb-3 cursor-pointer hover:bg-neutral-700 active:bg-neutral-600 transition-all w-max mx-auto p-2" in:fly={{y: 40, delay: 300}} out:fly={{y: -100, delay: 300, opacity: 0, easing: quintIn}}>
        Emergency Forfeit
    </button>
</div>

{#if exitPrompt}
    <div class="absolute w-full h-full flex items-center px-5 bg-neutral-800/75" transition:fade={{duration: 200, easing: cubicOut}} onclick={() => exitPrompt = false} onkeydown={e => e.key === 'Escape' && (exitPrompt = false)} role="dialog" tabindex="-1">
        <div class="bg-neutral-200 dark:bg-neutral-700 w-full px-4 pt-4 pb-2" transition:fly={{y: 40, duration: 200, easing: cubicOut}}>
            <div class="text-xl mb-2 font-bold">
                Are you sure you want to quit?
            </div>
            <div class="text-sm mb-5">
                You will lose your progress and have to restart the game.
            </div>
            <div class="flex flex-row justify-end items-end space-x-2">
                <button onclick={() => tick().then(() => loss("quit"))} class="cursor-pointer bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300/50 dark:hover:bg-neutral-600 active:bg-neutral-400/50 dark:active:bg-neutral-500 transition-colors p-2 text-left uppercase font-bold flex flex-row items-center">
                    <img src="/android/close.svg" alt="Restart" class="w-6 aspect-square mr-1 invert dark:invert-0">
                    <span class="text-sm mr-2">Quit</span>
                </button>
                <button onclick={() => exitPrompt = false} class="cursor-pointer bg-amber-300 dark:bg-amber-700 hover:bg-amber-400/50 dark:hover:bg-amber-600 active:bg-amber-500/50 dark:active:bg-amber-500 transition-colors p-2 text-left uppercase font-bold flex flex-row items-center">
                    <img src="/android/play.svg" alt="Continue" class="w-6 aspect-square mr-1 invert dark:invert-0">
                    <span class="text-sm mr-2">Continue</span>
                </button>
            </div>
        </div>
    </div>
{/if}