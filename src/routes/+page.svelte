<script>
    import {onMount} from "svelte";
    import LockScreen from "$lib/android/LockScreen.svelte";

    let cursor = ({
        mousedown: false,
        initialY: 0,
        currentY: 0,
        screenHeight: 0
    })
    onMount(() => {
        cursor.screenHeight = document.querySelector('.android-unlock-screen').parentElement.clientHeight / 2;
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
                    el.style.animationDelay = "-0.0s";
                console.log("mousemove", cursor, percent, el.style.animationDelay);
            });
        }
    }
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
        <LockScreen />
    </div>
</div>