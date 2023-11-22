<script setup lang="ts">
import uid from '../Utilities/uid'
import FasCaretDown from '../Icons/FasCaretDown.vue'
import { inject, computed, onBeforeMount, useSlots } from 'vue'
import TransitionExpand from '../Transitions/TransitionExpand.vue'

interface Props {
    itemClasses?: string,
    dark?: boolean,
    buttonToggleOnly?: boolean,
    showIcon?: boolean,
    panelClasses?: string | object | any[],
}
const props = withDefaults(defineProps<Props>(), {
    dark: false,
    buttonToggleOnly: false,
    showIcon: true,
})

const slots = useSlots()

const itemUid = uid()

const openClasses = computed(() => {
    return props.dark ? 'bg-neutral-700' : ''
})

//@ts-ignore
const { addItem, activeItemUid, toggleItem } = inject('accordion')

const toggleCheck = () => {
    if (props.buttonToggleOnly) return
    toggle()
}

const toggle = () => {
    toggleItem(itemUid)
}


const isOpen = computed(() => {
    return activeItemUid.value == itemUid
})

onBeforeMount(() => {
    addItem({
        uid: itemUid,
        active: false
    })
})
</script>

<template>
    
    <li class="relative whitespace-nowrap">
        <div @click="toggleCheck" class="flex justify-between items-center" :class="[isOpen && openClasses, props.itemClasses, {'hover:cursor-pointer': !props.buttonToggleOnly}]">
            <slot name="header" :toggle="toggle" :isOpen="isOpen"/>
            <FasCaretDown v-if="props.showIcon" :class="{'rotate-180': isOpen}" class="fa-fw transition-all hover:cursor-pointer" @click="toggle" />
        </div>
        <template v-if="slots.panel">
            <TransitionExpand>
                <div v-show="isOpen" class="relative z-[3]" :class="props.panelClasses">
                    <slot name="panel"/>
                </div>
            </TransitionExpand>
        </template>
    </li>

</template>