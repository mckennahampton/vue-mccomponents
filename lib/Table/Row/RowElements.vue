<script setup lang="ts">
import RowSelect from './RowSelect.vue'
import Tooltip from '../../Tooltip.vue'
import { type Header } from '../Header/HeaderElements.vue'
import { inject, ref, onMounted, onUpdated, ComputedRef } from 'vue'

interface Props {
    items: any[],
    headers: Header[],
    rowClasses?: string | object | any[]
}
const props = defineProps<Props>()

const selectable = inject('selectable') as boolean
const currentPage = inject('currentPage') as ComputedRef
const toggleSelectItem = inject('toggleSelectItem') as Function
const itemIsSelected = inject('itemIsSelected') as Function

//#region Mobile Styling

    // Adds header prefix to each td element for mobile use (used in the <style> tag below)
    const rowRefs = ref([] as HTMLElement[])
    const setMobileHeaderPrefixes = () => {
        rowRefs.value.forEach(row => {
            const tds = row.querySelectorAll('td')
            const loopLength = selectable ? (tds.length - 1) : tds.length
            for (var i = 0; i < loopLength; i++) {
                tds[i].setAttribute('header', props.headers[i].caption)
            }
        })
    }

    onMounted(() => {
        setMobileHeaderPrefixes()
    })
    onUpdated(() => {
        setMobileHeaderPrefixes()
    })
    
//#endregion

</script>
<template>
    <Transition name="page" mode="out-in">
        <TransitionGroup
            name="list"
            tag="tbody"
            :key="currentPage"
        >
            <tr v-for="item in props.items"
                :class="[
                    {'even:!bg-cyan-100 dark:even:!bg-cyan-800 odd:!bg-cyan-200 dark:odd:!bg-cyan-900': selectable && itemIsSelected(item)},
                    {'[&>*]:disabled': item.disabled},
                    props.rowClasses
                ]"
                class="odd:bg-black dark:odd:bg-white odd:!bg-opacity-5 transition-all relative"
                @dblclick="item.disabled ? null : toggleSelectItem(item)"
                ref="rowRefs"
                :key="item.key ?? item.id ?? item.uid ?? JSON.stringify(item)"
            >

                <!-- Main row content -->
                <slot name="rows" :item="item" />
                    
                <!-- Select button -->
                <RowSelect v-if="selectable" :item="item" />

                <!-- Overlay for disabled items -->
                <Tooltip v-if="item.disabled"
                    :body="item.tooltipBody ?? 'Item is disabled'"
                    position="center"
                    manual-ref
                >
                    <template v-slot="{setRef}">
                        <span class="!absolute w-full h-full left-0 top-0" :ref="r=>setRef(r)"></span>
                    </template>
                </Tooltip>
            </tr>
        </TransitionGroup>
    </Transition>
</template>
<style scoped>
tr :deep(td), table :deep(.header-prefix) {
    @apply py-1 pl-2 text-sm
}

/* #region List add/remove/move transition */
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease-in-out;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}


/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
/* #endregion */

/* #region Page Change Transition */
.page-leave-active { transition: all 50ms cubic-bezier(1, 0.5, 0.8, 1); }
.page-enter-from, .page-leave-to { opacity: 0; }
.page-enter-active { transition: all 50ms ease-in;  }
.page-enter-to { opacity: 1; }
/* #endregion */

.disabled {
    @apply relative
}

.disabled:after {
    @apply absolute content-[''] top-0 left-0 h-full w-full transition-all bg-white opacity-50 hover:cursor-not-allowed
}
</style>
