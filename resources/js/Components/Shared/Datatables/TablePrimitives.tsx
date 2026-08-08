import React, { memo, type Key, type ReactNode } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Spinner } from '../ui/Spinner';

export type TableHeader = {
    key?: Key;
    name: ReactNode;
    position?: 'left' | 'center' | 'right';
    className?: string;
};

export type TableClassNames = {
    root?: string;
    toolbar?: string;
    tableContainer?: string;
    table?: string;
    header?: string;
    headerRow?: string;
    headerCell?: string;
    body?: string;
    pagination?: string;
};

export type PaginationMode = 'simple' | 'numbers' | 'compact';

type TableShellProps = {
    headers: TableHeader[];
    children: ReactNode;
    caption?: string;
    classNames?: TableClassNames;
};

type TableStateRowProps = {
    columnCount: number;
    isLoading: boolean;
    loadingText: string;
    emptyContent: ReactNode;
};

type TablePaginationProps = {
    page: number;
    totalPages: number;
    from: number;
    to: number;
    total: number;
    onPageChange: (page: number) => void;
    mode?: PaginationMode;
    isLoading?: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
    onPageSizeChange?: (pageSize: number) => void;
    className?: string;
    maxPageButtons?: number;
};

function alignmentClass(position: TableHeader['position']): string {
    if (position === 'center') {
        return 'justify-center text-center';
    }

    if (position === 'right') {
        return 'justify-end text-right';
    }

    return 'justify-start text-left';
}

function getVisiblePages(
    currentPage: number,
    totalPages: number,
    maxPageButtons: number,
): number[] {
    const visibleCount = Math.max(1, Math.min(maxPageButtons, totalPages));
    const half = Math.floor(visibleCount / 2);
    const start = Math.min(
        Math.max(1, currentPage - half),
        Math.max(1, totalPages - visibleCount + 1),
    );

    return Array.from({ length: visibleCount }, (_, index) => start + index);
}

const TableShell = memo(function TableShell({
    headers,
    children,
    caption,
    classNames,
}: TableShellProps) {
    return (
        <div
            className={cn(
                'overflow-hidden rounded-xl border border-border bg-card',
                classNames?.root,
            )}
        >
            <div
                className={cn(
                    'w-full overflow-x-auto',
                    classNames?.tableContainer,
                )}
            >
                <table
                    className={cn(
                        'w-full min-w-max text-left text-sm text-foreground',
                        classNames?.table,
                    )}
                >
                    {caption ? <caption className="sr-only">{caption}</caption> : null}
                    <thead
                        className={cn(
                            'border-b bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground',
                            classNames?.header,
                        )}
                    >
                        <tr className={classNames?.headerRow}>
                            {headers.map((header, index) => (
                                <th
                                    key={header.key ?? index}
                                    scope="col"
                                    className={cn(
                                        'whitespace-nowrap px-6 py-3.5 font-semibold',
                                        classNames?.headerCell,
                                        header.className,
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex items-center',
                                            alignmentClass(header.position),
                                        )}
                                    >
                                        {header.name}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody
                        className={cn(
                            'divide-y divide-border [&_td]:px-6 [&_td]:py-4',
                            classNames?.body,
                        )}
                    >
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

function TableStateRow({
    columnCount,
    isLoading,
    loadingText,
    emptyContent,
}: TableStateRowProps): React.ReactElement {
    return (
        <tr>
            <td
                colSpan={Math.max(1, columnCount)}
                className="h-32 text-center text-sm text-muted-foreground"
            >
                {isLoading ? (
                    <span className="inline-flex items-center gap-2" role="status">
                        <Spinner className="h-5 w-5" />
                        {loadingText}
                    </span>
                ) : (
                    emptyContent
                )}
            </td>
        </tr>
    );
}

function PaginationButton({
    label,
    onClick,
    disabled,
    children,
    isActive = false,
}: {
    label: string;
    onClick: () => void;
    disabled: boolean;
    children: ReactNode;
    isActive?: boolean;
}): React.ReactElement {
    return (
        <Button
            type="button"
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            disabled={disabled}
            onClick={onClick}
            className={cn('h-9 min-w-9 px-2', isActive && 'pointer-events-none')}
        >
            {children}
        </Button>
    );
}

function TablePagination({
    page,
    totalPages,
    from,
    to,
    total,
    onPageChange,
    mode = 'numbers',
    isLoading = false,
    pageSize,
    pageSizeOptions = [10, 25, 50, 100],
    onPageSizeChange,
    className,
    maxPageButtons = 5,
}: TablePaginationProps): React.ReactElement {
    const safeTotalPages = Math.max(1, totalPages);
    const safePage = Math.min(Math.max(1, page), safeTotalPages);
    const visiblePages = getVisiblePages(
        safePage,
        safeTotalPages,
        maxPageButtons,
    );
    const isPreviousDisabled = isLoading || safePage <= 1;
    const isNextDisabled = isLoading || safePage >= safeTotalPages;
    const normalizedPageSizes = Array.from(
        new Set(
            [...pageSizeOptions, pageSize]
                .filter((value): value is number => typeof value === 'number' && value > 0)
                .sort((first, second) => first - second),
        ),
    );

    return (
        <div
            className={cn(
                'flex flex-col gap-3 border-t border-border px-1 pt-4 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
        >
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span aria-live="polite">
                    Showing <span className="font-medium text-foreground">{from}</span> to{' '}
                    <span className="font-medium text-foreground">{to}</span> of{' '}
                    <span className="font-medium text-foreground">{total}</span> entries
                </span>

                {pageSize && onPageSizeChange ? (
                    <div className="flex items-center gap-2">
                        <span>Rows per page</span>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(value) => onPageSizeChange(Number(value))}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="h-9 w-20" aria-label="Rows per page">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {normalizedPageSizes.map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ) : null}
            </div>

            <nav className="flex items-center gap-1" aria-label="Table pagination">
                {mode === 'numbers' ? (
                    <PaginationButton
                        label="Go to first page"
                        onClick={() => onPageChange(1)}
                        disabled={isPreviousDisabled}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </PaginationButton>
                ) : null}

                <PaginationButton
                    label="Go to previous page"
                    onClick={() => onPageChange(safePage - 1)}
                    disabled={isPreviousDisabled}
                >
                    <ChevronLeft className="h-4 w-4" />
                    {mode === 'simple' ? <span>Previous</span> : null}
                </PaginationButton>

                {mode === 'numbers' ? (
                    <div className="hidden items-center gap-1 sm:flex">
                        {visiblePages.map((visiblePage) => (
                            <PaginationButton
                                key={visiblePage}
                                label={`Go to page ${visiblePage}`}
                                onClick={() => onPageChange(visiblePage)}
                                disabled={isLoading}
                                isActive={visiblePage === safePage}
                            >
                                {visiblePage}
                            </PaginationButton>
                        ))}
                    </div>
                ) : (
                    <span className="min-w-20 px-2 text-center text-sm text-muted-foreground">
                        Page {safePage} of {safeTotalPages}
                    </span>
                )}

                <PaginationButton
                    label="Go to next page"
                    onClick={() => onPageChange(safePage + 1)}
                    disabled={isNextDisabled}
                >
                    {mode === 'simple' ? <span>Next</span> : null}
                    <ChevronRight className="h-4 w-4" />
                </PaginationButton>

                {mode === 'numbers' ? (
                    <PaginationButton
                        label="Go to last page"
                        onClick={() => onPageChange(safeTotalPages)}
                        disabled={isNextDisabled}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </PaginationButton>
                ) : null}
            </nav>
        </div>
    );
}

export { TablePagination, TableShell, TableStateRow };
