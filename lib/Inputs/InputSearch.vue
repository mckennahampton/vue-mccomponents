<script setup lang="ts">
import Input from './Input.vue'
import uid from '../Utilities/uid'
import DropdownItem from '../Buttons/DropdownItem.vue'
import DropdownButton from '../Buttons/DropdownButton.vue'
import { computed, ref, inject, type ComputedRef } from 'vue'

interface Item {
    value: string|number|Boolean,
}

interface Props {
    modelValue: string | number | object,
    items: Item[] | null,
    autocomplete?: boolean,
    label?: string,
    showValidated?: boolean,
    labelStyles?: any
}
const props = withDefaults(defineProps<Props>(), {
    autocomplete: false,
    showValidated: false,
})
const emit = defineEmits(['update:modelValue'])

const inputUid = uid()
const localInputVal = ref(props.modelValue ?? null)

const filteredItems = computed(() => {
    return props.items?.filter(item => {
        if (localInputVal.value) {
            if ( item.value?.toString().toLowerCase().includes(localInputVal.value.toString().toLowerCase()) ) {
                return true
            }
            else {
                return false
            }
        }

        return true
    })
})

const selected = (item: Item) => {
    localInputVal.value = item.value
    emit('update:modelValue', item.value)
}

</script>
<template>
    <label v-if="props.label"
        class="absolute text-sm  top-0 origin-[0] px-2 left-1 -translate-y-6 -translate-x-2"
        :for="inputUid"
    >
        {{ props.label }}
    </label>
    <DropdownButton
        :placement="'bottom'"
        :button-classes="'!p-0 !font-normal'"
        :dropdown-classes="'!text-base max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-transparent'"
    >
        <template #button="{toggleDropdown}">
            <Input
                v-bind="$attrs"
                v-model="localInputVal"
                type="text"
                role="input_search"
                @blur="toggleDropdown"
                @input="
                    //@ts-ignore
                    e=>emit('update:modelValue', e.target.value)
                "
                :id="inputUid"
                :autocomplete="props.autocomplete ? 'on' : 'off'"
            />
        </template>
        <template #dropdown>
            <DropdownItem v-if="filteredItems" v-for="item in filteredItems" @click="selected(item)">
                {{ item.value }}
            </DropdownItem>
        </template>
    </DropdownButton>
</template>