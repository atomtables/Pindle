<script>
    import {onMount} from "svelte";
    import {crossfade, fade, scale, slide, fly} from "svelte/transition";
    import {flip} from "svelte/animate";
    import {cubicOut} from "svelte/easing";
    import {Counter} from "$lib/gameplay/Counter.js"

    let { difficulty, answer } = $props();

    let status = $state("Hello")
    let active = $state({});
    let lockPin = $state(false);
    let isToUnlock = $state(false)
    let showNum = $state({})
    let resolveNum = $state({});
    let input = $state("");

    let correctBeads = $state([]);
    let currentAttempt = $state(0);
    let shownAttempt = $state(0);

    const isFull = $derived((difficulty === 'easy' && input.length >= 4) ||
        (difficulty === 'medium' && input.length >= 6) ||
        (difficulty === 'hard' && input.length >= 8));
    const onkeydown = e => {
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
            onpinclick(index);
        } else if (e.key === 'Enter') {
        }
    };
    const calculatetimeout = () => {
        return 750
    }
    const onpinclick = e => {
        if (!e || lockPin) return;
        input += e;
        showNum[input.length - 1] = new Promise(resolve => {
            resolveNum[input.length - 1] = resolve;
            resolveNum[input.length - 2]?.();
            if (isFull) {
                showattempt()
                isToUnlock = true;
                lockPin = true;
                resolve()
            }
            setTimeout(() => {
                resolve();
            }, 1000);
        });

        setTimeout(() => {
            if (isFull) {
                if (input === answer) {
                    status = "Unlocked!";
                    setTimeout(() => {
                        isToUnlock = false;
                        lockPin = false;
                        input = "";
                        correctBeads = [];
                        currentAttempt = 0;
                        shownAttempt = 0;
                    }, 500);
                } else {
                    status = "Wrong PIN";
                    setTimeout(() => input = "", 600)
                    setTimeout(() => {
                        isToUnlock = false;
                        lockPin = false;
                    }, 800)
                }
            }
        }, calculatetimeout())
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
                    beads.push(1);
                } else {
                    beads.push(0);
                }
            }
        }

        correctBeads.push(beads.sort().reverse());
        shownAttempt = ++currentAttempt;
    }

    function fadescale(node, {delay = 0, duration = 300, easing = cubicOut, start = 0.8}) {
        return {
            delay,
            duration,
            easing,
            css: (t) => {
                const eased = easing(t);
                return `
                  opacity: ${eased};
                  transform: scale(${start + (1 - start) * eased});
                  display: ${t > 0.3 ? 'block' : 'none'};
                `;
            }
        };
    }
    function fadeslide(node, options = {}) {
        const fadeConfig = fade(node, options);
        const slideConfig = slide(node, options);

        return {
            delay: options.delay || 0,
            duration: options.duration || 300,
            easing: options.easing,
            css: (t, u) => {
                return `
                    ${fadeConfig.css(t, u)}
                    ${slideConfig.css(t, u)}
                    display: ${t > 0.9 ? 'block' : 'none'};
                `;
            }
        };
    }
    const [send, receive] = crossfade({});

    onMount(() => {
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
    })
</script>

<svelte:window onkeydown={onkeydown}/>

