<script setup lang="ts" generic="T extends object">
import uid from '../Utilities/uid'
import VR from '../Layout/VR.vue'
import Input from '../Inputs/Input.vue'
import Select from '../Inputs/Select.vue'
import Icon from '../Misc/Icon.vue'
import MultiSelect from '../Inputs/MultiSelect.vue'
import { deepValue } from '../Utilities/objectHelpers'
import { ref, reactive, watch, onBeforeMount, computed} from 'vue'

export interface FilterValue {
    value: string | number | boolean | null,
    title?: string,
    active?: boolean,
    classes?: any | any[]
}

export interface Filter {
    metric: string,
    values: FilterValue[],
    current?: string | null,
    searchable?: boolean,
    label?: string,
    multiple?: boolean,
    placeholder?: string,
}

const props = withDefaults(defineProps<{
    items: T[],
    itemUid?: keyof T,
    selectable?: boolean,
    alwaysSelecting?: boolean,
    selectMultiple?: boolean,
    selectFirst?: boolean,
    preSelectedIds?: number[] | string[],
    idKey?: keyof T,
    searchable?: boolean,
    filterable?: boolean,
    filters?: Filter[],
    ignoredKeys?: string[],
}>(),
{
    selectable: false,
    alwaysSelecting: false,
    selectMultiple: false,
    selectFirst: false,
    filterable: false,
    idKey: 'id' as keyof T,
    searchable: false,
})

const emit = defineEmits<{
    selected: [item: T]
}>()

const selection = defineModel<T[]>('selection')

const instanceUid = uid()
const filters = ref(props.filters)
watch(() => props.filters, (newFilters, oldFilters) => {
    filters.value = newFilters
}, {
    deep: true
})

//#region Item Prep

    type ItemWithUid<T> = T & {
        [key: string]: any,
    }
    const itemsWithUid = ref<ItemWithUid<T>[]>()
    const selectState = reactive({})
    const preparePropItems = (items: T[] = props.items) => {
        itemsWithUid.value = []
        itemsWithUid.value = items.map((item, index) => ({
            ...item,
            [instanceUid + '_uid']: props.itemUid ? item[props.itemUid] : uid(),
        }))

        
        itemsWithUid.value.forEach((item, index)=> {
            if (index == 0 && props.selectFirst) selectState[item[instanceUid + '_uid']] = true
            else if (props.preSelectedIds?.some(id => id == item[props.idKey])) selectState[item[instanceUid + '_uid']] = true
            else selectState[item[instanceUid + '_uid']] = false
        })
    }

    // Reactively update the internal table items when the props change
    
    onBeforeMount(() => {
        filters.value?.forEach(filter => {

            // Add a top "All" item if any of them don't have one already
            if (!filter.multiple && !filter.values.some(val => val.value == 'all')) {
                filter.values.unshift({
                    title: 'All',
                    value: 'all',
                    classes: 'mb-2 border-y-2 border-neutral-300',
                })
            }

            // Check if any filter values have a pre-configured "active" value
            // If there is not, then activate the first one by default
            if (!filter.multiple && !filter.values.some(val => val.hasOwnProperty('active'))) {
                filter.values[0].active = true
            }

            // Now backfill the rest as non-active
            filter.values.filter(val => !val.hasOwnProperty('active')).forEach(val => {
                val['active'] = false
            })

        })
    })
    onBeforeMount(() => preparePropItems())
    watch(() => props.items, (newItems, oldItems) => {
        preparePropItems(newItems)
    }, {deep: true})

//#endregion

