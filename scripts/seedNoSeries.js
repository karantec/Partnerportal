const { pool } = require("../config/db");

const noSeriesData = [
  // Items
  {
    code: "ITEM",
    description: "Item Request Number Series",
    startingNo: 1000,
    endingNo: 999999,
    lastNoUsed: 1000,
    warningNo: 990000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: false
  },
  // Purchase Orders
  {
    code: "PO",
    description: "Purchase Order Number Series",
    startingNo: 10000,
    endingNo: 999999,
    lastNoUsed: 10000,
    warningNo: 990000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: true
  },
  // Sales Orders
  {
    code: "SO",
    description: "Sales Order Number Series",
    startingNo: 20000,
    endingNo: 999999,
    lastNoUsed: 20000,
    warningNo: 990000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: true
  },
  // Purchase Invoices
  {
    code: "PINV",
    description: "Purchase Invoice Number Series",
    startingNo: 30000,
    endingNo: 999999,
    lastNoUsed: 30000,
    warningNo: 990000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: true
  },
  // Sales Invoices
  {
    code: "SINV",
    description: "Sales Invoice Number Series",
    startingNo: 40000,
    endingNo: 999999,
    lastNoUsed: 40000,
    warningNo: 990000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: true
  },
  // Purchase Receipts
  {
    code: "PREC",
    description: "Purchase Receipt Number Series",
    startingNo: 50000,
    endingNo: 999999,
    lastNoUsed: 50000,
    warningNo: 990000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: true
  },
  // Customers
  {
    code: "CUST",
    description: "Customer Number Series",
    startingNo: 1000,
    endingNo: 99999,
    lastNoUsed: 1000,
    warningNo: 95000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: false
  },
  // Vendors
  {
    code: "VEND",
    description: "Vendor Number Series",
    startingNo: 1000,
    endingNo: 99999,
    lastNoUsed: 1000,
    warningNo: 95000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: false
  },
  // Locations
  {
    code: "LOC",
    description: "Location Code Number Series",
    startingNo: 1000,
    endingNo: 99999,
    lastNoUsed: 1000,
    warningNo: 95000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: false
  },
  // Contacts
  {
    code: "CONT",
    description: "Contact Number Series",
    startingNo: 1000,
    endingNo: 99999,
    lastNoUsed: 1000,
    warningNo: 95000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: false
  },
  // Batch Numbers
  {
    code: "BATCH",
    description: "Batch Number Series",
    startingNo: 1000,
    endingNo: 999999,
    lastNoUsed: 1000,
    warningNo: 990000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: true
  },
  // Shipment Numbers
  {
    code: "SHIP",
    description: "Shipment Number Series",
    startingNo: 60000,
    endingNo: 999999,
    lastNoUsed: 60000,
    warningNo: 990000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: true
  },
  // Return Orders
  {
    code: "RET",
    description: "Return Order Number Series",
    startingNo: 70000,
    endingNo: 999999,
    lastNoUsed: 70000,
    warningNo: 990000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: true
  },
  // Credit Memos
  {
    code: "CM",
    description: "Credit Memo Number Series",
    startingNo: 80000,
    endingNo: 999999,
    lastNoUsed: 80000,
    warningNo: 990000,
    incrementByNo: 1,
    allowGaps: false,
    dateOrder: true
  },
  // Quotes
  {
    code: "QUOTE",
    description: "Quote Number Series",
    startingNo: 90000,
    endingNo: 999999,
    lastNoUsed: 90000,
    warningNo: 990000,
    incrementByNo: 1,
    allowGaps: true,
    dateOrder: true
  }
];

async function seedNoSeries() {
  try {
    console.log("🌱 Starting to seed number series...");

    for (const series of noSeriesData) {
      // Check if series already exists
      const existing = await pool.query(
        "SELECT id FROM no_series WHERE code = $1",
        [series.code]
      );

      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipping ${series.code} - already exists`);
        continue;
      }

      const query = `
        INSERT INTO no_series (
          code, description, starting_no, ending_no,
          last_no_used, warning_no, increment_by_no,
          allow_gaps, date_order
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
      `;

      const values = [
        series.code,
        series.description,
        series.startingNo,
        series.endingNo,
        series.lastNoUsed,
        series.warningNo,
        series.incrementByNo,
        series.allowGaps,
        series.dateOrder
      ];

      await pool.query(query, values);
      console.log(`✅ Seeded: ${series.code} - ${series.description}`);
    }

    console.log("\n🎉 Successfully seeded all number series!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding number series:", error.message);
    process.exit(1);
  }
}

seedNoSeries();
