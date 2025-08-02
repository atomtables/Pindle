import { fade, slide } from "svelte/transition";
import { cubicOut } from "svelte/easing";

export function fadescale(node, {delay = 0, duration = 300, easing = cubicOut, start = 0.8}) {
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
export function fadeslide(node, options = {}) {
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