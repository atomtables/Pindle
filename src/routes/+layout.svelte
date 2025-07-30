<script>
	import '../app.css';
	
	let { children } = $props();
</script>

<div class="bg-neutral-100 dark:bg-neutral-800">
    {@render children()}
</div>
