<script setup lang="ts">
import { ref } from 'vue'
import Select from '../../lib/Inputs/Select.vue'

const props = defineProps<{
    dark: boolean,
}>()

const items = [
    {
        title: 'Item 1',
        value: 1
    },
    {
        title: 'Item 2',
        value: 2,
        classes: 'text-green-500'
    },
    {
        value: 3,
    }
]

const simpleModel = ref(null)
const optionalModel = ref(null)
const resetModel = ref(3)
const resetClearModel = ref(2)
const searchableModel = ref(null)
</script>
<template>
    <div class="w-full flex flex-col gap-4">
        <h2 class="text-2xl">Selects</h2>
        <div class="w-full flex items-start gap-10">

            <!-- Simple -->
            <div class="flex flex-col gap-5 ">
                <Select
                    v-model="simpleModel"
                    :items="items"
                    :dark="props.dark"
                >
                    <template #label>
                        Simple
                    </template>
                </Select>
                {{ simpleModel }}
            </div>

            <!-- Optional -->
            <div class="flex flex-col gap-5">
                <Select
                    v-model="optionalModel"
                    :items="items"
                    :dark="props.dark"
                    optional
                >
                    <template #label>Optional</template>
                </Select>
                {{ optionalModel }}
            </div>

            <!-- Resettable -->
            <div class="flex flex-col gap-5">
                <Select
                    v-model="resetModel"
                    :items="items"
                    :dark="props.dark"
                >
                    <template #label>Resettable</template>
                </Select>
                {{ resetModel }}
            </div>

            <!-- Reset clear -->
            <div class="flex flex-col gap-5">
                <Select
                    v-model="resetClearModel"
                    :items="items"
                    :dark="props.dark"
                    optional
                >
                    <template #label>Reset & Clear</template>
                </Select>
                {{ resetClearModel }}
            </div>

            <!-- Searchable Model -->
            <div class="flex flex-col gap-5">
                <Select
                    v-model="searchableModel"
                    :items="items"
                    label="Searchable"
                    :dark="props.dark"
                    searchable
                >
                    <template #label>Searchable</template>
                </Select>
                {{ searchableModel }}
            </div>

        </div>
    </div>
</template>