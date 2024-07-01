import { type Placement } from '../Traitables/WithFloatingPanel.vue'

export interface ExternalPaginationFetchArgs {
    page: number,
    rows: number,
    start?: Date,
    end?: Date
}

export interface CellOptions {
    classes?: string | any[] | object,
    suggestedWidth?: number,
    ellipse?: boolean,
    useMinimumSpace?: boolean,
}

export interface ExportOptions {
    isDate?: boolean,
    dateFormat?: 'timestampToISO' | 'timestampToLocaleTime' | 'timestampToLocaleDate' | 'timestampToFullFormatted' | 'timestampToAbreviatedDate'
    skip?: boolean,
}

export interface Column {
    caption: string,
    captionProps?: any,
    key: string,
    classes?: string | any[] | object,
    cellOptions?: CellOptions,
    exportOptions?: ExportOptions,
    sort?: boolean,
}

export interface InternalColumn extends Column {
    uid: string,
    width: number,
    cellSlotName: string,
    headerSlotName: string,
    headerHasSlotContent: boolean,
    useExplicitWidth: boolean,
}

export interface LaravelFormattedFilter {
    metric: string,
    value: any
}

export interface FilterValue {
    value: string | number | boolean | null,
    title?: string,
    active?: boolean,
}

export interface Filter {
    metric: string,
    values: FilterValue[],
    current?: string | null,
    searchable?: boolean,
    label?: string,
}

export interface ExportConfig {
    csv?: boolean,
    pdf?: boolean,
    print?: boolean,
    reportTitle?: string,
}

export type Direction = 'forwards' | 'backwards' | 'none' | 'initial'

export interface LaravelFormattedOrderBy {
    title?: string,
    metric: string,
    dir: 'asc' | 'desc'
}

export type TableItem<T> = T & {
    disabled?: boolean,
    tooltipBody?: string,
}

export type ItemWithUid<T> = TableItem<T> & {
    [key: string]: any,
}

export interface RowActionButtonConfig {
    placement?: Placement,
    allowClipping?: boolean,
    offset?: number,
}

export interface SelectState {
    [key: string]: boolean,
}