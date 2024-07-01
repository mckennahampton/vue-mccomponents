<script setup lang="ts">
import Spinner from '../Spinners/Spinner.vue'

const props = withDefaults(defineProps<{
    caption?: string,
}>(), {
    caption: 'Loading...'
})

</script>
<template>
    <div class="flex items-center justify-center gap-5">
        <span class="font-bold">{{ props.caption }}</span>
        <Spinner class="w-[20px] h-[20px] animate-spin-fast" />
    </div>
</template>