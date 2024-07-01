import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vue McComponents",
  description: "Vue Components",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/composables/backend-validation/' }
    ],

    sidebar: [
        { 
            text: 'Forms',
            items: [
                {}
            ]
        },
        {
            text: 'Components',
            collapsed: false,
            items: [
                { text: 'Accordion', link: '/components/accordion/'},
                { text: 'Buttons', items: [
                    { text: 'Primary Button', link: '/components/buttons/primary-button/'},
                    { text: 'Muted Button', link: '/components/buttons/muted-button'},
                    { text: 'Dropdown Button', link: '/components/buttons/dropdown-button'},
                ]},
                { text: 'Callout', link: '/components/callout/'},
                { text: 'List', link: '/components/list/'},
                { text: 'Cards', items: [
                    { text: 'Simple Card', link: '/components/simple-card/'},
                    { text: 'Rich Card', link: '/components/rich-card/'},

                ]},
                { text: 'Carousel', link: '/components/carousel/'},
                { text: 'Font Awesome', link: '/components/font-awesome/'},
                { text: 'Gallery', link: '/components/gallery/'},
                { text: 'Pill', link: '/components/pill/' },
                { text: 'Highlighters', items: [
                    { text: 'JSON', link: '/components/json-highlighter/'},
                    { text: 'PHP', link: '/components/php-highlighter'},
                    { text: 'PHP Stacktrace', link: '/components/php-stacktrace-highlighter'},
                ]},
                { text: 'Indicators', items: [
                    { text: 'Horizontal Indicator', link: '/components/horizontal-indicator/'},
                    { text: 'Horizontal Loading Bar', link: '/components/horizontal-loading-bar/'},
                    { text: 'Pending Indicator', link: '/components/pending-indicator/'},
                    { text: 'Progress Bar', link: '/components/progress-bar/'},
                ]},
                { text: 'Layout Rules', items: [
                    { text: 'Horizontal Rule', link: '/components/horizontal-rule/'},
                    { text: 'Vertical Rule', link: '/components/vertical-rule/'}
                ]},
                { text: 'Safe Teleport', link: '/components/safe-teleport/'},
                { text: 'Searcher', link: '/components/searcher/'},
                { text: 'Skeletons', items: [
                    { text: 'Side Menu Skeleton', link: '/components/side-menu-skeleton/'},
                    { text: 'Subtitle Skeleton', link: '/components/subtitle-skeleton/'},
                    { text: 'Callout Skeleton', link: '/components/callout-skeleton/'},
                    { text: 'Generic Skeleton', link: '/components/generic-skeleton/'},
                    { text: 'Pill Skeleton', link: '/components/pill-skeleton/'},
                    { text: 'Table Skeleton', link: '/components/table-skeleton/'},
                ]},
                { text: 'Spinner', link: '/components/spinner/'},
                { text: 'Stepper', link: '/components/stepper/'},
                { text: 'Table', link: '/components/table/'},
                { text: 'Tabs', link: '/components/tabs/'},
                { text: 'Tooltip', link: '/components/tooltip'},
                { text: 'Collection', link: '/components/collection/'},
                { text: 'With Popover', link: '/components/with-popover/'},
            ]
        },
        {
            text: 'Composables',
            collapsed: false,
            items: [
                { text: 'Backend Validation', link: '/composables/backend-validation/'},
                { text: 'Confirm', link: '/composables/confirm/'},
                { text: 'Empty Slot Check', link: '/composables/empty-slot-check/'},
                { text: 'Modal', link: '/composables/modal/'},
            ]
        },
        {
            text: 'Transitions',
            items: [
                { text: 'Expand', link: '/transitions/expand/'},
                { text: 'Fade', link: '/transitions/fade/'},
                { text: 'Slide From Left', link: '/transitions/slide-from-left/'},
                { text: 'Slide From Right', link: '/transitions/slide-from-right/'},
                { text: 'Slide From Bottom', link: '/transitions/slide-from-bottom/'}
            ]
        },
        {
            text: 'Utilities',
            collapsed: false,
            items: [
                { text: 'Arrays', link: '/utilities/arrays/'},
                { text: 'Dates', link: '/utilities/dates/'},
                { text: 'Download', link: '/utilities/download/'},
                { text: 'Numbers', link: '/utilities/numbers/'},
                { text: 'Objects', link: '/utilities/objects/'},
                { text: 'Files', link: '/utilities/files/'},
                { text: 'Strings', link: '/utilities/strings/'},
                { text: 'UID', link: '/utilities/uid/'},

            ]
        }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
