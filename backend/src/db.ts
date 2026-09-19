import pg from "pg";
import { config } from "./config";

export const pool = new pg.Pool({
  connectionString: config.databaseUrl || undefined
});

export async function saveLocation(userId: string, lat: number, lon: number) {
  await pool.query(`
    INSERT INTO driver_locations(user_id, position)
    VALUES ($1, ST_SetSRID(ST_MakePoint($2,$3),4326)::geography)
  `, [userId, lon, lat]);
}
