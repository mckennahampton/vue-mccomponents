<script setup lang="ts">
import Input from './Input.vue'
import uid from '../Utilities/uid'
import GlobalLabel from './Partials/GlobalLabel.vue'
import LeftEllipse from '../Displays/LeftEllipse.vue'
import { type ValidationState } from './Partials/InputProps'
import { ref, computed, onBeforeMount, onMounted } from 'vue'
import WithFloatingPanel, { type Placement} from '../Traitables/WithFloatingPanel.vue'

/**
 * "list" layout:
 *  - Pass array of objects in the shape of the Item interface:
 *      - the "value" key will be used in the rendered in the list if the "title" key is not provided
 *      - the "columns" key is not used
 * 
 * "table" layout:
 *  - Pass an array of strings for the component "headers" prop; this will serve as the column headers.
 *  - Pass array of objects in the shape of the Item interface:
 *      - pass an Array<string|number|boolean> "column" key, which will be rendered as a row with as many columns
 *      - the "title" key is not used
 * 
 * "slot" layout
 * - Pass an array of unmodified objects, NOT in the shape of the Item interface.
 * - Optionally, if a "placeholderKey" component prop is provided, the value of that object property will be
 *   used as the placeholder when that object is selected. Otherwise, the first object property will be used.
 * - You will need to use the default slot to render the selection list
 */

 interface Item {
    value: string|number|boolean,
    columns?: Array<string|number|boolean>,
    title?: string|number|boolean,
    classes?: any | any[]
}

type Layout = 'list' | 'table' | 'slot'

interface Props {
    // Data
    modelValue?: string|number|object|boolean|null,
    items: Array<Item | any>,
    modelKey?: string,
    placeholderKey?: string,
    emptyPlaceholder?: string,
    errors?: string[]

    // Layout
    layout?: Layout,
    headers?: Array<string>,
    placement?: Placement,
    renderLabel?: boolean,
            
    // Styling
    itemClasses?: any,
    styles?: string,
    panelClasses?: object | string | string[],
    parentClasses?: object | string | string[],
    labelStyles?: any,
    iconClass?: string,
    iconStyles?: string,
    dark?: boolean,

    // Function
    searchable?: boolean,
    showValidated?: boolean,
    optional?: boolean,
    validationState?: ValidationState,
    closeOnScroll?: boolean,
    resetable?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
    layout: 'list',
    searchable: false,
    showValidated: false,
    optional: false,
    renderLabel: true,
    resetable: true,
    dark: false,
})
const emit = defineEmits(["update:modelValue"])

const inputUid = uid()
const open = ref(false)
const selected = ref<string|number|boolean|object>()
onMounted(() => {
    if (props.modelValue) selected.value = props.modelValue
})
const defaultSelected = props.modelValue

const resetToDefault = () => {
    if (defaultSelected !== null && defaultSelected !== undefined)
    {
        let defaultItem = props.items.find(item => props.modelKey
        //@ts-ignore
        ? item[props.modelKey] == defaultSelected[props.modelKey]
        : item.value == defaultSelected)

        //@ts-ignore
        selected.value = defaultItem?.value ?? defaultItem
    }
    else
    {
        selected.value = undefined
    }
}
onBeforeMount(() => resetToDefault())

const selectedPlaceholder = computed(() => {
    if (typeof selected.value !== 'undefined' && selected.value !== null) {
        let item = props.items?.find((item) => item.value == selected.value)
        if (item && props.layout == 'list') {
            return item.title ?? item.value
        }
        else if (props.layout == 'table') {
            return props.items?.find((item) => item.value == selected.value)?.value
        }
        else {
            return selected.value.hasOwnProperty('value') || props.placeholderKey
            //@ts-ignore
            ? selected.value[props.placeholderKey ?? 0]
            : selected.value
        }
    }
    if (typeof selected.value !== 'undefined' && selected.value !== null)
    {
        return props.layout == 'list'
        ? props.items.find((item) => item.value == selected.value)?.title
        : props.items.find((item) => item.value == selected.value)?.value
    }
    else return props.emptyPlaceholder ?? 'No item selected'
})

const select = (item: Item | any) => {
    open.value = false

    setTimeout(() => {
        if (item.hasOwnProperty('value')) {
            emit('update:modelValue', item.value)
            selected.value = item.value
        }
        else {
            emit('update:modelValue', item)
            selected.value = item
        }
        filter.value = ''
    }, 50)
}

const reset = () => {
    resetToDefault()
    emit('update:modelValue', selected.value)
    open.value = false
}

const clear = () => {
    selected.value = undefined
    emit('update:modelValue', selected.value)
    open.value = false
}

