const { pool } = require("../config/db");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Tables to exclude from deletion (add table names here if needed)
const EXCLUDE_TABLES = [
  // Example: 'users', 'settings'
];

const clearAllTables = async () => {
  try {
    console.log("⚠️  WARNING: This will delete ALL data from ALL tables!\n");

    // Get all table names
    const tablesQuery = `
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    const result = await pool.query(tablesQuery);
    let tables = result.rows.map((row) => row.tablename);

    // Filter out excluded tables
    if (EXCLUDE_TABLES.length > 0) {
      tables = tables.filter((table) => !EXCLUDE_TABLES.includes(table));
      console.log(`Excluded tables: ${EXCLUDE_TABLES.join(", ")}\n`);
    }

    console.log(`Found ${tables.length} tables to clear:\n`);
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table}`);
    });

    console.log("\n");

    rl.question(
      "Are you sure you want to delete all data? Type 'YES' to confirm: ",
      async (answer) => {
        if (answer === "YES") {
          console.log("\n🗑️  Starting deletion...\n");

          // Disable foreign key checks temporarily
          await pool.query("SET session_replication_role = 'replica';");

          let totalDeleted = 0;

          // Delete data from each table
          for (const table of tables) {
            try {
              const deleteResult = await pool.query(`DELETE FROM ${table}`);
              console.log(
                `✅ Cleared: ${table.padEnd(30)} (${deleteResult.rowCount} rows)`,
              );
              totalDeleted += deleteResult.rowCount;
            } catch (error) {
              console.error(`❌ Error clearing ${table}:`, error.message);
            }
          }

          // Re-enable foreign key checks
          await pool.query("SET session_replication_role = 'origin';");

          console.log(`\n✅ Done! Total rows deleted: ${totalDeleted}`);
        } else {
          console.log("\n❌ Operation cancelled.");
        }

        rl.close();
        process.exit(0);
      },
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    rl.close();
    process.exit(1);
  }
};

clearAllTables();
