<script>
    import {onMount} from "svelte";
    import {fade, fly} from "svelte/transition";
    import {quintOut} from "svelte/easing";

    let {activated = $bindable(), instructions = $bindable()} = $props();

    let date = $state(new Date());
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
        return () => {
            clearInterval(interval);
        };
    });

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

    const nextscreen = () => setTimeout(() => activated = true, 300 + 1000 * (parseFloat(document.querySelector(".android-unlock").style.animationDelay.replace('calc(', '').replace(')', '').replace('s', '')) || 0))

    function down(event) {
        if (event.type.includes('touch')) event.preventDefault();
        if (event.target.closest('button[preventInteraction]')) {
            return;
        }
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
                statusMessage = "Swipe left to modify settings"
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
        if (event.target.closest('button[preventInteraction]')) {
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
            document.querySelectorAll(".android-unlock").forEach(el => {
                document.querySelector(".android-unlock-background").style.animationFillMode = "forwards";
                el.classList.add("activate")
            })
            cursor.auxExit = () => instructions = true
        }
    }
</script>

<svelte:window on:mousedown={down} on:mousemove={move} on:mouseup={up} on:touchend|nonpassive={up}
               on:touchmove|nonpassive={move} on:touchstart|nonpassive={down}/>

{#if !cursor.auxExit}
    <div class="relative h-full pt-2 xs:p-0" in:fly|global={{y: "100%"}} out:fade|global={{duration: 500}}
         onoutrostart={() => document.querySelector(".android-unlock-background").classList.add("activate")}
         onoutroend={() => cursor.auxExit?.()}>
        <div class="h-full android-unlock android-unlock-screen">
            <div class="absolute top-4 left-4 text-neutral-100">
                <b>an atomtables game</b><span class="hidden xs:inline">: Credits</span>
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
                    <button preventInteraction onclick={instructionsF} ontouchend={instructionsF} bind:this={instructionsB}
                            class="z-0 transition-colors duration-150 ease-in-out border-b-1 border-neutral-500/50 px-2 py-3 mt-4 bg-neutral-300/80 dark:bg-neutral-700/60  flex flex-row w-full items-center android-unlock android-unlock-notifications">
                        <img src="favicon.svg" alt="Pindle Icon" class="w-10 h-10 mr-2 rounded-full">
                        <span class="flex flex-col text-left">
                            <span class="">Pindle Instructions</span>
                            <span class="text-sm text-neutral-600 dark:text-neutral-400">Learn how to play with these instructions to help.</span>
                        </span>
                    </button>
                    <!--                    <button preventInteraction onclick={() => null}-->
                    <!--                            class="transition-colors duration-150 ease-in-out px-2 py-3 bg-neutral-300/60 dark:bg-neutral-700/60  flex flex-row w-full items-center android-unlock android-unlock-notifications">-->
                    <!--                        <img src="favicon.svg" alt="Pindle Icon" class="w-10 h-10 mr-2 rounded-full">-->
                    <!--                        <span class="flex flex-col text-left">-->
                    <!--                            <span class="">Pindle Instructions</span>-->
                    <!--                            <span class="text-sm text-neutral-500 dark:text-neutral-400">Learn how to play with these instructions to help.</span>-->
                    <!--                        </span>-->
                    <!--                    </button>-->
                </div>
            </div>
            <div class="absolute bottom-16 text-sm text-neutral-200 opacity-85 w-full text-center z-50">
                {#if statusMessage}
                    <i>{statusMessage}</i>
                {:else}
                    <div class="flex flex-col justify-center">
                        <span>Swipe <span class="hidden md:inline">(or click)</span> to start</span>
                        <span class="text-xs">Swipe left <span class="hidden md:inline">(or double-click left)</span> to modify settings</span>
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