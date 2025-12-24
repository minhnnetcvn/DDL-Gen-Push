import { SQLQuery } from "./PrimitiveTypes";

export interface GenResponse {
    status: boolean;
    silverDdl?: SQLQuery;
    goldDdl?: SQLQuery;
    silverConfigQuery?: SQLQuery;
    goldConfigQuery?: SQLQuery;
    silverTransform?: SQLQuery;
    goldTransform?: SQLQuery;
}