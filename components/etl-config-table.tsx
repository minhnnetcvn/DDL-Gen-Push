import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export interface ETLConfig {
  id: number
  layer: string
  source_table_name: string
  target_table_name: string
  source_table_full_name: string
  target_table_full_name: string
  enabled: boolean
  processing_mode: string
  last_run_status: string
  updated_at: string
}

interface ETLConfigTableProps {
  data: ETLConfig[]
}

export function ETLConfigTable({ data }: ETLConfigTableProps) {
  return (
    <div className="rounded-md border">
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Layer</TableHead>
              <TableHead>Source Table</TableHead>
              <TableHead>Target Table</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
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
                <TableRow key={row.id}>
                  <TableCell className="font-medium">#{row.id}</TableCell>
                  <TableCell>
                    <Badge variant={row.layer.toLowerCase() === "gold" ? "default" : "secondary"}>{row.layer}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.source_table_full_name}>
                    {row.source_table_name}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.target_table_full_name}>
                    {row.target_table_name}
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
                      {row.last_run_status || "PENDING"}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{row.processing_mode}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {new Date(row.updated_at).toLocaleString()}
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
