import React, { memo, type Key, type ReactElement, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import {
    TablePagination,
    TableShell,
    TableStateRow,
    type PaginationMode,
    type TableClassNames,
    type TableHeader,
} from './TablePrimitives';

export type ServerTableProps<T = unknown> = {
    items: T[];
    headers: TableHeader[];
    renderRow: (item: T, index: number) => ReactNode;
    itemsPerPage?: number;
    pageSizeOptions?: number[];
    isLoading?: boolean;
    emptyText?: ReactNode;
    loadingText?: string;
    currentPage?: number;
    totalPages?: number;
    nextPageUrl?: string | null;
    prevPageUrl?: string | null;
    total?: number;
    onPageChange?: (url: string | null) => void;
    onPageSelect?: (page: number) => void;
    getPageUrl?: (page: number) => string | null;
    onPageSizeChange?: (pageSize: number) => void;
    showPagination?: boolean;
    showPageSizeSelector?: boolean;
    paginationMode?: PaginationMode;
    maxPageButtons?: number;
    caption?: string;
    className?: string;
    classNames?: TableClassNames;
    getRowKey?: (item: T, index: number) => Key;
};

/** @deprecated Use ServerTableProps instead. */
export type PaginatedSearchTableProps<T = unknown> = ServerTableProps<T>;

function ServerTableInner<T = unknown>({
    items,
    headers,
    renderRow,
    itemsPerPage = 10,
    pageSizeOptions = [10, 25, 50, 100],
    isLoading = false,
    emptyText = 'No available data',
    loadingText = 'Loading...',
    currentPage = 1,
    totalPages,
    nextPageUrl,
    prevPageUrl,
    total = items.length,
    onPageChange,
    onPageSelect,
    getPageUrl,
    onPageSizeChange,
    showPagination = true,
    showPageSizeSelector = true,
    paginationMode = 'numbers',
    maxPageButtons = 5,
    caption,
    className,
    classNames,
    getRowKey,
}: ServerTableProps<T>): ReactElement {
    const safePageSize = Math.max(1, itemsPerPage);
    const resolvedTotalPages = Math.max(
        1,
        totalPages ?? Math.ceil(total / safePageSize),
    );
    const page = Math.min(Math.max(1, currentPage), resolvedTotalPages);
    const from = total === 0 ? 0 : (page - 1) * safePageSize + 1;
    const to = total === 0 ? 0 : Math.min(from + items.length - 1, total);
    const canSelectAnyPage = Boolean(onPageSelect || (onPageChange && getPageUrl));
    const resolvedPaginationMode =
        paginationMode === 'numbers' && !canSelectAnyPage ? 'simple' : paginationMode;

    const changePage = (nextPage: number): void => {
        const resolvedPage = Math.min(
            Math.max(1, nextPage),
            resolvedTotalPages,
        );

        if (onPageSelect) {
            onPageSelect(resolvedPage);
            return;
        }

        if (!onPageChange) {
            return;
        }

        if (resolvedPage === page - 1) {
            onPageChange(prevPageUrl ?? null);
            return;
        }

        if (resolvedPage === page + 1) {
            onPageChange(nextPageUrl ?? null);
            return;
        }

        onPageChange(getPageUrl?.(resolvedPage) ?? null);
    };

    return (
        <div className={cn('w-full text-foreground', className)}>
            <TableShell headers={headers} caption={caption} classNames={classNames}>
                {isLoading || items.length === 0 ? (
                    <TableStateRow
                        columnCount={headers.length}
                        isLoading={isLoading}
                        loadingText={loadingText}
                        emptyContent={emptyText}
                    />
                ) : (
                    items.map((item, index) => {
                        const absoluteIndex = (page - 1) * safePageSize + index;

                        return (
                            <React.Fragment
                                key={getRowKey?.(item, absoluteIndex) ?? absoluteIndex}
                            >
                                {renderRow(item, absoluteIndex)}
                            </React.Fragment>
                        );
                    })
                )}
            </TableShell>

            {showPagination && total > 0 ? (
                <TablePagination
                    page={page}
                    totalPages={resolvedTotalPages}
                    from={from}
                    to={to}
                    total={total}
                    onPageChange={changePage}
                    mode={resolvedPaginationMode}
                    isLoading={isLoading}
                    pageSize={showPageSizeSelector ? safePageSize : undefined}
                    pageSizeOptions={pageSizeOptions}
                    onPageSizeChange={
                        showPageSizeSelector ? onPageSizeChange : undefined
                    }
                    className={classNames?.pagination}
                    maxPageButtons={maxPageButtons}
                />
            ) : null}
        </div>
    );
}

function ServerTable<T = unknown>(props: ServerTableProps<T>): ReactElement {
    return <ServerTableInner {...props} />;
}

const ServerTableMemo = memo(ServerTable) as <T = unknown>(
    props: ServerTableProps<T>,
) => ReactElement;

export default ServerTableMemo;
export type { PaginationMode, TableClassNames, TableHeader as Header };
