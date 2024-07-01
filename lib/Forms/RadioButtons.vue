<script setup lang="ts">
import uid from '../Utilities/uid'
import { useElementSize } from '@vueuse/core'
import { ref, watch, onMounted } from 'vue'
import GlobalLabel from './Partials/GlobalLabel.vue'
import { type ValidationState } from './Partials/InputProps'

export interface Item {
    value: string|number|boolean,
    title?: string|number|boolean,
    classes?: any | any[],
}

const props = withDefaults(defineProps<{
    items: Item[],
    modelValue: string | number | boolean | null,
    labelStyles?: any,
    name?: string,
    vertical?: boolean,
    validationState?: ValidationState,
    renderLabel?: boolean,
}>(),
{
    vertical: false,
    renderLabel: true,
})

const emit = defineEmits(['update:modelValue'])

const defaultValue = ref(props.modelValue ?? null)

const inputUid = uid()

const selected = ref(props.modelValue)
onMounted(() => {
    if (!props.modelValue)
    {
        selected.value = props.items[0].value
        emit('update:modelValue', selected.value)
    }
})

watch(() => props.modelValue, (newVal) => selected.value = newVal)

watch(selected, () => emit('update:modelValue', selected.value))

const reset = () => {
    if (defaultValue.value) selected.value = defaultValue.value
}

const labelRef = ref(null)
const { width } = useElementSize(labelRef)

</script>
<template>
    <div class="relative flex flex-col" :style="{ minWidth: width+'px' }">
        <GlobalLabel v-if="props.renderLabel || $slots.label"
            :input-uid="inputUid"
            :label-styles="props.labelStyles"
            :has-value="selected !== null"
            :has-default-value="Boolean(defaultValue)"
            :value-is-defaulted="selected === defaultValue"
            :validation-state="props.validationState"
            @reset="reset"
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
            class="w-full flex mt-2"
            :class="[
                {'items-center justify-start gap-5': !props.vertical},
                {'flex-col items-start': props.vertical}
            ]"
        >
            <div v-for="(item, index) in props.items"
                class="flex items-center gap-1"
            >
                <input
                    class="mt-1 hover:cursor-pointer"
                    v-model="selected"
                    type="radio"
                    :name="props.name"
                    :id="`${inputUid}_${index}`"
                    :value="item.value"
                />
                <label
                    :for="`${inputUid}_${index}`"
                    class="hover:cursor-pointer"
                    :class="item.classes"
                >
                    {{ item.title ?? item.value }}
                </label>
            </div>
        </div>
    </div>
</template>