import fs from "fs";
import pool from "./server/db.js";

console.log("Starting organization DB setup...");

const sql = fs.readFileSync("./server/sql/008_organization.sql", "utf8");

try {
  console.log("Connecting to database...");

  const result = await pool.query(sql);

  console.log("Organization tables created successfully.");
  console.log(result);
} catch (error) {
  console.error("DB ERROR FULL:");
  console.error(error);
} finally {
  await pool.end();
}