//#region Selectable

    const isSelecting = ref(props.alwaysSelecting)
    const toggleIsSelecting = () => {
        if (props.alwaysSelecting) return
        isSelecting.value = !isSelecting.value
        deselectAll()
    }

    const selectedCount = computed(() => Object.values(selectState).filter(e => e).length)
    const allDisabled = computed(() => itemsWithUid.value.filter(item => item.disabled).length == itemsWithUid.value.length)
    const allSelected = computed(() => itemsWithUid.value.filter(item => !item.disabled).length == selectedCount.value && itemsWithUid.value.filter(item => !item.disabled).length > 0)
    const itemWIthoutUid = (item: ItemWithUid<T>): T => {
        const o = {...item}
        if (instanceUid + '_uid' in o) delete o[instanceUid + '_uid']
        return o
    }
    const selectedItems = computed<T[]>(() => {
        return itemsWithUid.value?.filter(item => selectState[item[instanceUid + '_uid']]).map(item => itemWIthoutUid(item))
    })
    watch(selectedItems, (newItems, oldItems) => {
        selection.value = newItems
    }, {deep: true})

    const selectedIndexes = computed<number[]>(() => {
        return itemsWithUid.value
            .filter(item => selectState[item[instanceUid + '_uid']])
            .map(item => itemsWithUid.value.indexOf(item))
    })

    const toggleSelectItem = (item: any) => {
        if (item.disabled) return
        if (!props.selectMultiple) deselectAll()
        selectState[item[instanceUid + '_uid']] = !selectState[item[instanceUid + '_uid']]
        emit('selected', item)
    }

    const selectIndex = (index: number) => {
        if (itemsWithUid.value[index].disabled) return
        if (!props.selectMultiple) deselectAll()
        selectState[itemsWithUid.value[index][instanceUid + '_uid']] = true
        emit('selected', itemsWithUid.value[index])
    }

    const deselectAll = () => {
        Object.keys(selectState).forEach(k => selectState[k] = false)
    }

    const selectAll = () => {
        itemsWithUid.value.filter(item => !item.disabled).forEach(item => selectState[item[instanceUid + '_uid']] = true)
    }

    const toggleSelectAll = () => allSelected.value ? deselectAll() : selectAll()

    const itemIsSelected = (item: any) => {
        return selectState[item[instanceUid + '_uid']]
    }

//#endregion

//#region Fitlering

    const quickFilter = ref('')
    

    // Computed properties are not deep watchers, so we need to manually incrememnt
    // the filterDep to trigger the computed property to update
    const filterDep = ref(0)
    // watch(filters, () => filterDep.value++, {deep: true})

    const filterRefs = ref<InstanceType<typeof Select>[] | null>([])

    const filterSelected = (metric: string, values: string[], multiple = false) => {
        if (values) {
            // Set all values to false
            filters.value
                ?.find(filter => filter.metric == metric)
                ?.values.forEach(filterValue => filterValue.active = false)

            // Set the desired value to true
            values.forEach(val => {
                let target = filters.value
                    ?.find(filter => filter.metric == metric)
                    ?.values.find(filterValue => filterValue.value?.toString().toLowerCase() == val?.toString().toLowerCase())
                if (target) target.active = true
            })

        }
        else {
            // Set everything to false except the first "all" option
            filters.value?.forEach(fitler => {
                fitler.values.forEach(filterValue => {
                    filterValue.value == 'all'
                    ? filterValue.active = true
                    : filterValue.active = false
                })
            })
        }
    }

    const resetFilters = () => {
        // Reset the local filter values
        filters.value?.forEach(fitler => {
            fitler.values.forEach(filterValue => {
                filterValue.value == 'all'
                ? filterValue.active = true
                : filterValue.active = false
            })
        })

        // Reset the Select components (for UI)
        filterRefs.value?.forEach(selectComp => selectComp.reset())
    }

    const activeFilters = computed(() => {
        /**
         * Returns an array of all filters with selected (and non-"all") value
         * 
         * Structure:
         * [
         *    { metric: string = dbColumnName, value: string = filterValue },
         *    { metric: string = dbColumnName, value: string = filterValue },
         * ]
         */
        filterDep.value
        let results = filters.value?.some(filter =>filter.values.some(filterValue => filterValue.active && filterValue.value !== 'all'))
        ? filters.value
            .filter(filter => filter.values.some(filterValue => filterValue.active && filterValue.value !== 'all'))
            .map(filter => ({
                metric: filter.metric,
                values: filter.values.filter(filterValue => filterValue.active).map(val => val.value)
            }))
        : false
        return results
    })

//#endregion

//#region Item Globals
const ignoredKeys = ref(['uid', 'base64'].concat(props.ignoredKeys ?? []))

const itemIsQuickFilterMatch = (item: any) => {
    return Object.keys(item).some((key) => {
        if (item[key] && !ignoredKeys.value.includes(key))
        {
            if (Array.isArray(item[key]) || typeof item[key] == 'object') return itemIsQuickFilterMatch(item[key])
            else return item[key].toString().toLowerCase().includes(quickFilter.value.toString().toLowerCase())
        }
    })
}

// const filteredItems = ref<ItemWithUid<T>[]>([]) as Ref<ItemWithUid<T>[]>
const filteredItems = computed(() => {
    let temp = itemsWithUid.value
    // First filter based on any selected explicit filters
    if (activeFilters.value)
    {
        temp = temp.filter(item => {
            if (activeFilters.value)
            {
                let passed = true
                activeFilters.value.forEach(filter => {
                    filter.values.forEach(value =>{
                        if (value && !JSON.stringify(deepValue(filter.metric, item))?.toLowerCase().includes(value.toString()?.toLowerCase())) passed = false
                    })
                })
                return passed
            }
            else return true
        })
    }
    // Then filter by the quick filter
    let results = quickFilter.value
    ? temp.filter(item => itemIsQuickFilterMatch(item))
    : temp;
    return results
    // filteredItems.value = results;

    // return quickFilter.value
    // ? temp.filter(item => JSON.stringify(item).toLowerCase().includes(quickFilter.value.toLowerCase()))
    // : temp
})

