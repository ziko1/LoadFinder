import pg from "pg";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";

if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL_REQUIRED");
const client=new pg.Client({connectionString:process.env.DATABASE_URL});
await client.connect();
try {
  await client.query("select pg_advisory_lock(468013)");
  await client.query("create table if not exists loadfinder_migrations (name text primary key, checksum text not null, applied_at timestamptz not null default now())");
  const dir=fileURLToPath(new URL("../../migrations/",import.meta.url));
  const names=(await fs.readdir(dir)).filter(x=>/^\d+_.+\.sql$/.test(x)).sort();
  const versions=names.map(x=>x.split("_")[0]);
  if(new Set(versions).size!==versions.length) throw new Error("DUPLICATE_MIGRATION_VERSION");
  for(const name of names){
    const sql=await fs.readFile(path.join(dir,name),"utf8");
    const checksum=crypto.createHash("sha256").update(sql).digest("hex");
    const applied=await client.query("select checksum from loadfinder_migrations where name=$1",[name]);
    if(applied.rowCount){
      if(applied.rows[0].checksum!==checksum) throw new Error("MIGRATION_CHANGED:"+name);
      continue;
    }
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into loadfinder_migrations(name,checksum) values($1,$2)",[name,checksum]);
      await client.query("commit");
      console.log("migration applied: "+name);
    }catch(e){await client.query("rollback");throw e;}
  }
}finally{
  await client.query("select pg_advisory_unlock(468013)").catch(()=>{});
  await client.end();
}
