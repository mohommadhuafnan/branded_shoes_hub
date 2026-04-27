import { AuroraDSQLPool } from '@aws/aurora-dsql-node-postgres-connector';
import { awsCredentialsProvider } from '@vercel/oidc-aws-credentials-provider';
import { attachDatabasePool } from '@vercel/functions';

let pool;

export function getPool() {
  if (!pool) {
    const host = process.env.PGHOST;
    const region = process.env.AWS_REGION;
    const roleArn = process.env.AWS_ROLE_ARN;
    if (!host || !region || !roleArn) {
      throw new Error('Missing PGHOST, AWS_REGION, or AWS_ROLE_ARN for DSQL');
    }
    pool = new AuroraDSQLPool({
      host,
      region,
      user: process.env.PGUSER || 'admin',
      database: process.env.PGDATABASE || 'postgres',
      port: Number(process.env.PGPORT || 5432),
      customCredentialsProvider: awsCredentialsProvider({
        roleArn,
        clientConfig: { region },
      }),
    });
    attachDatabasePool(pool);
  }
  return pool;
}

export async function query(sql, args = []) {
  return getPool().query(sql, args);
}

export async function withConnection(fn) {
  const p = getPool();
  const client = await p.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
