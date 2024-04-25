<script setup lang="ts">
import { ref, watch } from 'vue'
import uid from '../Utilities/uid'
import GlobalLabel from './Partials/GlobalLabel.vue'
import { type ValidationState } from './Partials/InputProps'

const props = withDefaults(defineProps<{
    modelValue: boolean,
    name?: string,
    labelStyles?: any,
    showValidated?: boolean,
    captionClasses?: any,
    renderLabel?: boolean,
    centered?: boolean,
    validationState?: ValidationState
}>(),{
    showValidated: false,
})

const emit = defineEmits(['update:modelValue'])

const checked = ref(props.modelValue)
const defaultValue = props.modelValue !== null ? props.modelValue : null

const inputUid = uid()

const manualCheck = (val: boolean) => {
    checked.value = val
    emit('update:modelValue', checked.value)
}

watch(() => props.modelValue, (newVal) => checked.value = newVal)

const reset = () => {
    if (defaultValue !== null) checked.value = defaultValue
    emit('update:modelValue', checked.value)
}

const labelComponentRef = ref<InstanceType<typeof GlobalLabel> | null>(null)

</script>
<template>
       <div
        class="group"
        :style="{
            minWidth: labelComponentRef ? `${labelComponentRef.labelWidth}px` : '0px'
        }"
    >
        <div class="relative w-min grid grid-cols-[auto_auto_auto] gap-y-3" >
            
            <!-- Empty -->
            <div v-if="props.centered"></div>

            <div v-if="$slots.label"
                class="relative h-[15px]"
                :class="[
                    {'col-span-3': !props.centered}
                ]"
            >
                <div
                    class="w-full absolute top-[50%] transform -translate-y-[50%]"
                    :class="[
                        {'left-[50%] -translate-x-[50%]': props.centered},
                    ]"
                    :style="{
                        ...(props.centered && {
                            marginLeft: labelComponentRef ? `${labelComponentRef.labelWidthDifference/2}px` : '0px'
                        })
                    }"
                >
                    <GlobalLabel v-if="props.renderLabel || $slots.label"
                        :input-uid="inputUid"
                        :label-styles="props.labelStyles"
                        :has-default-value="defaultValue !== null"
                        :value-is-defaulted="checked === defaultValue"
                        :validation-state="props.validationState"
                        @reset="reset"
                        ref="labelComponentRef"
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
                </div>
            </div>
            <div v-else></div>

            <!-- Empty -->
            <div v-if="props.centered"></div>

            <span
                class="switch-caption text-right"
                :class="[
                    {'!pl-0': !props.centered}
                ]"
                @click="manualCheck(false)"
            >
                <slot name="falseCaption">
                    No
                </slot>
            </span>

            <div class="flex items-center justify-center px-2">
                <div class="relative">
                    <input v-if="!checked" type="hidden" :name="name" :value="0" />
                    <input
                        class="switch"
                        type="checkbox"
                        role="switch"
                        @change="emit('update:modelValue', checked)"
                        v-model="checked"
                        :name="name"
                        :value="1"
                        :id="inputUid"
                    />
                </div>
            </div>

            <span class="switch-caption text-left" @click="manualCheck(true)">
                <slot name="trueCaption">
                    Yes
                </slot>
            </span>

        </div>
    </div>
</template>
<style scoped>
.switch {
    @apply

    /* base element, acts as the track for the knob */
    h-3.5 w-8 appearance-none border-none rounded-full bg-neutral-300
    
    /* :before */
    before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-['']
    
    /* :after - round knob */
    after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-[1px] after:border-neutral-500
    after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] after:-left-[2px] after:bg-neutral-100
    after:shadow-[0_3px_5px_2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)]
    
    /* :checked */
    checked:bg-red-600

    /* :checked:after - round knob*/
    checked:after:-mt-[3px] 
    checked:after:bg-red-500
    checked:after:border-red-800
    checked:after:transition-[background-color_0.2s,transform_0.2s]
    checked:after:left-[15px]
    
    /* :hover */
    hover:cursor-pointer
    
}

.switch-caption {
    @apply w-min flex flex-col justify-center flex-1
}

.switch-caption:hover { @apply cursor-pointer}

.switch-caption:deep(> *) {
    @apply  h-auto
}
</style>