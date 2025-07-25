<script>
    import {onMount} from "svelte";

    let cursor = ({
        mousedown: false,
        initialY: 0,
        currentY: 0,
        screenHeight: 0
    })

    let date = $state(new Date());
    onMount(() => {
        const interval = setInterval(() => {
            date = new Date();
        }, 1000);

        // document.querySelectorAll(".android-unlock").forEach(el => {
        //     el.classList.add("activate");
        // })

        cursor.screenHeight = document.querySelector('.android-unlock-screen').parentElement.clientHeight / 2;

        return () => {
            clearInterval(interval);
        };
    });

    function mousedown(event) {
        console.log("mousedown", cursor);
        cursor.mousedown = true;
        cursor.initialY = event.clientY;
        cursor.currentY = event.clientY;
    }
    function mousemove(event) {
        if (cursor.mousedown) {
            cursor.currentY = event.clientY;
            const percent = (cursor.currentY - cursor.initialY) / cursor.screenHeight;
            document.querySelectorAll(".android-unlock").forEach(el => {
                el.style.animationDirection = "";
                if (0 < (percent) < 1)
                    el.style.animationDelay = `${(Math.floor(percent * 100000)/100000) * 0.5}s`
                else
                    el.style.animationDelay = "-0.5s";
                console.log("mousemove", cursor, percent, el.style.animationDelay);
            });
        }
    }
    function calc(x) { eval(x); }
    function mouseup() {
        const percent = -(cursor.currentY - cursor.initialY) / cursor.screenHeight;
        console.log("mouseup", cursor, percent);

        if (cursor.mousedown) {
            cursor.mousedown = false;
            const percent = (cursor.currentY - cursor.initialY) / cursor.screenHeight;

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

</script>
<div class="w-screen h-screen grid place-items-center select-none" on:mousedown={mousedown} on:mousemove={mousemove} on:mouseup={mouseup}>
    <div class="relative overflow-hidden w-full md:w-md mx-auto h-full md:h-auto md:aspect-9/16 md:shadow-glow md:shadow-black md:dark:shadow-white transition-all">
        <div class="android-unlock android-unlock-screen">
            <div class="absolute top-4 left-4">
                <b>Pindle</b>: Crack the PIN code
            </div>
            <div class="absolute top-3 right-3 flex flex-row-reverse items-center">
                <img src="/android/avatar.png" alt="Android Default Avatar" class="w-8 h-8">
                <img src="/android/battery.png" alt="Android Default Avatar" class="h-5 aspect-square ml-1">
                <img src="/android/cellular.png" alt="Android Default Avatar" class="h-5 aspect-square ml-1">
                <img src="/android/wifi.png" alt="Android Default Avatar" class="h-5 aspect-square ml-1">
                <img src="/android/bluetooth.png" alt="Android Default Avatar" class="h-5 aspect-square ml-1">
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
                <div class="px-2 py-3 mt-4 bg-neutral-700 mx-5 flex flex-row items-center android-unlock android-unlock-notifications">
                    <img src="favicon.svg" alt="Pindle Icon" class="w-10 h-10 mr-2 rounded-full">
                    <div class="flex flex-col text-left">
                        <span class="">Pindle Instructions</span>
                        <span class="text-sm text-neutral-400">Learn how to play with these instructions to help.</span>
                    </div>
                </div>
            </div>
            <div class="absolute bottom-16 text-sm text-neutral-200 opacity-85 w-full text-center">
                Swipe to unlock
            </div>
            <div class="absolute bottom-6 w-full flex flex-row justify-between items-center px-6">
                <img src="favicon.svg" alt="Difficulty Selector" class="h-6 aspect-square opacity-75 android-unlock android-unlock-icons-inactive">
                <img src="/android/lock.png" alt="Android Default Avatar" class="h-6 aspect-square opacity-75 android-unlock android-unlock-icons-active">
                <!--<img src="favicon.svg" alt="Android Default Avatar" class="h-6 aspect-square opacity-75"> for themes-->
                <div class="w-6"></div>
            </div>
        </div>
    </div>
</div>