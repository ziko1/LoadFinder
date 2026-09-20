import pg from "pg";
import { config } from "./config";

export const pool = new pg.Pool({
  connectionString: config.databaseUrl || undefined
});

export async function ensureDriver(subject:string){
  if(!config.databaseUrl) throw Object.assign(new Error('database_required'),{statusCode:503});
  const r=await pool.query('insert into drivers(id,external_subject) values(gen_random_uuid(),$1) on conflict(external_subject) do update set external_subject=excluded.external_subject returning id',[subject]);
  return r.rows[0].id as string;
}

export async function saveLocation(userId: string, lat: number, lon: number) {
  await pool.query(`
    INSERT INTO driver_locations(user_id, position)
    VALUES ($1, ST_SetSRID(ST_MakePoint($2,$3),4326)::geography)
  `, [userId, lon, lat]);
}
