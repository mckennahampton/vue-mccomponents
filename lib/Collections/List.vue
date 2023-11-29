<script setup lang="ts">
interface Props {
    header?: string,
    headerClasses?: string | any[] | object,
    headerConClasses?: string | any[] | object,
    listClasses?: string | any[] | object,
    scroll?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    scroll: true
})

</script>
<template>
    <div class="flex flex-col w-full text-neutral-100">
        <div class="flex items-center justify-between" :class="props.headerConClasses">
            <span v-if="props.header" :class="props.headerClasses">{{ props.header }}</span>
            <slot name="headerRight" />
        </div>
        <div :class="[listClasses, {'max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-transparent': props.scroll}]" class="flex flex-col w-full">
            <slot />
        </div>
    </div>
</template>