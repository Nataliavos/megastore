import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

config({path: resolve(__dirname, '../../.env')}); // carga variables desde .env

// Variables obligatorias
const required = ["MONGO_URI", "POSTGRES_URI"];

for (const key of required) {
    if (!process.env[key]) {
        console.log(`Error: Missing required environment variable ${key}`);
        throw new Error("");
           
    }
    
}

export const env = {
    port: process.env.PORT ?? 3000,
    mongoUri: process.env.MONGO_URI,
    postgresUri: process.env.POSTGRES_URI,
    fileDataCsv: process.env.FILE_DATA_CSV ?? "./data/AM-prueba-desempeno-data_m4.csv"    
}