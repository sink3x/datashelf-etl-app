import type { PaginationProps } from 'antd'

export const INITIAL_CURRENT_PAGE = 1
export const INITIAL_CURRENT_PAGE_SIZE = 10

export const RAW_FILE_SKELETON_ITEM_COUNT = 6

export const SHOW_TOTAL: PaginationProps['showTotal'] = (total) => `Total ${total} items`
