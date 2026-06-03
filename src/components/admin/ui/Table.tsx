/**
 * Sherry Studio — Tabla genérica.
 *
 * `<Table columns rows>` tipado por fila. Estados de carga y vacío
 * integrados. Scroll horizontal en pantallas pequeñas. Las columnas definen
 * cómo renderizar cada celda a partir de la fila.
 */
import type { ReactNode } from 'react';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

export interface Column<Row> {
  /** Clave estable de la columna (no tiene por qué ser una key de Row). */
  key: string;
  /** Encabezado mostrado. */
  header: ReactNode;
  /** Render de la celda para una fila dada. */
  cell: (row: Row) => ReactNode;
  /** Alineación del contenido. */
  align?: 'left' | 'center' | 'right';
  /** Oculta la columna en móvil (scroll reducido). */
  hideOnMobile?: boolean;
  /** Ancho fijo opcional (clase Tailwind, p.ej. 'w-32'). */
  width?: string;
}

interface TableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  /** Clave única por fila para React. */
  rowKey: (row: Row) => string;
  loading?: boolean;
  /** Título mostrado cuando no hay filas. */
  emptyTitle?: string;
  emptyDescription?: string;
  /** Acción opcional para el estado vacío. */
  emptyAction?: ReactNode;
  /** Callback de clic en fila (la hace interactiva). */
  onRowClick?: (row: Row) => void;
  className?: string;
}

const ALIGN: Record<NonNullable<Column<unknown>['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export default function Table<Row>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyTitle = 'Sin resultados',
  emptyDescription,
  emptyAction,
  onRowClick,
  className = '',
}: TableProps<Row>) {
  if (loading) {
    return <LoadingState />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-xl border border-bone-dark bg-bone-light ${className}`}
    >
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-bone-dark">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 font-sans text-xs font-semibold tracking-wide uppercase text-gris ${
                  ALIGN[col.align ?? 'left']
                } ${col.width ?? ''} ${
                  col.hideOnMobile ? 'hidden sm:table-cell' : ''
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const interactive = Boolean(onRowClick);
            return (
              <tr
                key={rowKey(row)}
                onClick={interactive ? () => onRowClick?.(row) : undefined}
                className={`border-b border-bone-dark/60 last:border-0 ${
                  interactive
                    ? 'cursor-pointer transition-colors hover:bg-burgundy/5'
                    : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 align-middle font-sans text-sm text-burgundy-dark ${
                      ALIGN[col.align ?? 'left']
                    } ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
