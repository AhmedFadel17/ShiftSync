import { RowData, ColumnDef } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    enableEditing?: boolean;
  }
}

export type EditableColumnDef<T> = ColumnDef<T> & {
  enableEditing?: boolean;
};
