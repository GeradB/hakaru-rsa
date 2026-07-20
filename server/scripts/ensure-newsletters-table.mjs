import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from 'mssql';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  server: process.env.SQL_SERVER_HOST,
  database: process.env.SQL_SERVER_DATABASE,
  user: process.env.SQL_SERVER_USER,
  password: process.env.SQL_SERVER_PASSWORD,
  options: {
    encrypt: process.env.SQL_SERVER_ENCRYPT !== 'false',
    trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT === 'true',
  },
};

if (!config.server) {
  console.log('NO_SQL_CONFIG');
  process.exit(1);
}

const pool = await sql.connect(config);
const check = await pool.request().query(
  "SELECT OBJECT_ID(N'dbo.newsletters', N'U') AS oid",
);
console.log('newsletters_exists=', !!check.recordset[0].oid);

if (!check.recordset[0].oid) {
  const sqlText = fs.readFileSync(
    path.join(__dirname, 'migrations', '005_newsletters.sql'),
    'utf8',
  );
  // mssql driver doesn't run GO batches; strip GO lines
  const batches = sqlText
    .split(/^\s*GO\s*$/gim)
    .map((b) => b.trim())
    .filter(Boolean);
  for (const batch of batches) {
    await pool.request().query(batch);
  }
  console.log('migration_applied=true');
} else {
  console.log('migration_applied=false');
}

await pool.close();
