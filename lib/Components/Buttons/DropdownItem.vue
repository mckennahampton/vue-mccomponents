<script setup lang="ts">

const props = withDefaults(defineProps<{
    dark?: boolean
}>(), {
    dark: false
})

</script>
<template>
    <div
        class="flex gap-3 items-center py-2 px-4 transition hover:cursor-pointer"
        :class="[
            {'text-white bg-neutral-950 hover:bg-neutral-900': props.dark},
            {'text-black bg-white hover:bg-neutral-100': !props.dark},
        ]"
    >
        <slot />
    </div>
</template>