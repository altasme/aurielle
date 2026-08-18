#!/usr/bin/env node
// Prints a SQL statement that creates (or resets the password for) the
// first admin_users row, for manual application via the Supabase SQL
// Editor -- same workflow as every other migration in this project.
// This script never touches the database itself and never writes the
// password to disk; it only hashes it (same scrypt algorithm as
// src/lib/admin/auth.ts) and prints the resulting SQL to stdout.
//
// Usage:
//   ADMIN_USERNAME=admin ADMIN_PASSWORD='a strong password' node scripts/seed-admin-user.mjs

import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  console.error("Usage: ADMIN_USERNAME=... ADMIN_PASSWORD=... node scripts/seed-admin-user.mjs");
  process.exit(1);
}
if (password.length < 12) {
  console.error("ADMIN_PASSWORD should be at least 12 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const derived = await scrypt(password, salt, 64);
const passwordHash = `${salt.toString("hex")}:${derived.toString("hex")}`;

function sqlString(value) {
  return `'${value.replace(/'/g, "''")}'`;
}

console.log(
  [
    "insert into admin_users (username, password_hash)",
    `values (${sqlString(username)}, ${sqlString(passwordHash)})`,
    "on conflict (username) do update set",
    "  password_hash = excluded.password_hash,",
    "  updated_at = now();",
  ].join("\n"),
);
