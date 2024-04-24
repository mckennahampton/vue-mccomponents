<script setup lang="ts">
import Icon from '../Icon.vue'
import Spinner from '../Spinners/Spinner.vue'

const props = withDefaults(defineProps<{
    iconClass?: string,
    iconStyle?: string,
    loading?: boolean,
}>(),
{
    loading: false
})

</script>
<template>
    <Spinner v-if="props.loading" stubby class="w-[14px] h-[14px] animate-spin-fast" />
    <Icon v-else-if="props.iconClass" :icon-class="props.iconClass" :class="props.iconStyle" class="!w-[14px] !h-[14px]" />
</template>