const filter = ref('')
const filteredItems = computed(() => {
    return filter.value
    ? props.items.filter((item) => {
            return Object.keys(item).some((key) => {
                if (key == 'hash' || key == 'icon' || key == 'path') return false
                //@ts-ignore
                return item[key].toString().toLowerCase().includes(filter.value.toString().toLowerCase())
            })
        })
    : props.items
})

const isFiltered = computed(() => Boolean(filter.value))

const quickFilter = ref<InstanceType<typeof Input> | null>(null)
const focusOnFilter = () => setTimeout(() => quickFilter.value?.input?.focus(), 100)

defineExpose({
    reset,
})

// const placeholderRef = ref(null)
// const placeholderConRef = ref(null)
// const { width: placeholderRefWidth } = useElementSize(placeholderRef)
// const { width: placeholderConRefWidth } = useElementSize(placeholderConRef)
// let initialPlaceholderConRefWidth = 0
// onMounted(() => initialPlaceholderConRefWidth = placeholderConRefWidth.value)

</script>
<template>
    <div class="flex flex-col group">
        <GlobalLabel v-if="props.renderLabel || $slots.label"
            :resetable="props.resetable"
            :errors="props.errors"
            :input-uid="inputUid"
            :label-styles="props.labelStyles"
            :optional="props.optional"
            :has-value="selected !== null && selected !== undefined"
            :has-default-value="defaultSelected !== null && defaultSelected !== undefined"
            :value-is-defaulted="defaultSelected === selected"
            :icon-class="props.iconClass"
            :icon-styles="props.iconStyles"
            :validation-state="props.validationState"
            :close-on-scroll="props.closeOnScroll"
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
            v-bind="$attrs"
            class="!w-full border-b-2 !pb-0 border-neutral-400"
            show-icon
            :dark="props.dark"
            allow-clipping
            :instance-type="'select'"
            :placement="props.placement ?? 'bottom'"
            :panel-classes="[props.panelClasses, 'border-[1px] border-neutral-500 max-h-[400px] max-w-min w-full min-w-min scroll-y']"
            :parent-classes="[props.parentClasses, 'w-full justify-between !font-normal']"
            @opened="focusOnFilter"
        >
            <template #parent>
                <LeftEllipse
                    class="select-input min-w-[150px]"
                    :class="[
                        {'italic text-neutral-400': typeof selected == 'undefined' || selected == null},
                    ]"
                    :dark="props.dark"
                >
                    <span v-html="selectedPlaceholder"></span>
                </LeftEllipse>
            </template>
            <template #panel>
                <div class="w-full flex flex-col items-center justify-center gap-3 relative" :class="[{'min-w-[125px]': props.searchable}]">
                    <div v-if="props.searchable"
                        class="w-full px-2 sticky top-0"
                    >
                        <Input
                            @click.stop.prevent
                            v-model="filter"
                            placeholder="Quick Filter..."
                            class="text-base"
                            ref="quickFilter"
                            focus
                            ignore-validation
                            :render-label="false"
                            :dark="props.dark"
                        />
                    </div>

                    <!-- No filter results -->
                    <template v-if="Boolean(filter) && filteredItems.length == 0">
                        <span class="text-base italic text-neutral-500 pb-4">No results</span>
                    </template>

                    <!-- Table Layout -->
                    <template v-else-if="!props.layout || props.layout == 'table'">
                        <table>
                            <thead class="sticky top-0 bg-neutral-950">
                                <th v-for="header in headers" class="text-start pl-[10px] py-2">{{ header }}</th>
                            </thead>
                            <tbody >
                                <tr v-for="item in props.items" @click="select(item)" class="hover:bg-neutral-950 hover:cursor-pointer">
                                    <td v-for="column in item.columns" class="px-2">{{ column }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </template>

                    <!-- List Layout-->
                    <template v-else-if="props.layout == 'list'">
                        <div class="flex flex-col w-full">
                            <div v-for="item in filteredItems"
                                @click="select(item)"
                                class="flex text-base justify-start px-2 py-1 hover:cursor-pointer"
                                :class="[
                                    {'font-bold': selected == item.value},
                                    {'bg-neutral-200': selected == item.value && !props.dark},
                                    {'bg-neutral-700': selected == item.value && props.dark},
                                    {'hover:bg-neutral-100': !props.dark},
                                    {'hover:bg-neutral-800': props.dark},
                                    item.classes,
                                    props.itemClasses
                                ]"
                            >
                                <span v-html="item.title ?? item.value"></span>
                            </div>
                        </div>
                    </template>

                    <!-- View layout -->
                    <template v-else-if="props.layout == 'slot'">
                        <div class="flex flex-col w-full">
                            <slot :select="select" :items="props.items" :is-filtered="isFiltered" />
                        </div>
                    </template>

                </div>
            </template>
        </WithFloatingPanel>
    </div>

</template>