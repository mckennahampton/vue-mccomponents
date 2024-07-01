<script setup lang="ts">
import ButtonIcon from './ButtonIcon.vue'

const props = withDefaults(defineProps<{
    iconClass?: string,
    iconStyle?: any,
    loading?: boolean,
}>(),
{
    loading: false
})

</script>
<template>
    <button class="flex items-center gap-3 hover:cursor-pointer text-black py-2 px-4 hover:bg-neutral-100 transition-all whitespace-nowrap">
        <ButtonIcon :icon-class="props.iconClass" :icon-style="props.iconStyle" :loading="props.loading" />
        <slot />
    </button>
</template>