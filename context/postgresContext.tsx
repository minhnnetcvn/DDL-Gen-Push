"use client"
import { DatabaseConfig } from "@/types/DatabaseConfig";
import React, {createContext, useState, useEffect, SetStateAction, Dispatch, useContext} from "react";

interface DatabaseConfigHookType{
    databaseConfig: DatabaseConfig;
    setDatabaseConfig: Dispatch<SetStateAction<DatabaseConfig>>;
};

const PostgresContext = createContext<DatabaseConfigHookType| null>(null);


export function PostgresContextProvider({children, defaultConnectionString}: {children: React.ReactNode, defaultConnectionString: DatabaseConfig}) {
    const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig>(() => ({
        databaseName: "postgres",
        host: defaultConnectionString.host || "localhost",
        password: defaultConnectionString.password || "postgres",
        port: defaultConnectionString.port || "5432",
        user: defaultConnectionString.user || "postgres",
        tableName: defaultConnectionString.tableName || "etl_table_config",
    }));

    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            console.log("[PostgresContext]", databaseConfig);
        }
    }, [databaseConfig])
    
    return (
        <PostgresContext.Provider value={{databaseConfig, setDatabaseConfig}}>
            {children}
        </PostgresContext.Provider>
    )
}

export function usePostgresConfig(): NonNullable<DatabaseConfigHookType> {
    const context = useContext(PostgresContext);

    if (!context) {
        throw new Error("usePostgresConfig must be used within a PostgresContextProvider");
    }

    return context!;
}