import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Loader2 } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { usePostgresConfig } from "@/context/postgresContext"
import { DatabaseConfig } from "@/types/DatabaseConfig"

export interface QueryData {
  layer: string;
  tableName: string;
}

interface QueryBuilderProps {
    submitQuery: (databaseConfig: DatabaseConfig, queryData: QueryData) => void;
    isDbConfigured: boolean;
    isQuerying: boolean;
}

export default function QueryBuilder(props : QueryBuilderProps) {
    const [queryData, setQueryData] = useState<QueryData>({
        layer: "all",
        tableName: "",
    });

    const {databaseConfig} = usePostgresConfig();
    
    const handleQuerySubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
        props.submitQuery(databaseConfig, queryData);
    };

    return (
        <div className="lg:col-span-2 space-y-8">
              <Card className={!props.isDbConfigured ? "opacity-50 pointer-events-none" : ""}>
                <CardHeader>
                  <CardTitle>Query Filters</CardTitle>
                  <CardDescription>Search for specific ETL configurations</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleQuerySubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="layer">Layer</Label>
                        <Select value={queryData.layer} onValueChange={(v) => setQueryData({ ...queryData, layer: v })}>
                          <SelectTrigger id="layer">
                            <SelectValue placeholder="Select layer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Layers</SelectItem>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="silver">Silver</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="queryTable">Table Name</Label>
                        <Input
                          id="queryTable"
                          placeholder="Filter by name..."
                          value={queryData.tableName}
                          onChange={(e) => setQueryData({ ...queryData, tableName: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={props.isQuerying}>
                      {props.isQuerying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running Query...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Run Query
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
    )
}