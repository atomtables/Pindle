<script>
    import {onMount} from "svelte";
    import {fade} from "svelte/transition";

    let {activated = $bindable()} = $props();

    let date = $state(new Date());
    onMount(() => {
        const interval = setInterval(() => {
            date = new Date();
        }, 1000);
        cursor.screenHeight = document.querySelector('.android-unlock-screen')?.parentElement?.clientHeight;
        return () => {
            clearInterval(interval);
        };
    });

    let cursor = ({
        mousedown: false,
        initialY: 0,
        currentY: 0,
        screenHeight: 0
    })
    function down(event) {
        if (event.type.includes('touch')) event.preventDefault();
        cursor.mousedown = true;
        const clientY = event.type.includes('touch') ? event.touches[0].clientY : event.clientY;
        cursor.initialY = clientY;
        cursor.currentY = clientY;
    }
    function move(event) {
        if (cursor.mousedown) {
            if (event.type.includes('touch')) {
                event.preventDefault();
                cursor.currentY = event.touches[0].clientY;
            } else {
                cursor.currentY = event.clientY;
            }
            const percent = (cursor.currentY - cursor.initialY) / cursor.screenHeight;
            document.querySelectorAll(".android-unlock").forEach(el => {
                el.style.animationDirection = "";
                if (0 < percent < 1)
                    el.style.animationDelay = `${(Math.floor(percent * 100000)/100000) * 0.5}s`
                else
                    el.style.animationDelay = "-0.0s";
            });
        }
    }
    function up(event) {
        if (event.type.includes('touch')) event.preventDefault();
        const percent = -(cursor.currentY - cursor.initialY) / cursor.screenHeight;

        if (cursor.mousedown) {
            cursor.mousedown = false;
            if (percent >= 0.35) {
                document.querySelectorAll(".android-unlock").forEach(el => {
                    el.style.animationFillMode = 'forwards';
                    el.classList.add("activate");
                });
                const delay = document.querySelector(".android-unlock").style.animationDelay;
                console.log(parseFloat(delay.replace('calc(', '').replace(')', '').replace('s', '')))
                setTimeout(() => activated = true, 300 + 1000*parseFloat(delay.replace('calc(', '').replace(')', '').replace('s', '')))
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
</script>

<svelte:window on:mousedown={down} on:mousemove={move} on:mouseup={up} on:touchstart|nonpassive={down} on:touchmove|nonpassive={move} on:touchend|nonpassive={up} />

<div class="android-unlock android-unlock-screen" in:fade|global={{delay: 300}}>
    <div class="absolute top-4 left-4">
        <b>Pindle</b>: Crack the PIN code
    </div>
    <div class="absolute top-3 right-3 flex flex-row-reverse items-center">
        <img src="/android/avatar.png" alt="Android Default Avatar" class="w-8 h-8">
        <img src="/android/battery.png" alt="Android Default Avatar" class="h-5 aspect-square ml-1 invert dark:invert-0">
        <img src="/android/cellular.png" alt="Android Default Avatar" class="h-5 aspect-square ml-1 invert dark:invert-0">
        <img src="/android/wifi.png" alt="Android Default Avatar" class="h-5 aspect-square ml-1 invert dark:invert-0">
        <img src="/android/bluetooth.png" alt="Android Default Avatar" class="h-5 aspect-square ml-1 invert dark:invert-0">
    </div>
    <div class="absolute top-48 w-full text-center">
        <div class="android-unlock android-unlock-clock">
            <div class="w-full text-center text-9xl font-thin">
                {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }).replace(/am|pm/gi, "").trim()}
            </div>
            <div class="w-full text-center">
                {date.toLocaleDateString('en-us', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
        </div>
        <div class="px-2 py-3 mt-4 bg-neutral-300 dark:bg-neutral-700 mx-5 flex flex-row items-center android-unlock android-unlock-notifications">
            <img src="favicon.svg" alt="Pindle Icon" class="w-10 h-10 mr-2 rounded-full">
            <div class="flex flex-col text-left">
                <span class="">Pindle Instructions</span>
                <span class="text-sm text-neutral-500 dark:text-neutral-400">Learn how to play with these instructions to help.</span>
            </div>
        </div>
    </div>
    <div class="absolute bottom-16 text-sm text-neutral-800 dark:text-neutral-200 opacity-85 w-full text-center">
        Swipe to unlock
    </div>
    <div class="absolute bottom-6 w-full flex flex-row justify-between items-center px-6">
        <img src="favicon.svg" alt="Difficulty Selector" class="h-6 aspect-square opacity-75 android-unlock android-unlock-icons-inactive">
        <img src="/android/lock.png" alt="Android Default Avatar" class="h-6 aspect-square opacity-75 android-unlock android-unlock-icons-active invert dark:invert-0">
        <!--<img src="favicon.svg" alt="Android Default Avatar" class="h-6 aspect-square opacity-75"> for themes-->
        <div class="w-6"></div>
    </div>
</div>