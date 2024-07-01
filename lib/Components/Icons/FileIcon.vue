<script setup lang="ts">
import FasCsv from './Filetypes/FasCsv.vue'
import FasPdf from './Filetypes/FasPdf.vue'
import FasWord from './Filetypes/FasWord.vue'
import FasAudio from './Filetypes/FasAudio.vue'
import FasExcel from './Filetypes/FasExcel.vue'
import FasImage from './Filetypes/FasImage.vue'
import FasVideo from './Filetypes/FasVideo.vue'
import FasArchive from './Filetypes/FasArchive.vue'
import FasDefault from './Filetypes/FasDefault.vue'
import FasPowerPoint from './Filetypes/FasPowerPoint.vue'
import { words, archives, videos, images, audios, excels, powerpoints } from '../Inputs/fileTypes'

const props = defineProps<{
    fileType: string,
}>()

</script>
<template>
    <FasArchive v-if="archives.some(type => type == props.fileType)" />
    <FasAudio v-else-if="audios.some(type => type == props.fileType)" />
    <FasImage v-else-if="images.some(type => type == props.fileType)" />
    <FasVideo v-else-if="videos.some(type => type == props.fileType)" />
    <FasExcel v-else-if="excels.some(type => type == props.fileType)" />
    <FasWord v-else-if="words.some(type => type == props.fileType)" />
    <FasPowerPoint v-else-if="powerpoints.some(type => type == props.fileType)" />
    <FasCsv v-else-if="props.fileType == 'csv'" />
    <FasPdf v-else-if="props.fileType == 'pdf'" />
    <FasDefault v-else />
</template>