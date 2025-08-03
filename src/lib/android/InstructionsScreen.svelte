<script>
    import { fly, fade } from "svelte/transition";
    import { quintIn } from "svelte/easing";
    import {onMount} from "svelte";

    let { instructions = $bindable() } = $props();
    let animateAway = $state(false);
    let animateIn = $state(false);
    onMount(() => {
        animateIn = true;
    })

    let onoutroend = $state();
</script>

{#if !animateAway}
    <div class="w-full h-full p-2 pb-[env(safe-area-inset-bottom)] md:pb-2 flex flex-col justify-between text-neutral-100 overflow-y-scroll" in:fly|global={{y: "100%"}} out:fly|global={{y: "-100%"}} onoutroend={() => setTimeout(onoutroend, 200)}>
        <div class="pb-2">
            <div class="font-thin text-5xl xs:text-6xl pt-2">
                Instructions
            </div>
            <p class="px-1 pt-2 text-xl">
                Have you ever played Wordle? The premise is pretty similar. You are given hints about a PIN code, and
                based on the hints, you must correctly guess the PIN code.
            </p>
            <div class="flex flex-col items-center justify-center p-2">
                {#if animateIn}
                    <div class="flex flex-row items-center justify-center *:text-center *:font-light p-2">
                        <div class="text-2xl w-6 mr-2" style="font-family: 'Roboto Mono', monospace;" in:fade|global={{duration: 500, delay: 250, easing: quintIn}}>1</div>
                        <div class="text-2xl w-6 mr-2" style="font-family: 'Roboto Mono', monospace;" in:fade|global={{duration: 500, delay: 500, easing: quintIn}}>9</div>
                        <div class="text-2xl w-6 mr-2" style="font-family: 'Roboto Mono', monospace;" in:fade|global={{duration: 500, delay: 750, easing: quintIn}}>8</div>
                        <div class="text-2xl w-6 mr-2" style="font-family: 'Roboto Mono', monospace;" in:fade|global={{duration: 500, delay: 1000, easing: quintIn}}>4</div>
                    </div>
                    <div class="flex flex-row">
                        <img src="/android/dotfill.svg" alt="Digit in the correct position" class="w-6 aspect-square mr-2" in:fade|global={{duration: 500, delay: 250, easing: quintIn}}>
                        <img src="/android/dot.svg" alt="Digit in the PIN but not in the correct position" class="w-6 aspect-square mr-2" in:fade|global={{duration: 500, delay: 500, easing: quintIn}}>
                        <img src="/android/dot.svg" alt="Digit in the PIN but not in the correct position" class="w-6 aspect-square mr-2" in:fade|global={{duration: 500, delay: 750, easing: quintIn}}>
                        <img src="/android/dotempty.svg" alt="Digit not in the PIN" class="w-6 aspect-square mr-2" in:fade|global={{duration: 500, delay: 1000, easing: quintIn}}>
                    </div>
                {/if}
            </div>
            <p class="px-1 pt-4 text-xl">
                Enter a guess in the keypad, and the game will tell you how many you got right.
            </p>
            <div class="px-1 pt-2 flex flex-row items-center text-lg/6 space-x-2 font-light">
                <img src="/android/dotfill.svg" class="w-6" />
                <p>One of your digits is in the passcode and is in the right place</p>
            </div>
            <div class="px-1 pt-2 flex flex-row items-center text-lg/6 space-x-2 font-light">
                <img src="/android/dot.svg" class="w-6" />
                <p>One of your digits is in the passcode, but is in the wrong place</p>
            </div>
            <div class="px-1 pt-2 flex flex-row items-center text-lg/6 space-x-2 font-light">
                <img src="/android/dotempty.svg" class="w-6" />
                <p>One of your digits is not in the passcode</p>
            </div>
            <p class="px-1 pt-2 text-xl">
                Unlike Wordle, you will not know which digits are correct. The goal is to finish in as little attempts
                as possible.
            </p>
        </div>
        <div class="flex flex-col space-y-2">
            <!--suppress CommaExpressionJS -->
            <button onclick={() => (animateAway = true, onoutroend = () => instructions = false)} class="cursor-pointer bg-neutral-300 mb-2 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 active:bg-neutral-500 dark:active:bg-neutral-500 transition-colors p-2 w-full text-left uppercase font-bold flex flex-row items-center">
                <img src="/android/close.svg" alt="Close" class="w-8 aspect-square mr-2 invert dark:invert-0">
                <span class="mt-0.5 text-neutral-900 dark:text-neutral-100">Close</span>
            </button>
        </div>
    </div>
{/if}