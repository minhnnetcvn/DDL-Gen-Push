import { goldDDL, generateColumnSQL, transformSQLContent, silverDDL, goldConfig, silverConfig } from "@/app/helper/generateConfigs";
import { ColumnsClassificationType } from "@/types/ColumnsClassificationType";
import { GenRequest } from "@/types/GenRequest";
import { GenResponse } from "@/types/GenResponse";
import { ConfigParams, DDLParams } from "@/types/Params";
import { SQLQuery } from "@/types/PrimitiveTypes";
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const Data : GenRequest = await request.json();

        const columnClass : ColumnsClassificationType = generateColumnSQL(Data.columns);

        const ddlParams: DDLParams = {
            tableName: Data.tableName.toLowerCase(),
            allColumnsDefinitions: columnClass.dimensionDefinitions + ",\n          	" + columnClass.aggregatesDefinitions,
            aggregateDefinitions : columnClass.aggregatesDefinitions,
            dimensionDefinitions : columnClass.dimensionDefinitions,
        }

        const silverDdlQuery: SQLQuery = silverDDL(ddlParams);
        const goldDdlQuery: SQLQuery = goldDDL(ddlParams);

        const configParams : Omit<ConfigParams, "ddl"> = {
            createdBy: Data.author,
            pkColumns: columnClass.dimensionColumns,
            tableNameLower: Data.tableName.toLowerCase(),
            tableNameUpper: Data.tableName.toUpperCase(),
        }
        
        const goldConfigQuery : SQLQuery = goldConfig({
            ...configParams,
            ddl: goldDdlQuery,
            transformSQL: transformSQLContent({aggregateColumns: columnClass.aggregateColumns, dimensionColumns: columnClass.dimensionColumns})

        })
        
        const silverConfigQuery : SQLQuery = silverConfig({
            ...configParams,
            ddl: silverDdlQuery,
        })

        const response : GenResponse = {
            status: true,
            silverConfigQuery: silverConfigQuery,
            goldConfigQuery: goldConfigQuery,
        }

        return NextResponse.json(response, { status: 200})
        
    } catch (error: any) {
        console.log(error);
        console.error(error.message? error.message : error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}