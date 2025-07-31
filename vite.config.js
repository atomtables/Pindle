import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
	plugins: [tailwindcss(), enhancedImages(), sveltekit()],
	build: {
		target: "es2015"
	}
});
