import { Pool } from 'pg'

export const pool = ((host?: string, port?: number|string, user?: string, password?: string, db?: string) => {
        return new Pool({
    host: host ? host : 'localhost',
    port: port ? parseInt(port.toString()) : 5432,
    user: user ? user : 'postgres',
    password: password ? password : 'postgres',
    database: db ? db : 'postgres',
    ssl: false
    })
})