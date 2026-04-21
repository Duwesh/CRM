import { createClient } from "@supabase/supabase-js";
import pkg from "pg";
const { Pool } = pkg;
import { Sequelize } from "sequelize";
import { env } from "./env.js";

// ============================================
// Supabase Client (for Auth + Realtime)
// ============================================
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Supabase Admin Client (service role - bypasses RLS)
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// ============================================
// Sequelize Instance
// ============================================
export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  // logging: env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  },
  define: {
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
});

// ============================================
// PostgreSQL Connection Pool (for legacy raw queries)
// ============================================
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

// Helper for parameterized queries
export const query = (text, params) => pool.query(text, params);

// Helper for transactions
export const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Sequelize connected successfully");

    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL pool connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};
