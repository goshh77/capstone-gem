import { getDb } from './db';

(async () => {
  try {
    const db = await getDb();
    const result = await db.request().query('SELECT 1 as test');
    console.log(result.recordset);
  } catch (err) {
    console.error('DB ERROR:', err);
  }
})();