<div class="absolute bottom-0 flex flex-col w-full text-center py-2">
    {#if correctBeads.length >= 0}
        <div class="text-xs text-neutral-400">
            {shownAttempt}/{currentAttempt}
        </div>
        <div class="flex flex-row items-center justify-center">
            <button class="h-12 w-12 grid place-items-center rounded-full ease-linear duration-75 disabled:opacity-60 not-disabled:hover:bg-neutral-300/50 not-disabled:hover:dark:bg-neutral-700/50 not-disabled:active:bg-neutral-500/50 not-disabled:dark:active:bg-neutral-500/50 cursor-pointer transition-all" onclick={() => shownAttempt--} disabled={shownAttempt <= 0}>
                <img alt="backspace" class="h-5 right-1 invert dark:invert-0" src="/android/back.svg">
            </button>
            <div class="flex flex-col items-center justify-between h-4">
                {#each correctBeads as beads, i (i)}
                    <div animate:flip>
                        {#if shownAttempt - 1 === i}
                            <div class="flex flex-row items-center justify-center" transition:slide={{axis: 'y'}}>
                                {#each beads as bead, j (j)}
                                    <div in:fade|global={{duration: 300, delay: 150 * (j+1)}} class="flex items-center justify-center">
                                        {#if bead === 2}
                                            <img alt="Dot Fill" class="h-4 aspect-square w-8 invert dark:invert-0" src="/android/dotfill.svg">
                                        {:else if bead === 1}
                                            <img alt="Dot Fill" class="h-4 aspect-square w-8 invert dark:invert-0" src="/android/dot.svg">
                                        {:else}
                                            <img alt="Dot Fill" class="h-4 aspect-square w-8 invert dark:invert-0" src="/android/dotempty.svg">
                                        {/if}
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
            <button class="h-12 w-12 grid place-items-center rounded-full ease-linear duration-75 disabled:opacity-60 not-disabled:hover:bg-neutral-300/50 not-disabled:hover:dark:bg-neutral-700/50 not-disabled:active:bg-neutral-500/50 not-disabled:dark:active:bg-neutral-500/50 not-disabled:cursor-pointer not-disabled:transition-all" onclick={() => shownAttempt++} disabled={shownAttempt >= currentAttempt}>
                <img alt="backspace" class="h-5 right-1 invert dark:invert-0" src="/android/forward.svg">
            </button>
        </div>
    {/if}
<!--    <div class="text-sm text-neutral-300" transition:fly={{y: 40}}>{status}</div>-->
    <div class="px-5" transition:fly={{delay: 50, y: 40}}>
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
                                    <div class="text-2xl font-light mx-1.25" style="font-family: 'Roboto Mono', monospace;"
                                         in:scale out:fadescale>{digit}</div>
                                {:then x}
                                    <img alt="Dot Fill" class="h-2 aspect-square w-6 invert dark:invert-0" src="/android/dotfill.svg"
                                         in:fadeslide={{delay: 80, duration: 80}}>
                                {/await}
                            {/if}
                            {#if i === 14}
                                <div class="text-2xl font-light mr-2" style="font-family: 'Roboto', monospace;"
                                     in:scale out:fadescale>...</div>
                            {/if}
                        </div>
                    {/each}
                </div>
                <button class="absolute right-2 h-12 w-12 grid place-items-center rounded-full ease-linear duration-75 hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 active:bg-neutral-500/50 dark:active:bg-neutral-500/50 cursor-pointer transition-all" onclick={() => input = input.slice(0, -1)} disabled={input.length <= 0}>
                    <img alt="backspace" class="h-5 right-1 invert dark:invert-0" src="/android/backspace.svg">
                </button>
            </div>
        </div>
    </div>
    <div class="*:android-pin-number grid grid-cols-3 grid-rows-3 *:flex *:flex-col *:rounded-full *:ease-linear *:duration-75 *:md:hover:bg-neutral-300/50 *:md:dark:hover:bg-neutral-700/50 *:md:active:bg-neutral-500/50 *:cursor-pointer *:transition-all *:webkit-transition-all *:transition-discrete *:items-center *:justify-center *:text-3xl *:dark:text-neutral-200 *:text-neutral-800 px-10 pt-3 pb-3 *:p-5">
        <button class="android-pin-number" transition:fly={{y: 40, delay: 100}}>
            <span class="font-light n">1</span>
            <span class="text-xs text-neutral-600 dark:text-neutral-400 opacity-0">VOICE</span>
        </button>
        <button class="android-pin-number" transition:fly={{y: 40, delay: 100}}>
            <span class="font-light n">2</span>
            <span class="text-xs text-neutral-600 dark:text-neutral-400">ABC</span>
        </button>
        <button class="android-pin-number" transition:fly={{y: 40, delay: 100}}>
            <span class="font-light n">3</span>
            <span class="text-xs text-neutral-600 dark:text-neutral-400">DEF</span>
        </button>
        <button class="android-pin-number" transition:fly={{y: 40, delay: 150}}>
            <span class="font-light n">4</span>
            <span class="text-xs text-neutral-600 dark:text-neutral-400">GHI</span>
        </button>
        <button class="android-pin-number" transition:fly={{y: 40, delay: 150}}>
            <span class="font-light n">5</span>
            <span class="text-xs text-neutral-600 dark:text-neutral-400">JKL</span>
        </button>
        <button class="android-pin-number" transition:fly={{y: 40, delay: 150}}>
            <span class="font-light n">6</span>
            <span class="text-xs text-neutral-600 dark:text-neutral-400">MNO</span>
        </button>
        <button class="android-pin-number" transition:fly={{y: 40, delay: 200}}>
            <span class="font-light n">7</span>
            <span class="text-xs text-neutral-600 dark:text-neutral-400">PQRS</span>
        </button>
        <button class="android-pin-number" transition:fly={{y: 40, delay: 200}}>
            <span class="font-light n">8</span>
            <span class="text-xs text-neutral-600 dark:text-neutral-400">TUV</span>
        </button>
        <button class="android-pin-number" transition:fly={{y: 40, delay: 200}}>
            <span class="font-light n">9</span>
            <span class="text-xs text-neutral-600 dark:text-neutral-400">WXYZ</span>
        </button>
        <button class="android-pin-number exclude opacity-0 !cursor-default" transition:fly={{y: 40, delay: 250}}></button>
        <button class="android-pin-number" transition:fly={{y: 40, delay: 250}}>
            <span class="text-[7px] opacity-0">s</span>
            <span class="font-light n">0</span>
            <span class="text-[7px] opacity-0">s</span>
        </button>
        <button class="android-pin-number exclude {difficulty !== 'impossible' ? 'opacity-0 !cursor-default' : ''}" transition:fly={{y: 40, delay: 250}}>
            <img alt="Done" class="h-6 aspect-square opacity-75 android-unlock android-unlock-icons-active"
                 src="/android/done.png">
        </button>
    </div>
    <button class="rounded-full text-sm text-neutral-700 dark:text-neutral-300 mb-3 cursor-pointer hover:bg-neutral-200 active:bg-neutral-300 dark:hover:bg-neutral-700 dark:active:bg-neutral-600 transition-all w-max mx-auto p-2" transition:fly={{y: 40, delay: 300}}>
        Emergency Quit
    </button>
</div>