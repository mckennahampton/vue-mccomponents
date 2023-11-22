export interface Link {
    url: string | null,
    label: string,
    active: boolean,
}

export interface LengthAwarePaginator {
    current_page: 1,
    data: any[],
    first_page_url: string,
    from: number,
    last_page: number,
    last_page_url: string,
    links: Link[],
    next_page_url: string,
    path: string,
    per_page: number,
    prev_page_url: string | null,
    to: number,
    total: number,
}