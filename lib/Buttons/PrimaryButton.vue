<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    href?: string
}
const props = defineProps<Props>()

const element = computed(() => {
    return props.href ? 'a' : 'button'
})

</script>
<template>
    <component :is="element" :href="props.href" class="bg-locke-red-500 hover:cursor-pointer text-white py-2 px-4 ">
        <slot />
    </component>
</template>