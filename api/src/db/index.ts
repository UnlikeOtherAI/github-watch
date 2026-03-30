import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const socketPath = process.env.CLOUD_SQL_SOCKET;

const client = socketPath
  ? postgres(connectionString, { host: socketPath })
  : postgres(connectionString);

export const db = drizzle(client, { schema });
