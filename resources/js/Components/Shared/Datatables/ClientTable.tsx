import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type Key,
    type ReactElement,
    type ReactNode,
} from 'react';
import { RefreshCcw, Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Spinner } from '../ui/Spinner';
import {
    TablePagination,
    TableShell,
    TableStateRow,
    type PaginationMode,
    type TableClassNames,
    type TableHeader,
} from './TablePrimitives';

export type ClientTableProps<T = unknown> = {
    items: T[];
    headers: TableHeader[];
    renderRow: (item: T, index: number) => ReactNode;
    searchPlaceholder?: string;
    itemsPerPage?: number;
    pageSizeOptions?: number[];
    searchBy?: (item: T) => string;
    onRefresh?: () => void;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    isLoading?: boolean;
    emptyText?: ReactNode;
    loadingText?: string;
    hasSearch?: boolean;
    showPagination?: boolean;
    showPageSizeSelector?: boolean;
    paginationMode?: PaginationMode;
    maxPageButtons?: number;
    caption?: string;
    className?: string;
    classNames?: TableClassNames;
    getRowKey?: (item: T, index: number) => Key;
};

/** @deprecated Use ClientTableProps instead. */
export type PaginatedSearchTableProps<T = unknown> = ClientTableProps<T>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const hasStringTitle = (value: unknown): value is { title: string } =>
    isRecord(value) && typeof value.title === 'string';

function ClientTableInner<T = unknown>({
    items,
    headers,
    renderRow,
    searchPlaceholder = 'Search...',
    itemsPerPage = 10,
    pageSizeOptions = [10, 25, 50, 100],
    searchBy,
    onRefresh,
    onPageChange,
    onPageSizeChange,
    isLoading = false,
    hasSearch = true,
    emptyText = 'No available data',
    loadingText = 'Loading...',
    showPagination = true,
    showPageSizeSelector = true,
    paginationMode = 'numbers',
    maxPageButtons = 5,
    caption,
    className,
    classNames,
    getRowKey,
}: ClientTableProps<T>): ReactElement {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(Math.max(1, itemsPerPage));

    useEffect(() => {
        setPageSize(Math.max(1, itemsPerPage));
        setCurrentPage(1);
    }, [itemsPerPage]);

    const getSearchText = useCallback(
        (item: T): string => {
            if (searchBy) {
                return searchBy(item);
            }

            if (typeof item === 'string') {
                return item;
            }

            if (hasStringTitle(item)) {
                return item.title;
            }

            try {
                return isRecord(item) ? JSON.stringify(item) : String(item);
            } catch {
                return String(item);
            }
        },
        [searchBy],
    );

    const filteredItems = useMemo(() => {
        const query = searchTerm.trim().toLocaleLowerCase();

        if (!query) {
            return items;
        }

        return items.filter((item) =>
            getSearchText(item).toLocaleLowerCase().includes(query),
        );
    }, [getSearchText, items, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    const page = Math.min(currentPage, totalPages);
    const firstIndex = (page - 1) * pageSize;
    const lastIndex = firstIndex + pageSize;
    const displayedItems = showPagination
        ? filteredItems.slice(firstIndex, lastIndex)
        : filteredItems;
    const rowOffset = showPagination ? firstIndex : 0;
    const count = {
        from: filteredItems.length === 0 ? 0 : showPagination ? firstIndex + 1 : 1,
        to: showPagination
            ? Math.min(lastIndex, filteredItems.length)
            : filteredItems.length,
        total: filteredItems.length,
    };

    const changePage = (nextPage: number): void => {
        const resolvedPage = Math.min(Math.max(1, nextPage), totalPages);
        setCurrentPage(resolvedPage);
        onPageChange?.(resolvedPage);
    };

    const changePageSize = (nextPageSize: number): void => {
        setPageSize(nextPageSize);
        setCurrentPage(1);
        onPageSizeChange?.(nextPageSize);
        onPageChange?.(1);
    };

    const changeSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
        onPageChange?.(1);
    };

    return (
        <div className={cn('w-full text-foreground', className)}>
            {hasSearch || onRefresh ? (
                <div
                    className={cn(
                        'flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between',
                        classNames?.toolbar,
                    )}
                >
                    {hasSearch ? (
                        <div className="relative w-full sm:max-w-sm">
                            <Search
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <Input
                                type="search"
                                aria-label="Search table"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={changeSearch}
                                className="h-10 pl-9 pr-9"
                            />
                            {searchTerm ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Clear search"
                                    onClick={() => {
                                        setSearchTerm('');
                                        changePage(1);
                                    }}
                                    className="absolute right-0 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            ) : null}
                        </div>
                    ) : (
                        <span />
                    )}

                    {onRefresh ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onRefresh}
                            disabled={isLoading}
                            className="shrink-0"
                        >
                            {isLoading ? (
                                <Spinner />
                            ) : (
                                <RefreshCcw className="h-4 w-4" />
                            )}
                            Refresh
                        </Button>
                    ) : null}
                </div>
            ) : null}

            <TableShell headers={headers} caption={caption} classNames={classNames}>
                {isLoading || displayedItems.length === 0 ? (
                    <TableStateRow
                        columnCount={headers.length}
                        isLoading={isLoading}
                        loadingText={loadingText}
                        emptyContent={emptyText}
                    />
                ) : (
                    displayedItems.map((item, index) => (
                        <React.Fragment
                            key={getRowKey?.(item, rowOffset + index) ?? rowOffset + index}
                        >
                            {renderRow(item, rowOffset + index)}
                        </React.Fragment>
                    ))
                )}
            </TableShell>

            {showPagination && filteredItems.length > 0 ? (
                <TablePagination
                    page={page}
                    totalPages={totalPages}
                    from={count.from}
                    to={count.to}
                    total={count.total}
                    onPageChange={changePage}
                    mode={paginationMode}
                    isLoading={isLoading}
                    pageSize={showPageSizeSelector ? pageSize : undefined}
                    pageSizeOptions={pageSizeOptions}
                    onPageSizeChange={
                        showPageSizeSelector ? changePageSize : undefined
                    }
                    className={classNames?.pagination}
                    maxPageButtons={maxPageButtons}
                />
            ) : null}
        </div>
    );
}

function ClientTable<T = unknown>(props: ClientTableProps<T>): ReactElement {
    return <ClientTableInner {...props} />;
}

const ClientTableMemo = memo(ClientTable) as <T = unknown>(
    props: ClientTableProps<T>,
) => ReactElement;

export default ClientTableMemo;
export type { PaginationMode, TableClassNames, TableHeader as Header };
