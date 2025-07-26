<script>
    import {onMount} from "svelte";

    let date = $state(new Date());
    onMount(() => {
        const interval = setInterval(() => {
            date = new Date();
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    });
</script>

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