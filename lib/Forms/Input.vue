<script setup lang="ts">
import uid from '../Utilities/uid'
import GlobalLabel from './Partials/GlobalLabel.vue'
import { ref, watch, computed, onMounted } from 'vue'
import DropdownItem from '../Buttons/DropdownItem.vue'
import { type ValidationState } from './Partials/InputProps'
import TransitionFade from '../Transitions/TransitionFade.vue'
import TypingIndicator from '../Indicators/TypingIndicator.vue'
import WithFloatingPanel, { type Placement } from '../Traitables/WithFloatingPanel.vue'

export interface Search {
    items: (string | number | object | null)[],
    placement?: Placement,
    offset?: number,
}

const props = withDefaults(defineProps<{
    inputInitialValue?: string | number,
    modelValue?: string | number | object | null,
    showValidated?: boolean,
    labelStyles?: any,
    placeholder?: string,
    format?: 'string' | 'number',
    focus?: boolean,
    ignoreValidation?: boolean,
    renderLabel?: boolean,
    dark?: boolean,
    search?: Search,
    autocomplete?: boolean,
    optional?: boolean,
    readonly?: boolean,
    validationState?: ValidationState,
    debounce?: boolean,
}>(), {
    showValidated: false,
    format: 'string',
    focus: false,
    ignoreValidation: false,
    renderLabel: true,
    dark: false,
    optional: false,
    readonly: false,
    debounce: false
})

const validNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const validSpecialKeys = ['Backspace', 'Tab', 'Shift', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Control', 'Alt']

const emit = defineEmits(["update:modelValue"]);

const input = ref<HTMLElement | null>(null)
const inputValue = ref(props.modelValue ?? null)
const defaultValue = ref(props.modelValue ?? null)
const inputUid = uid()

const validate = (e: KeyboardEvent) => {
    if (props.format == 'number' && !validNumbers.includes(e.key) && !validSpecialKeys.includes(e.key)) e.preventDefault()
}

const emptyClass = computed(() => inputValue.value ? 'not-empty' : 'empty')

const updateTimeout = ref<NodeJS.Timeout>()
const timeoutRunning = ref(false)
watch(inputValue, () => {
    if (props.debounce && Boolean(inputValue.value))
    {
        timeoutRunning.value = true
        if (updateTimeout.value) clearTimeout(updateTimeout.value)
        updateTimeout.value = setTimeout(() => {
            timeoutRunning.value = false
            emit('update:modelValue', inputValue.value ?? '')
        }, 500)
    }
    else emit('update:modelValue', inputValue.value ?? '')
})

watch(props, () => {
    if(props.modelValue) inputValue.value = props.modelValue
    else inputValue.value = null
})

defineExpose({
    input
})

onMounted(() => {
    //@ts-ignore
    if (props.focus) setTimeout(() => input.value?.focus(), 100)
})

const filteredItems = computed(() => {
    if (!props.search) return
    return props.search?.items?.filter(item => {
        if (inputValue.value)
        {
            if ( item?.toString().toLowerCase().includes(inputValue.value.toString().toLowerCase()) ) return true
            else return false
        }

        return true
    })
})

const selected = (item: string | number | object | null) => {
    inputValue.value = item
    emit('update:modelValue', item)
}

const reset = () => {
    if (defaultValue.value) inputValue.value = defaultValue.value
    emit('update:modelValue', inputValue.value)
}

const clear = () => {
    inputValue.value = null
    emit('update:modelValue', inputValue.value)
}

</script>
<template>
    <div class="flex flex-col group">
        <GlobalLabel v-if="$slots.label || props.renderLabel"
            :input-uid="inputUid"
            :label-styles="props.labelStyles"
            :optional="props.optional"
            :has-value="Boolean(inputValue)"
            :has-default-value="props.readonly ? false : Boolean(defaultValue)"
            :value-is-defaulted="inputValue === defaultValue"
            :validation-state="props.validationState"
            :dark="props.dark"
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

        <WithFloatingPanel
            class="!w-full relative"
            :show-icon="false"
            :offset="props.search?.offset ?? 0"
            :functional="Boolean(props.search)"
            :placement="props.search?.placement ?? 'bottom'"
            :parent-classes="'!p-0 !font-normal w-full border-transparent'"
            :panel-classes="'!text-base max-h-[300px]'"
        >
            <template #parent="slotProps">
                <input
                    v-bind="$attrs"
                    @keydown="e => validate(e)"
                    style="box-shadow: none;"
                    :class="[
                        emptyClass,
                        {'border-b-green-500 ': props.validationState?.errors && props.validationState.errors.length > 0 && showValidated},
                        props.validationState?.errors && props.validationState.errors.length > 0 ? 'border-red-500' : 'border-neutral-300',
                        props.dark ? 'text-white !border-b-neutral-700' : 'text-black !border-b-neutral-400'
                    ]"
                    class="w-full h-10 text-gray-900 border-b-2 bg-transparent focus:outline-none ellipse"
                    v-model="inputValue"
                    :id="inputUid"
                    :placeholder="placeholder" 
                    :autocomplete="props.autocomplete ? 'on' : 'off'"
                    @blur="Boolean(props.search) ? slotProps.openPanel : null"
                    :readonly="props.readonly"
                    ref="input"
                />
                
                <TransitionFade>
                    <TypingIndicator v-if="timeoutRunning" class="absolute top-[50%] transform -translate-y-[50%] right-5" />
                </TransitionFade>
            </template>
            <template v-if="props.search && filteredItems" #panel>
                <DropdownItem v-for="item in filteredItems" @click="selected(item)" :dark="props.dark">
                    {{ item }}
                </DropdownItem>
            </template>
        </WithFloatingPanel>
    </div>
</template>
<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Read-only */ input[readonly] { @apply pointer-events-none text-center }

label
{
    @apply translate-y-8 ml-2
}

/* Floating label styles */
label:has(~ input:focus),
label:has(~ input:placeholder-shown),
label:has(~ input.not-empty),
label:has(~ div input:focus),
label:has(~ div input:placeholder-shown),
label:has(~ div input.not-empty),
label.label-required
{
    @apply translate-y-0 ml-0
}

</style>./Validations.vue