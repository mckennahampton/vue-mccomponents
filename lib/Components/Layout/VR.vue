<script setup lang="ts">

const props = withDefaults(defineProps<{
    dark?: boolean,
}>(), {
    dark: false,
})

</script>
<template>
    <div class="relative flex self-stretch items-stretch">
        <div
            class="block h-full w-[1px] mx-4"
            :class="[
                props.dark ? 'bg-neutral-800' : 'bg-neutral-300'
            ]"
        ></div>
    </div>
</template>