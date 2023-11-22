<script setup lang="ts">
import Tooltip from '../Tooltip.vue'
import { computed, inject, type ComputedRef } from 'vue'
import FasBackwardStep from '../Icons/FasBackwardStep.vue'
import FasChevronLeft from '../Icons/FasChevronLeft.vue'
import FasChevronRight from '../Icons/FasChevronRight.vue'
import FasForwardStep from '../Icons/FasForwardStep.vue'

interface Props {
    fixed: boolean,
    loading: boolean,
}
const props = defineProps<Props>()

const filtered = inject('filtered') as ComputedRef
const navigateTo = inject('navigateTo') as Function
const rowsPerPage = inject('rowsPerPage') as ComputedRef
const currentPage = inject('currentPage') as ComputedRef
const pageItemsLength = inject('pageItemsLength') as ComputedRef
const totalItemsLength = inject('totalItemsLength') as ComputedRef

const totalPageCount = computed(() => {
    return filtered.value
    ? pageItemsLength.value > 0 ? Math.ceil(pageItemsLength.value / rowsPerPage.value ) : 1
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
    <div
        class="flex gap-2 [&>*]:hover:cursor-pointer print:hidden"
        :class="[
            {'disabled': filtered || props.loading},
            {'justify-end mt-5': !props.fixed},
        ]"
    >
        <!-- First -->
        <Tooltip :body="'First Page'" :disable="currentPage == 1" :position="'top'">
            <span :class="{'disabled': currentPage == 1 }">
                <FasBackwardStep @click="navigateTo(1)"/>
            </span>
        </Tooltip>

        <!-- Previous -->
        <Tooltip :body="'Previous Page'" :disable="currentPage == 1" :position="'top'">
            <span :class="{'disabled': currentPage == 1 }">
                <FasChevronLeft @click="navigateTo(currentPage - 1)" />
            </span>
        </Tooltip>

        <!-- Page buttons-->
        <span v-for="page in footerPages"
            class="px-2"
            :class="{'bg-locke-red-500 text-white': page == currentPage}"
            @click="navigateTo(page)"
        >
            {{ page }}
        </span>

        <!-- Next -->
        <Tooltip :body="'Next Page'" :disable="currentPage == totalPageCount" :position="'top'">
                <span :class="{'disabled': currentPage == totalPageCount }">
                    <FasChevronRight @click="navigateTo(currentPage + 1)" />
                </span>
        </Tooltip>

        <!-- Last -->
        <Tooltip :body="'Last Page'" :disable="currentPage == totalPageCount" :position="'top'">
            <span :class="{'disabled': currentPage== totalPageCount }">
                <FasForwardStep @click="navigateTo(totalPageCount)" />
            </span>
        </Tooltip>

    </div>

</template>
<style scoped>
.disabled {
    @apply relative
}

.disabled:after {
    @apply absolute content-[''] top-0 left-0 h-full w-full transition-all bg-white opacity-50 hover:cursor-not-allowed
}
</style>