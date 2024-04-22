<script setup lang="ts">

const props = withDefaults(defineProps<{
    dark?: boolean,
}>(),
{
    dark: false
})

</script>
<template>
    <button
        class="hover:cursor-pointer py-2 px-4 transition"
        :class="[
            {'text-black': !props.dark},
            {'text-white bg-neutral-800 hover:bg-neutral-700': props.dark}
        ]"
    >
        <slot />
    </button>
</template>