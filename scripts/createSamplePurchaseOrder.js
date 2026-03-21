const { pool } = require("../config/db");

/**
 * Sample Purchase Order Creation Script
 * Creates a complete purchase order with multiple line items
 */

const createSamplePurchaseOrder = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ─── Sample Purchase Order Header ──────────────────────
    const orderQuery = `
      INSERT INTO purchase_orders (
        order_type, partner_no, partner_type, ship_to_code,
        location_code, order_date, requested_delivery_date,
        currency_code, external_document_no, status,
        direction, submitted_date, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      ) RETURNING *;
    `;

    const orderDate = new Date();
    const deliveryDate = new Date(orderDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days later

    const orderValues = [
      "Purchase Order",           // orderType
      "VENDOR-001",               // partnerNo
      "Vendor",                   // partnerType
      "SHIP-LOC-001",             // shipToCode
      "LOC-001",                  // locationCode
      orderDate,                  // orderDate
      deliveryDate,               // requestedDeliveryDate
      "USD",                      // currencyCode
      "EXT-PO-2024-001",          // externalDocumentNo
      "Processed",                // status
      "Inbound",                  // direction
      orderDate,                  // submittedDate
      1,                          // created_by (user id)
    ];

    const orderResult = await client.query(orderQuery, orderValues);
    const order = orderResult.rows[0];

    console.log("✅ Purchase Order Header Created:");
    console.log(`   Order ID: ${order.id}`);
    console.log(`   Partner: ${order.partner_no}`);
    console.log(`   Status: ${order.status}`);

    // ─── Sample Order Lines ────────────────────────────────
    const lines = [
      {
        lineNo: 10000,
        itemNo: "ITEM-001",
        description: "Premium Organic Coffee Beans - 1kg",
        quantity: 100,
        unitOfMeasureCode: "BOX",
        unitPrice: 25.50,
        lineDiscountPercent: 5,
        lineDiscountAmount: 127.50,
        lineAmount: 2422.50,
        locationCode: "LOC-001",
        deliveryDate: deliveryDate,
        variantCode: "ARABICA-PREMIUM",
      },
      {
        lineNo: 20000,
        itemNo: "ITEM-002",
        description: "Green Tea Leaves - 500g",
        quantity: 200,
        unitOfMeasureCode: "PKG",
        unitPrice: 12.75,
        lineDiscountPercent: 0,
        lineDiscountAmount: 0,
        lineAmount: 2550.00,
        locationCode: "LOC-001",
        deliveryDate: deliveryDate,
        variantCode: "GREEN-TEA-STD",
      },
      {
        lineNo: 30000,
        itemNo: "ITEM-003",
        description: "Herbal Tea Mix - 250g",
        quantity: 150,
        unitOfMeasureCode: "PKG",
        unitPrice: 8.99,
        lineDiscountPercent: 10,
        lineDiscountAmount: 134.85,
        lineAmount: 1213.65,
        locationCode: "LOC-001",
        deliveryDate: deliveryDate,
        variantCode: "HERBAL-MIX",
      },
      {
        lineNo: 40000,
        itemNo: "ITEM-004",
        description: "Honey - 500ml Jar",
        quantity: 75,
        unitOfMeasureCode: "JAR",
        unitPrice: 18.50,
        lineDiscountPercent: 0,
        lineDiscountAmount: 0,
        lineAmount: 1387.50,
        locationCode: "LOC-001",
        deliveryDate: deliveryDate,
        variantCode: "HONEY-ORGANIC",
      },
      {
        lineNo: 50000,
        itemNo: "ITEM-005",
        description: "Spice Mix - 100g",
        quantity: 300,
        unitOfMeasureCode: "PKG",
        unitPrice: 5.25,
        lineDiscountPercent: 15,
        lineDiscountAmount: 236.25,
        lineAmount: 1338.75,
        locationCode: "LOC-001",
        deliveryDate: deliveryDate,
        variantCode: "SPICE-BLEND",
      },
    ];

    const lineQuery = `
      INSERT INTO purchase_order_lines (
        order_id, line_no, item_no, description,
        quantity, unit_of_measure_code, unit_price,
        line_discount_percent, line_discount_amount,
        line_amount, location_code, delivery_date, variant_code
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      ) RETURNING *;
    `;

    const insertedLines = [];
    for (const line of lines) {
      const lineValues = [
        order.id,
        line.lineNo,
        line.itemNo,
        line.description,
        line.quantity,
        line.unitOfMeasureCode,
        line.unitPrice,
        line.lineDiscountPercent,
        line.lineDiscountAmount,
        line.lineAmount,
        line.locationCode,
        line.deliveryDate,
        line.variantCode,
      ];

      const lineResult = await client.query(lineQuery, lineValues);
      insertedLines.push(lineResult.rows[0]);
      console.log(`   ✓ Line ${line.lineNo}: ${line.itemNo} - ${line.quantity} units`);
    }

    await client.query("COMMIT");

    // ─── Calculate Totals ──────────────────────────────────
    const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
    const totalAmount = lines.reduce((sum, line) => sum + line.lineAmount, 0);
    const totalDiscount = lines.reduce((sum, line) => sum + line.lineDiscountAmount, 0);

    console.log("\n📊 Order Summary:");
    console.log(`   Total Lines: ${lines.length}`);
    console.log(`   Total Quantity: ${totalQuantity} units`);
    console.log(`   Total Discount: $${totalDiscount.toFixed(2)}`);
    console.log(`   Total Amount: $${totalAmount.toFixed(2)}`);

    return {
      success: true,
      order: {
        ...order,
        orderStagingLines: insertedLines,
      },
      summary: {
        totalLines: lines.length,
        totalQuantity,
        totalDiscount,
        totalAmount,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error creating purchase order:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

// ─── Run Script ────────────────────────────────────────────
const runScript = async () => {
  try {
    console.log("🚀 Starting Purchase Order Creation...\n");
    const result = await createSamplePurchaseOrder();
    console.log("\n✅ Purchase Order created successfully!");
    console.log("\nOrder Details:");
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  }
};

runScript();
