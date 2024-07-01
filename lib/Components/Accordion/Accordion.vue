<script setup lang="ts">
import { provide, ref, computed, onBeforeMount, watch } from 'vue'

const props = withDefaults(defineProps<{
    dark?: boolean,
}>(),{
    dark: false
})

const items = ref([] as any[])

const addItem = (item: any) => {
    if (items.value.indexOf(item) > -1) return
    items.value.push(item)
}

const activeItemUid = computed(() => {
    return items.value.find(item => item.active)?.uid
})

const toggleItem = (uid: string) => {
    // Close everything but the target item
    items.value.filter(item => item.uid != uid).forEach(item => item.active = false)

    // Toggle the target
    if (items.value.find(item => item.uid == uid)) {
        items.value.find(item => item.uid == uid).active = !items.value.find(item => item.uid == uid).active
    }
}

const isDark = ref(props.dark)
watch(() => props.dark, (newVal, oldVal) => {
    if (newVal == oldVal) return
    isDark.value = props.dark
})
onBeforeMount(() => {
    provide('accordion', { addItem, activeItemUid, toggleItem })
    provide('dark', isDark)
})

</script>
<template>
    <ul>
        <slot />
    </ul>
</template>