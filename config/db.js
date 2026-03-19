const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // ← fixes self-signed cert error
  },
});

const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }

    console.log("Attempting to connect to PostgreSQL...");

    const client = await pool.connect();
    const res = await client.query("SELECT current_database(), version()");
    const { current_database, version } = res.rows[0];

    console.log("✅ PostgreSQL connected!");
    console.log("   DB:", current_database);
    console.log("   Version:", version.split(" ").slice(0, 2).join(" "));

    client.release();
    return pool;
  } catch (error) {
    console.error("PostgreSQL connection error:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, pool };
