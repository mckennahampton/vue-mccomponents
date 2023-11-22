<script setup lang="ts">
import { provide, ref, computed } from 'vue'

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

provide('accordion', { addItem, activeItemUid, toggleItem })

</script>
<template>
    <ul>
        <slot />
    </ul>
</template>