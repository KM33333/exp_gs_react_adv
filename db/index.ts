// db/index.ts 背系図に合わせてデータベースを作ったりする。db/index.ts は、schema.ts が利用できるようにするための出入り口。
// 出入り口なので、入るとそのあとは基本いじらないと
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });