
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import type { ETLConfig } from "@/types/ETLConfig";

interface ETLConfigTableProps {
  data: ETLConfig[]
  onIdClick?: (id: number) => void
  onRowClick?: (id: number) => void
}

export function ETLConfigTable({ data, onIdClick: onIdClick, onRowClick: onRowClick }: ETLConfigTableProps) {
  return (
    <div className="rounded-md border">
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {/* ===== REQUIRED ===== */}
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Layer</TableHead>
              <TableHead>Source Table</TableHead>
              <TableHead>Target Table</TableHead>
              <TableHead>Source Table Full Name</TableHead>
              <TableHead>Target Table Full Name</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead>Target DDL</TableHead>

              {/* ===== OPTIONAL – TABLE CONFIG ===== */}
              <TableHead>Partition Spec</TableHead>
              <TableHead>Primary Keys</TableHead>
              <TableHead>Order By Column</TableHead>
              <TableHead>Order Direction</TableHead>

              {/* ===== OPTIONAL – TRANSFORMATION ===== */}
              <TableHead>Transform SQL</TableHead>
              <TableHead>Transform Class</TableHead>

              {/* ===== OPTIONAL – PROCESSING ===== */}
              <TableHead>Batch Size</TableHead>
              <TableHead>Interval (min)</TableHead>
              <TableHead>Processing Mode</TableHead>

              {/* ===== OPTIONAL – CHECKPOINTS ===== */}
              <TableHead>Last Snapshot ID</TableHead>
              <TableHead>Last Timestamp</TableHead>
              <TableHead>Last Watermark</TableHead>

              {/* ===== OPTIONAL – LAST RUN ===== */}
              <TableHead>Last Run At</TableHead>
              <TableHead>Last Run Status</TableHead>
              <TableHead>Last Run Error</TableHead>
              <TableHead>Records Processed</TableHead>

              {/* ===== OPTIONAL – DEPENDENCIES & META ===== */}
              <TableHead>Depends On</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Tags</TableHead>

              {/* ===== OPTIONAL – AUDIT ===== */}
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Updated By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow className="cursor-pointer" key={row.id} onClick={() => onRowClick?.(row.id)}>
                  <TableCell className="font-medium cursor-pointer hover:line-through" onClick={() => onIdClick?.(row.id)}>#{row.id}</TableCell>
                  <TableCell>
                    <Badge variant={row.layer.toLowerCase() === "gold" ? "default" : "secondary"}>{row.layer}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {row.source_table_name}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {row.target_table_name}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.source_table_full_name}>
                    {row.source_table_name}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.target_table_full_name}>
                    {row.target_table_name}
                  </TableCell>
                  <TableCell>{row.enabled ? "Yes" : "No"}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.target_table_ddl || ""}>
                    {row.target_table_ddl}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={row.target_partition_spec || ""}>
                    {row.target_partition_spec || "-"}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={row.primary_key_columns || ""}>
                    {row.primary_key_columns || "-"}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={row.order_by_column || ""}>
                    {row.order_by_column || "-"}
                  </TableCell>
                  <TableCell className="" title={row.order_by_direction || ""}>
                    {row.order_by_direction || "-"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.transform_sql || ""}>
                    {row.transform_sql || "-"}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={row.transform_class || ""}>
                    {row.transform_class || "-"}
                  </TableCell>
                  <TableCell>{row.batch_size !== null ? row.batch_size : "-"}</TableCell>
                  <TableCell>{row.processing_interval_minutes !== null ? row.processing_interval_minutes : "-"}</TableCell>
                  <TableCell>{row.processing_mode !== null ? row.processing_mode : "-"}</TableCell>
                  <TableCell>{row.last_processed_snapshot_id !== null ? row.last_processed_snapshot_id : "-"}</TableCell>
                  <TableCell className="max-w-[150px] truncate" title={row.last_processed_timestamp || ""}>
                    {row.last_processed_timestamp || "-"}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={row.last_processed_watermark || ""}>
                    {row.last_processed_watermark || "-"}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={row.last_run_at || ""}>
                    {row.last_run_at ? new Date(row.last_run_at).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.last_run_status === "SUCCESS"
                          ? "success"
                          : row.last_run_status === "FAILED"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {row.last_run_status || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.last_run_error ? row.last_run_error : "-"}
                  </TableCell>
                  <TableCell>{row.last_run_records_processed !== null ? row.last_run_records_processed : "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.depends_on_tables || ""}>
                    {row.depends_on_tables || "-"}
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate" title={row.description || ""}>
                    {row.description || "-"}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={row.tags || ""}>
                    {row.tags || "-"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {row.created_at ? new Date(row.created_at).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {row.updated_at ? new Date(row.updated_at).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={row.created_by || ""}>
                    {row.created_by || "-"}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={row.updated_by || ""}>
                    {row.updated_by || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
export { ETLConfig };

