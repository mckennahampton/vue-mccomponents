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
            props.dark ? 'text-white hover:bg-neutral-900' : 'text-black hover:bg-neutral-100'
        ]"
    >
        <slot />
    </div>
</template>