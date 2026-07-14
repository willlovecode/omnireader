import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

import * as schema from './schema';

const sqlite = SQLite.openDatabaseSync('omnireader.db');

export const db = drizzle(sqlite, { schema });
