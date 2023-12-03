<script setup lang="ts">

const props = withDefaults(defineProps<{
    dark?: boolean
}>(), {
    dark: false
})

</script>
<template>
    <span
        class="px-3 py-2 border-b-[1px] last:!border-b-transparent"
        :class="[
            props.dark ? 'border-neutral-800' : 'border-neutral-300'
        ]"
    >
        <slot />
    </span>
</template>