<script setup lang="ts">
import uid from '../Utilities/uid'
import { ref, watch, onBeforeMount } from 'vue'
import GlobalLabel from './Partials/GlobalLabel.vue'
import { ValidationState } from './Partials/InputProps'

export interface Item {
    value: string | number,
    title?: string | number,
    checked?: boolean,
}

interface InternalItem extends Item {
    item_uid?: string,
}

const props = withDefaults(defineProps<{
    items: Item[],
    itemLabelStyles?: any,
    modelValue: string[] | number[],
    name?: string,
    showValidated?: boolean,
    labelStyles?: any,
    vertical?: boolean,
    renderLabel?: boolean,
    dark?: boolean,
    validationState?: ValidationState
    optional?: boolean,
}>(), {
    showValidated: false,
    vertical: false,
    renderLabel: true,
    dark: false,
    optional: false,
})
const emit = defineEmits(['update:modelValue'])

const inputUid = uid()
const checkedBoxes = ref<(string | number)[]>([])
const defaultValues = ref<(string | number)[]>([])

const internalItems = ref<InternalItem[]>([])
onBeforeMount(() => {
    props.items.forEach(item => internalItems.value.push({
        item_uid: uid(),
        ...item
    }))

    checkedBoxes.value = internalItems.value.filter(item => props.modelValue.some(_m => _m == item.value)).map(item => item.value)
    defaultValues.value = checkedBoxes.value
})

// Set the initial checked boxes

watch(checkedBoxes, () => emit('update:modelValue', checkedBoxes.value))

const reset = () => checkedBoxes.value = defaultValues.value
const clear = () => checkedBoxes.value = []

</script>
<template>
    <div class="flex flex-col gap-2 group">
        <GlobalLabel v-if="props.renderLabel"
            :input-uid="inputUid"
            :label-styles="props.labelStyles"
            :has-default-value="defaultValues.length > 0"
            :has-value="checkedBoxes.length > 0"
            :optional="props.optional"
            :value-is-defaulted="defaultValues === checkedBoxes"
            :validation-state="props.validationState"
            @reset="reset"
            @clear="clear"
        >
            <template v-if="$slots.label" #label>
                <slot name="label" />
            </template>
            <template v-if="$slots.tooltipHeader" #tooltipHeader>
                <slot name="tooltipHeader" />
            </template>
            <template v-if="$slots.tooltip"  #tooltip>
                <slot name="tooltip" />
            </template>
        </GlobalLabel>

        <div
            class="flex"
            :class="[
                {'flex-col justify-center items-start': props.vertical},
                {'items-center justify-start gap-4': !props.vertical}
            ]"
        >
            <span v-for="item in internalItems"class="flex items-center justify-center gap-1">
                <input
                    v-model="checkedBoxes"
                    class="cursor-pointer w-4 h-4  bg-gray-100 border-gray-300"
                    type="checkbox"
                    :value="item.value"
                    :id="item.item_uid"
                    :checked="checkedBoxes.some(box => box == item.value)"
                    :name="props.name"
                />
                <label
                    class="!cursor-pointer select-none"
                    :class="props.itemLabelStyles"
                    :for="item.item_uid"
                >
                    {{ item.title ?? item.value }}
                </label>
            </span>
        </div>
    </div>

</template>