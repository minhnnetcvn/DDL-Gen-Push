"use client"
import { DatabaseConfig } from "@/types/DatabaseConfig";
import React, {createContext, useState, useEffect, SetStateAction, Dispatch, useContext} from "react";

interface DatabaseConfigHookType{
    databaseConfig: DatabaseConfig;
    setDatabaseConfig: Dispatch<SetStateAction<DatabaseConfig>>;
};

const PostgresContext = createContext<DatabaseConfigHookType| null>(null);


export function PostgresContextProvider({children}: {children: React.ReactNode}) {
    const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig>({
        databaseName: "postgres",
        host: "10.8.75.82",
        password: "postgres",
        port: "5432",
        user: "postgres",
        tableName: "etl_table_config",
    });

    useEffect(() => {
        console.log(databaseConfig);
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
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context!;
}