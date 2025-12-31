import { goldDDL, generateColumnSQL, transformSQLContent, silverDDL, goldConfig, silverConfig } from "@/app/helper/generateConfigs";
import { ColumnsClassificationType } from "@/types/ColumnsClassificationType";
import { GenRequest } from "@/types/GenRequest";
import { GenResponse } from "@/types/GenResponse";
import { ConfigParams, DDLParams } from "@/types/Params";
import { SQLQuery } from "@/types/PrimitiveTypes";
import { TableTypes } from "@/types/TableConfig";
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const Data : GenRequest = await request.json();

        const tableType : TableTypes = Data.tableType;
        console.log("Table type: ", tableType == "dim");

        const columnClass : ColumnsClassificationType = generateColumnSQL(Data.columns);

        const ddlParams: DDLParams = {
            tableName: Data.tableName.toLowerCase(),
            tableType: tableType,
            allColumnsDefinitions: columnClass.allColumnsDefinitions,
            dimensionColumnTransform : columnClass.dimensionColumnTransform,
            goldColumnTransform : columnClass.goldColumnTransform,
        }

        const silverDdlQuery: SQLQuery = silverDDL(ddlParams);
        const goldDdlQuery: SQLQuery = goldDDL(ddlParams);

        const configParams : Omit<ConfigParams, "ddl"> = {
            createdBy: Data.author,
            pkColumns: columnClass.dimensionColumnTransform,
            tableNameLower: Data.tableName.toLowerCase(),
            tableNameUpper: Data.tableName.toUpperCase(),
            tableType: tableType
        }
        
        const goldConfigQuery : SQLQuery = goldConfig({
            ...configParams,
            ddl: goldDdlQuery,
            transformSQL: transformSQLContent({
                goldColumnTransform: columnClass.goldColumnTransform,
                dimensionColumnTransform : columnClass.dimensionColumnTransform,
                tableNameLower: Data.tableName.toLowerCase(),
                tableType: tableType
            }),
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