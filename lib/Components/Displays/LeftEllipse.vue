<script setup lang="ts">
import { ref } from 'vue'
import { useElementSize } from '@vueuse/core'

const props = withDefaults(defineProps<{
    dark?: boolean,
}>(), {
    dark: false,
})

const placeholderRef = ref<HTMLElement | null>(null)
const placeholderConRef = ref<HTMLElement | null>(null)
const { width: placeholderRefWidth } = useElementSize(placeholderRef)
const { width: placeholderConRefWidth } = useElementSize(placeholderConRef)

</script>
<template>
    <div 
        class="relative w-full h-10 overflow-hidden"
        ref="placeholderConRef"
    >
        <span
            
            class="whitespace-nowrap absolute top-[50%] transform -translate-y-[50%]"
            :class="[
                {'right-0': placeholderConRefWidth < placeholderRefWidth },
                { 'left-0': placeholderConRefWidth > placeholderRefWidth }
            ]"
            ref="placeholderRef"
        >
            <slot />
        </span>

        <!-- Fader -->
        <div v-if="placeholderConRefWidth < placeholderRefWidth"
            class="absolute left-0 h-[30px] w-[30px] bg-gradient-to-r to-transparent"
            :class="[
                {'from-white': !props.dark},
                {'from-black': props.dark}
            ]"
        ></div>

    </div>
</template>