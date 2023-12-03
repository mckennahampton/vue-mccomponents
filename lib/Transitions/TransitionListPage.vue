<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
    direction?: 'forwards' | 'backwards',
    durationMs?: number,
}>(), {
    direction: 'forwards',
    durationMs: 100
})

const originalOverflowX = ref('')

function onBeforeLeave(el: Element) {

    //@ts-ignore
    if (el.parentElement)
    {
        originalOverflowX.value = el.parentElement.style.overflowX
        el.parentElement.style.overflowX = 'clip'
    }

    //@ts-ignore
    el.style.transition = `all ${props.durationMs}ms ease-out` // Need to set the root element transition to allow the child items time to animate
    el.querySelectorAll(':scope > *').forEach(_el => {
        //@ts-ignore
        _el.style.animation = props.direction == 'forwards' ? `leaveForwards ${props.durationMs}ms` : `leaveBackwards ${props.durationMs}ms`
        //@ts-ignore
        _el.style.opacity = 0 // Keeps the outgoing list from blipping back on the page for a moment
        
    })
}

function onEnter(el: Element, done: Function) {

    //@ts-ignore
    el.style.transition = `all ${props.durationMs}ms ease-out`
    el.querySelectorAll(':scope > *').forEach(_el => {
        //@ts-ignore
        _el.style.animation = props.direction == 'forwards' ? `enterForwards ${props.durationMs}ms` : `enterBackwards ${props.durationMs}ms`
    })

    setTimeout(() => {
        el.querySelectorAll(':scope > *').forEach(_el => {
            //@ts-ignore
            _el.style.animation = ''
        })

        //@ts-ignore
        if (el.parentElement)
        {
            el.parentElement.style.overflowX = originalOverflowX.value
        }
    }, props.durationMs)
    done()
}


</script>
<template>
    <Transition
        name="page"
        mode="out-in"
        @before-leave="onBeforeLeave"
        @enter="onEnter"
    >
        <slot />
    </Transition>
</template>
<style>
@keyframes enterForwards {
    from {
        transform: translateX(10%);
        opacity: 0;
    }
    to {
        transform: translateX('0px');
        opacity: 1;
    }
}

@keyframes enterBackwards {
    from {
        transform: translateX(-10%);
        opacity: 0;
    }
    to {
        transform: translateX('0px');
        opacity: 1;
    }
}

@keyframes leaveBackwards {
    from {
        transform: translateX('0px');
        opacity: 1;

    }
    to {
        transform: translateX(10%);
        opacity: 0;
    }
}

@keyframes leaveForwards {
    from {
        transform: translateX('0px');
        opacity: 1;
    }
    to {
        transform: translateX(-10%);
        opacity: 0;
    }
}

</style>