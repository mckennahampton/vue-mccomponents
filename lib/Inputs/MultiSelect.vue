<script setup lang="ts">
import Input from './Input.vue'
import uid from '../Utilities/uid'
import GlobalLabel from './Partials/GlobalLabel.vue'
import FasXMark from '../Icons/FasXMark.vue'
import { ref, computed, onBeforeMount, onMounted } from 'vue'
import { ValidationState } from './Partials/InputProps'
import WithFloatingPanel, { type Placement} from '../Traitables/WithFloatingPanel.vue'

export interface Item {
    title?: string|number|boolean,
    value: string|number|boolean,
    columns?: Array<string|number|boolean>,
    classes?: any | any[]
}

interface Props {
    items: Item[],
    placeholder?: string,
    tagPosition?: 'top' | 'bottom'
    modelValue?: Item[],
    showIcon?: boolean,
    buttonClasses?: string | any[] | object,
    placement?: Placement,
    layout?: 'list' | 'table' | 'slot',
    columns?: string[],
    labelStyles?: any,
    selectOnlyValues?: boolean,
    renderLabel?: boolean,
    optional?: boolean,
    validationState?: ValidationState,
    dark?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
    placement: 'bottom',
    layout: 'list',
    renderLabel: false,
    optional: false,
    selectOnlyValues: false,
    dark: false,
})

const emit = defineEmits(['update:modelValue'])

const inputUid = uid()
const open = ref(false)
const selectedItems = ref<Item[]>([])
const placeholder = ref(props.placeholder ?? 'Filter...')
const inputFilter = ref('')
const defaultSelected = [] as (Item)[]
onMounted(() => {
    if (props.modelValue)
    {
        props.modelValue
        .map(item => typeof item === 'object' ? item : props.items.find(i => i.value == item))
        .forEach(item => {
            if (item)
            {
                defaultSelected.push(item)
                selectedItems.value.push(item)
            }
        })
    }
})

const selectedItemValues = computed(() => selectedItems.value.map(item => typeof item === 'object' ? item.value : item))

const dropdownItems = computed(() => {
    return props.items.filter(item => !selectedItems.value.some(i => i?.value == item.value)) // Return only non-selected items
    .filter(item =>
        inputFilter.value
        ? Object.keys(item).some((key) => {
            //@ts-ignore
            return item[key]
            //@ts-ignore
            ? item[key].toString().toLowerCase().includes(inputFilter.value.toString().toLowerCase())
            : false
        })
        : true
    ) // Return filtered results
})

const select = (item: Item) => {
    selectedItems.value.push(item)
    open.value = false
    inputFilter.value = ''

    if (props.selectOnlyValues) emit('update:modelValue', selectedItems.value)
    else emit('update:modelValue', selectedItemValues.value)
}

const remove = (item: Item) => {
    let index = selectedItems.value.findIndex(_item => (typeof _item === 'object' ? _item.value : _item) == item.value)
    if (index > -1) selectedItems.value = selectedItems.value.filter(_item => (typeof _item === 'object' ? _item.value : _item) !== item.value)
    emit('update:modelValue', selectedItems.value)
}

const resetToDefault = () => {
    selectedItems.value.length = 0
    defaultSelected.forEach(item => selectedItems.value.push(item))
}
onBeforeMount(() => resetToDefault())

const reset = () => {
    resetToDefault()
    emit('update:modelValue', selectedItems.value)
    open.value = false
}

const clear = () => {
    selectedItems.value = []
    emit('update:modelValue', selectedItems.value)
    open.value = false
}

</script>
<template>
    <div class="flex flex-col w-full group">
        <div class="flex flex-col">
            <GlobalLabel v-if="$slots.label || props.renderLabel"
                :input-uid="inputUid"
                :label-styles="props.labelStyles"
                :optional="props.optional"
                :has-value="selectedItems.length > 0"
                :has-default-value="defaultSelected.length > 0"
                :value-is-defaulted="defaultSelected == selectedItems"
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

            <WithFloatingPanel
                :placement="props.placement"
                :class="['border-b border-b-neutral-300 !w-full !pb-0 !pt-1 !font-normal ', props.buttonClasses]"
                :panel-classes="'max-h-[300px] scroll-y'"
                :show-icon="$props.showIcon"
                :instance-type="'multi-select'"
            >
                <template #parent>

                    <!-- Input filter -->
                    <Input
                        v-model="inputFilter"
                        type="text"
                        :placeholder="placeholder"
                        class="flex-1 grow w-full bg-transparent border-none focus:ring-0 text-black h-[34px]"
                        :render-label="false"
                    />
                
                </template>
                <template #panel>

                    <!-- Table Layout -->
                    <template v-if="props.layout == 'table'">
                        <table>
                            <thead class="sticky top-0 bg-neutral-200">
                                <th v-for="column in columns" class="text-start pl-[10px] py-2">{{ column }}</th>
                            </thead>
                            <tbody >
                                <tr v-for="item in dropdownItems" @click="select(item)" class="hover:bg-neutral-200 hover:cursor-pointer">
                                    <td v-for="column in item.columns" class="px-2" v-html="column"></td>
                                </tr>
                            </tbody>
                        </table>
                    </template>

                    <!-- Items to select -->
                    <div v-else-if="props.layout == 'list'"
                        v-for="item in dropdownItems"
                        @click="select(item)"
                        class="flex justify-start px-2 py-1 hover:cursor-pointer hover:bg-neutral-100"
                        :class="[item.classes]"
                        v-html="item.title ?? item.value"
                    >
                    </div>

                    <!-- View layout -->
                    <template v-else-if="props.layout == 'slot'">
                        <div class="flex flex-col w-full">
                            <slot :select="select" />
                        </div>
                    </template>
                
                </template>
            </WithFloatingPanel>
        </div>
        

        <!-- Selected Tag bubbles -->
        <div class="flex multi-select flex-wrap gap-3 max-h-[350px] scroll-y mt-4">
            <span v-if="selectedItems.length > 0" v-for="item in selectedItems" class="flex basis-0 items-center whitespace-nowrap px-3 py-1 gap-3 bg-neutral-100 border border-neutral-800 text-black">
                <FasXMark @click="remove(item)" class="hover:cursor-pointer"/>
                {{ item.title ?? item.value }}
            </span>
        </div>
    </div>
</template>