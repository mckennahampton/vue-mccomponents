<script setup lang="ts">

const props = withDefaults(defineProps<{
    stubby?: boolean,
}>(), {
    stubby: false
})

</script>
<template>
    <span
        class="inline-block border-2 border-black border-opacity-50 border-t-white rounded-[100%] border-solid"
        :class="[
            {'border-x-white': props.stubby}
        ]"
    ></span>
</template>