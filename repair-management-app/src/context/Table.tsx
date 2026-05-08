import {
  createContext,
  useContext,
  type ReactElement,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TableContextValue = {
  columns: string;
};

type TableProps = {
  // columns is a CSS grid-template-columns value e.g. "1fr 1.5fr 1fr auto"
  // It must be a runtime string so it cannot be a Tailwind class.
  columns: string;
  children: ReactNode;
};

type HeaderProps = { children: ReactNode };
type RowProps = { children: ReactNode };
type FooterProps = { children: ReactNode };

type BodyProps<T> = {
  data: T[];
  render: (item: T, index: number) => ReactElement;
  resourceName?: string;
};

type TableComponent = ((props: TableProps) => ReactElement) & {
  Header: (props: HeaderProps) => ReactElement;
  Row: (props: RowProps) => ReactElement;
  Body: <T>(props: BodyProps<T>) => ReactElement;
  Footer: (props: FooterProps) => ReactElement;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const TableContext = createContext<TableContextValue | null>(null);

function useTableContext() {
  const context = useContext(TableContext);

  if (!context) {
    throw new Error("Table subcomponents must be used inside <Table>.");
  }

  return context;
}

// ─── Shared row style ─────────────────────────────────────────────────────────
//
// grid-template-columns comes from the Table prop and is applied as an
// inline style because Tailwind cannot generate classes from runtime values.

function rowStyle(columns: string): React.CSSProperties {
  return { gridTemplateColumns: columns };
}

// ─── Compound components ──────────────────────────────────────────────────────

function Table({ columns, children }: TableProps) {
  return (
    <TableContext.Provider value={{ columns }}>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
        {children}
      </div>
    </TableContext.Provider>
  );
}

// Header row — uppercase labels, subtle background, bottom border.
function Header({ children }: HeaderProps) {
  const { columns } = useTableContext();

  return (
    <div
      role="row"
      style={rowStyle(columns)}
      className="grid items-center gap-6 border-b border-gray-100 bg-gray-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500"
    >
      {children}
    </div>
  );
}

// Data row — same grid, divider between rows.
function Row({ children }: RowProps) {
  const { columns } = useTableContext();

  return (
    <div
      role="row"
      style={rowStyle(columns)}
      className="grid items-center gap-6 border-b border-gray-100 px-6 py-3 last:border-b-0"
    >
      {children}
    </div>
  );
}

// Body — maps data to rows via the render prop.
// Shows a plain empty state when there is no data.
function Body<T>({ data, render, resourceName }: BodyProps<T>) {
  if (!data.length) {
    return (
      <section className="py-6 text-center text-sm text-gray-400">
        No {resourceName ?? "data"} to show.
      </section>
    );
  }

  return <section className="my-1">{data.map(render)}</section>;
}

// Footer — hidden via :has() CSS when it has no children.
// Useful for pagination or summary content.
function Footer({ children }: FooterProps) {
  return (
    <footer className="flex justify-center bg-gray-50 p-3 [&:not(:has(*))]:hidden">
      {children}
    </footer>
  );
}

// ─── Assemble compound component ──────────────────────────────────────────────

const TypedTable = Table as TableComponent;
TypedTable.Header = Header;
TypedTable.Row = Row;
TypedTable.Body = Body;
TypedTable.Footer = Footer;

export default TypedTable;
