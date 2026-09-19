import pg from "pg";
import fs from "node:fs/promises";
import path from "node:path";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_REQUIRED");

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query(`
    create table if not exists schema_migrations (
      version text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const dir = path.resolve(process.cwd(), "sql");
  const names = (await fs.readdir(dir))
    .filter(x => /^\d+_.+\.sql$/.test(x))
    .sort();

  for (const name of names) {
    const version = name.split("_", 1)[0];
    const exists = await client.query(
      "select 1 from schema_migrations where version=$1", [version]
    );
    if (exists.rowCount) continue;

    const sql = await fs.readFile(path.join(dir, name), "utf8");
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query(
        "insert into schema_migrations(version) values($1)", [version]
      );
      await client.query("commit");
      console.log(`migration applied: ${name}`);
    } catch (e) {
      await client.query("rollback");
      throw e;
    }
  }
} finally {
  await client.end();
}