defineExpose({
    selectedItems,
    selectIndex,
    selectedIndexes,
})

//#endregion

</script>
<template>
    <div class="w-full flex flex-col items-start justify-center">
        <div v-if="props.filterable || $slots.actionButton || (props.selectable && !props.alwaysSelecting)"
            class="w-full flex items-start justify-between pb-4"
        >
            <div class="flex items-start justify-start">
                <template v-if="props.filterable">
                    <Input
                        v-model="quickFilter"
                        placeholder="Quick filter..."
                        class="!w-[250px]"
                        :render-label="props.filters.length > 0"
                    />
                    <template v-if="props.filters && props.filters.length > 0">
                        <VR />
                        <template v-for="filter in props.filters">
                            <MultiSelect v-if="filter.multiple"
                                button-classes="pb-1 pt-5 w-full min-w-[250px]"
                                class="max-w-[500px]"
                                :items="filter.values.map(item => ({
                                    value: item.value,
                                    ...(item.title && {
                                        title: item.title,
                                    }),
                                    ...(item.classes && {
                                        classes: item.classes
                                    })
                                }))"
                                @update:model-value="vals => filterSelected(filter.metric, vals.map(val => val.hasOwnProperty('value') ? val.value : val), true)"
                                :searchable="filter.searchable"
                                label-styles="capitalize !text-neutral-700"
                                :placeholder="filter.placeholder"
                                optional
                                render-label
                            >
                                <template v-if="filter.label" #label>
                                    {{ filter.label }}
                                </template>
                            </MultiSelect>

                            <Select v-else
                                button-classes="pb-1 pt-5 w-full min-w-[250px] max-w-[300px]"
                                :items="filter.values.map(item => ({
                                    value: item.value,
                                    ...(item.title && {
                                        title: item.title,
                                    }),
                                    ...(item.classes && {
                                        classes: item.classes
                                    })
                                }))"
                                :model-value="filter.values.find(val => val.active)?.value?.toString()"
                                @update:model-value="val => filterSelected(filter.metric, [val])"
                                :searchable="filter.searchable"
                                ref="filterRefs"
                                label-styles="capitalize !text-neutral-700"
                                :placeholder="filter.placeholder"
                            >
                                <template #label>
                                    {{ filter.label ?? filter.metric }}
                                </template>
                            </Select>
                        </template>
                    </template>
                </template>
            </div>

            <!-- Select buttons -->
            <div class="flex justify-end items-center">
                <slot v-if="$slots.actionButton"
                    name="actionButton"
                    :selectedItems="selectedItems"
                    :isSelecting="isSelecting"
                    :toggleIsSelecting="toggleIsSelecting"
                />
                <template v-if="props.selectable && !props.alwaysSelecting">

                    <span
                        class="w-[100px] whitespace-nowrap italic text-neutral-500 select-none hover:cursor-pointer"
                        @click="toggleIsSelecting"
                    >
                        {{ isSelecting ? 'End Selecting' : 'Select Items' }}
                    </span>
                    <template v-if="isSelecting">
                        <Icon v-if="allSelected"
                            @click.stop="toggleSelectAll"
                            :icon-class="'fas fa-check-circle'"
                            class="!w-[14px] mx-2 hover:cursor-pointer"
                        />
                        <Icon v-else
                            @click.stop="toggleSelectAll"
                            :icon-class="'far fa-circle'"
                            class="!w-[14px] mx-2 hover:cursor-pointer"
                        />
                    </template>
                    <Icon v-else
                        :icon-class="'far fa-circle'"
                        class="!w-[14px] mx-2 invisible"
                    />
                </template>

            </div>
        </div>
        <div class="w-full">
            <slot
                :items="filteredItems"
                :selectedItems="selectedItems"
                :isSelecting="isSelecting"
                :toggleSelectItem="toggleSelectItem"
                :itemIsSelected="itemIsSelected"
                :itemWIthoutUid="itemWIthoutUid"
                :selectIndex="selectIndex"
                :toggleSelectAll="toggleSelectAll"
                :allSelected="allSelected"
            />
        </div>
    </div>
</template>