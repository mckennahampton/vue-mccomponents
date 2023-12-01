<script setup lang="ts">
// Custom transition from: https://markus.oberlehner.net/blog/transition-to-height-auto-with-vue/

function enter(element: HTMLElement) {
    const width = getComputedStyle(element).width

    element.style.width = width
    element.style.position = 'absolute'
    element.style.visibility = 'hidden'
    element.style.height = 'auto'

    const height = getComputedStyle(element).height

    //@ts-ignore
    element.style.width = null
    //@ts-ignore
    element.style.position = null
    //@ts-ignore
    element.style.visibility = null
    //@ts-ignore
    element.style.height = 0

    // Force repaint to make sure the
    // animation is triggered correctly.
    getComputedStyle(element).height

    // Trigger the animation.
    // We use `requestAnimationFrame` because we need
    // to make sure the browser has finished
    // painting after setting the `height`
    // to `0` in the line above.
    requestAnimationFrame(() => {
        element.style.height = height
    })

}

function afterEnter(element: HTMLElement) {
    element.style.height = 'auto'
}

function leave(element: HTMLElement) {
    const height = getComputedStyle(element).height
    
    element.style.height = height

    // Force repaint to make sure the
    // animation is triggered correctly.
    getComputedStyle(element).height

    requestAnimationFrame(() => {
        //@ts-ignore
        element.style.height = 0
    })

}
</script>
<template>

    <!-- @vue-ignore-->
    <transition
        name="expand"
        @enter="enter"
        @after-enter="afterEnter"
        @leave="leave"
    >
        <slot/>
    </transition>
</template>
<style scoped>
    .expand-enter-active,
    .expand-leave-active {
        transition: height 200ms ease-in-out;
        overflow: hidden;
    }

    .expand-enter,
    .expand-leave-to {
        height: 0;
        box-sizing: content-box;
    }

    /* Browser optimization */
    * {
        will-change: height;
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
    }
</style>