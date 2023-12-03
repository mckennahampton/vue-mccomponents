<script setup lang="ts">
import Input from './Input.vue'
import { ref, computed } from 'vue'
import DropdownButton from '../Buttons/DropdownButton.vue'

interface Item {
    columns?: Array<string|number|Boolean>,
    title?: string,
    value: string | number | boolean | null,
    classes?: any | any[],
    active?: boolean,
}

type Layout = 'list' | 'table' | 'slot'

interface Props {
    headers?: Array<string>,
    items: Array<Item>,
    modelValue?: string|number|object|null,
    styles?: string,
    layout?: Layout,
    optional?: Boolean,
    placeholderKey?: string,
    placement?: 'bottom' | 'top' | 'left' | 'right' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
    dropdownClasses?: object | string | string[],
    buttonClasses?: object | string | string[],
    searchable?: boolean,
    emptyPlaceholder?: string,
    label?: string,
    labelStyle?: string | object | any[],
    dark?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
    layout: 'list',
    searchable: false,
    dark: false
})
const emit = defineEmits(["update:modelValue"])

const placeholder = ref(null)
const open = ref(false)
const selected = ref(props.modelValue ?? null)
const defaultSelected = ref(props.modelValue ?? null)

const selectedPlaceholder = computed(() => {
    if (selected.value) {
        let item = props.items.find((item) => item.value == selected.value)
        if (props.layout == 'list') {
            return item?.title ?? item?.value
        }
        else if (props.layout == 'table') {
            return props.items.find((item) => item.value == selected.value)?.value
        }
        else {
            return props.placeholderKey
            ? (selected.value?[props.placeholderKey] : selected.value)
            : selected.value
        }
    }
    return selected.value
    ? props.layout == 'list' ? props.items.find((item) => item.value == selected.value)?.title : props.items.find((item) => item.value == selected.value)?.value
    : props.emptyPlaceholder ?? 'No item selected'
})

const select = (item: Item | any) => {
    if (item.hasOwnProperty('value')) {
        emit('update:modelValue', item.value)
        selected.value = item.value
    }
    else {
        emit('update:modelValue', item)
        selected.value = item
    }
    open.value = false
    filter.value = ''
};

const reset = () => {
    emit('update:modelValue', null)
    selected.value = defaultSelected.value
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

defineExpose({
    reset,
})

</script>
<template>
     <label v-if="props.label"
        class="absolute text-sm top-0 origin-[0] px-2 left-1 -translate-y-2 -translate-x-2"
        :class="[
            props.labelStyle,
            dark ? 'text-white' : 'text-black'
        ]"
    >
        {{ props.label }}
    </label>
    <DropdownButton
        v-bind="$attrs"
        show-icon
        :placement="props.placement ?? 'bottom'"
        :dropdown-classes="[props.dropdownClasses, 'border-[1px] border-neutral-500 max-h-[400px] w-full min-w-min bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-transparent text-black']"
        :button-classes="[props.buttonClasses, `border-b-2 ${dark ? 'border-neutral-700' : 'border-neutral-400'} w-full justify-between !font-normal`]"
    >
        <template #button>
            <div v-if="props.optional" @click="reset" class="absolute bottom-full right-0 text-black italic py-1 hover:cursor-pointer">Reset</div>
            <div 
                class="select-input"
                :class="[{'italic text-neutral-400': !selected || selected == 'none' || selected == 'all'}]"
                ref=placeholder
            >
                {{ selectedPlaceholder }}
            </div>
        </template>
        <template #dropdown>
            <div class="w-full flex flex-col items-center justify-center gap-3" :class="[{'min-w-[125px]': props.searchable}]">
                <div v-if="props.searchable" class="w-full px-2">
                    <Input v-model="filter" placeholder="Quick Filter..." class="text-base"/>
                </div>

                <!-- Table Layout -->
                <template v-if="!props.layout || props.layout == 'table'">
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
                            class="flex text-base justify-start px-2 py-1   hover:cursor-pointer"
                            :class="[
                                dark ? 'text-neutral-200 hover:bg-neutral-800' : 'text-neutral-950 hover:bg-neutral-300',
                                {'font-bold': selected == item.value},
                                {'bg-neutral-900': selected == item.value && dark},
                                {'bg-neutral-200': selected == item.value && !dark},
                                item.classes
                            ]"
                        >
                            {{ item.title ?? item.value }}
                        </div>
                    </div>
                </template>

                <!-- View layout -->
                <template v-else-if="props.layout == 'slot'">
                    <div class="flex flex-col w-full">
                        <slot :select="select" />
                    </div>
                </template>

            </div>
        </template>
    </DropdownButton>

</template>