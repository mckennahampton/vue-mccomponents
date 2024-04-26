<script setup lang="ts">
import Tooltip from '../Misc/Tooltip.vue'
import { computed, inject, type ComputedRef } from 'vue'
import FasChevronLeft from '../Icons/FasChevronLeft.vue'
import FasForwardStep from '../Icons/FasForwardStep.vue'
import FasBackwardStep from '../Icons/FasBackwardStep.vue'
import FasChevronRight from '../Icons/FasChevronRight.vue'

interface Props {
    loading: boolean,
    dark: boolean,
}
const props = defineProps<Props>()

const filtered = inject('filtered') as ComputedRef
const navigateTo = inject('navigateTo') as Function
const rowsPerPage = inject('rowsPerPage') as ComputedRef
const currentPage = inject('currentPage') as ComputedRef
const totalItemsLength = inject('totalItemsLength') as ComputedRef
const filteredItems = inject('filteredItems') as ComputedRef

const totalPageCount = computed(() => {
    return filtered.value
    ? filteredItems.value.length > 0 ? Math.ceil(filteredItems.value.length / rowsPerPage.value ) : 1
    : totalItemsLength.value > 0 ? Math.ceil(totalItemsLength.value  / rowsPerPage.value ) : 1
})

const footerPages = computed(() => {
    // Setup the visible footer page navigation elements
    // There should only every be a max of 3 visible, i.e.
    //  current page 1  => *1* 2 3
    //  current page 2  => 1 *2* 3
    //  current page 3  => 2 *3* 4
    //  current page 4  => 2 3 *4*

    let footerMaxPage = 0
    let footerPagesArray = [] as number[]
    // let itemsPageCount = props.filtered
    // ? props.pageItems.length > 0 ? Math.ceil(props.pageItems.length / props.rowsPerPage) : 1
    // : props.totalItems > 0 ? Math.ceil(props.totalItems/ props.rowsPerPage) : 1

    // If there are more than 3 pages of items we need to determine what range of pages to show
    if (totalPageCount.value > 3) {

        // Check if we are within range (of 3) of the last page
        if (currentPage.value == totalPageCount.value || currentPage.value > totalPageCount.value - 2) {
            footerMaxPage = totalPageCount.value // Max footer page is just the last page
        }
        else {
            // We are not within range of the last page, so check if we're at the first page or not
            footerMaxPage = currentPage.value == 1
            ? 3
            : currentPage.value + 1
        }
    }

    // If the page count is < 3 we just use the page count as the max footer page
    else {
        footerMaxPage = totalPageCount.value
    }

    // Finally, reset the footer page elements to our results
    let limit = (totalPageCount.value > 3) ? 3 : totalPageCount.value // If there are 3 or more pages, only show 3 at a time. Otherwise, show the real page count (1 or 2)
    for(let i = 0; i < limit; i++) {
        footerPagesArray.unshift(footerMaxPage - i)
    }
    return footerPagesArray
})

</script>
<template>
    <div class="flex gap-2 [&>*]:hover:cursor-pointer print:hidden items-center mt-3">

        <!-- First -->
        <Tooltip :disable="currentPage == 1" :position="'top'" :class="{'disabled': currentPage == 1 || props.loading }" :dark="dark">
            <template #tooltip>First Page</template>
            <FasBackwardStep @click="navigateTo(1)" class="paginate-icon" :class="{'disabled': currentPage == 1 }" />
        </Tooltip>

        <!-- Previous -->
        <Tooltip :disable="currentPage == 1" :position="'top'" :class="{'disabled': currentPage == 1 || props.loading }" :dark="dark">
            <template #tooltip>Previous Page</template>
            <FasChevronLeft @click="navigateTo(currentPage - 1)" class="paginate-icon" :class="{'disabled': currentPage == 1 }" />
        </Tooltip>

        <!-- Page buttons-->
        <span v-for="page in footerPages"
            class="px-2"
            :class="[
                {'bg-neutral-900 text-white': page == currentPage && !dark},
                {'bg-neutral-300 text-black': page == currentPage && dark},
                {'disabled': props.loading }
            ]"
            @click="navigateTo(page)"
        >
            {{ page }}
        </span>

        <!-- Next -->
        <Tooltip :disable="currentPage == totalPageCount" :position="'top'" :class="{'disabled': currentPage == totalPageCount || props.loading }" :dark="dark">
            <template #tooltip>Next Page</template>
            <FasChevronRight @click="navigateTo(currentPage + 1)" class="paginate-icon" :class="{'disabled': currentPage == totalPageCount }" />
        </Tooltip>

        <!-- Last -->
        <Tooltip :disable="currentPage == totalPageCount" :position="'top'" :class="{'disabled': currentPage == totalPageCount || props.loading }" :dark="dark">
            <template #tooltip>Last Page ({{ totalPageCount }})</template>
            <FasForwardStep @click="navigateTo(totalPageCount)" class="paginate-icon" :class="{'disabled': currentPage== totalPageCount }" />
        </Tooltip>

    </div>

</template>
<style scoped>
.paginate-icon {
    @apply fill-black
}
.dark .paginate-icon {
    @apply fill-neutral-400
}

:deep(.disabled) {
    @apply relative opacity-50
}

:deep(.disabled:after) {
    @apply absolute content-[''] top-0 left-0 h-full w-full transition-all hover:cursor-not-allowed
}
</style>