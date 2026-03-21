const { pool } = require("../config/db");

const SalesOrder = {
  // ─── Create Order with Lines ───────────────────────────
  async create(data, userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // ─── Insert Header ───────────────────────────────────
      const orderQuery = `
        INSERT INTO sales_orders (
          order_type, partner_no, partner_type, ship_to_code,
          location_code, order_date, requested_delivery_date,
          currency_code, external_document_no, status,
          direction, submitted_date, created_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
        ) RETURNING *;
      `;
      const orderValues = [
        data.orderType || null, // $1
        data.partnerNo || null, // $2
        data.partnerType || null, // $3
        data.shipToCode || null, // $4
        data.locationCode || null, // $5
        data.orderDate || null, // $6
        data.requestedDeliveryDate || null, // $7
        data.currencyCode || null, // $8
        data.externalDocumentNo || null, // $9
        data.status || "Processed", // $10
        data.direction || null, // $11
        data.submittedDate || null, // $12
        userId || null, // $13
      ];

      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];

      // ─── Insert Lines ────────────────────────────────────
      const lines = [];
      if (data.orderStagingLines && data.orderStagingLines.length > 0) {
        for (const line of data.orderStagingLines) {
          const lineQuery = `
            INSERT INTO sales_order_lines (
              order_id, line_no, item_no, description,
              quantity, unit_of_measure_code, unit_price,
              line_discount_percent, line_discount_amount,
              line_amount, location_code, delivery_date, variant_code
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
            ) RETURNING *;
          `;
          const lineValues = [
            order.id, // $1
            line.lineNo || null, // $2
            line.itemNo || null, // $3
            line.description || null, // $4
            line.quantity || 0, // $5
            line.unitOfMeasureCode || null, // $6
            line.unitPrice || 0, // $7
            line.lineDiscountPercent || 0, // $8
            line.lineDiscountAmount || 0, // $9
            line.lineAmount || 0, // $10
            line.locationCode || null, // $11
            line.deliveryDate || null, // $12
            line.variantCode || null, // $13
          ];
          const lineResult = await client.query(lineQuery, lineValues);
          lines.push(lineResult.rows[0]);
        }
      }

      await client.query("COMMIT");
      return { ...order, orderStagingLines: lines };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // ─── Find All ──────────────────────────────────────────
  async findAll() {
    const orders = await pool.query(
      "SELECT * FROM sales_orders ORDER BY created_at DESC",
    );
    const result = [];
    for (const order of orders.rows) {
      const lines = await pool.query(
        "SELECT * FROM sales_order_lines WHERE order_id = $1 ORDER BY line_no",
        [order.id],
      );
      result.push({ ...order, orderStagingLines: lines.rows });
    }
    return result;
  },

  // ─── Find by ID ────────────────────────────────────────
  async findById(id) {
    const order = await pool.query("SELECT * FROM sales_orders WHERE id = $1", [
      id,
    ]);
    if (!order.rows[0]) return null;

    const lines = await pool.query(
      "SELECT * FROM sales_order_lines WHERE order_id = $1 ORDER BY line_no",
      [id],
    );
    return { ...order.rows[0], orderStagingLines: lines.rows };
  },

  // ─── Find by Partner No ────────────────────────────────
  async findByPartnerNo(partnerNo) {
    const orders = await pool.query(
      "SELECT * FROM sales_orders WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo],
    );
    const result = [];
    for (const order of orders.rows) {
      const lines = await pool.query(
        "SELECT * FROM sales_order_lines WHERE order_id = $1 ORDER BY line_no",
        [order.id],
      );
      result.push({ ...order, orderStagingLines: lines.rows });
    }
    return result;
  },

  // ─── Find by Status ────────────────────────────────────
  async findByStatus(status) {
    const orders = await pool.query(
      "SELECT * FROM sales_orders WHERE status = $1 ORDER BY created_at DESC",
      [status],
    );
    const result = [];
    for (const order of orders.rows) {
      const lines = await pool.query(
        "SELECT * FROM sales_order_lines WHERE order_id = $1 ORDER BY line_no",
        [order.id],
      );
      result.push({ ...order, orderStagingLines: lines.rows });
    }
    return result;
  },

  // ─── Update ────────────────────────────────────────────
  async update(id, data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // ─── Update Header ───────────────────────────────────
      const orderQuery = `
        UPDATE sales_orders SET
          order_type=$1, partner_no=$2, partner_type=$3,
          ship_to_code=$4, location_code=$5, order_date=$6,
          requested_delivery_date=$7, currency_code=$8,
          external_document_no=$9, status=$10, direction=$11,
          submitted_date=$12, updated_at=NOW()
        WHERE id=$13 RETURNING *;
      `;
      const orderValues = [
        data.orderType || null,
        data.partnerNo || null,
        data.partnerType || null,
        data.shipToCode || null,
        data.locationCode || null,
        data.orderDate || null,
        data.requestedDeliveryDate || null,
        data.currencyCode || null,
        data.externalDocumentNo || null,
        data.status || "Processed",
        data.direction || null,
        data.submittedDate || null,
        id,
      ];
      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];

      // ─── Delete old lines and reinsert ───────────────────
      await client.query("DELETE FROM sales_order_lines WHERE order_id = $1", [
        id,
      ]);

      const lines = [];
      if (data.orderStagingLines && data.orderStagingLines.length > 0) {
        for (const line of data.orderStagingLines) {
          const lineQuery = `
            INSERT INTO sales_order_lines (
              order_id, line_no, item_no, description,
              quantity, unit_of_measure_code, unit_price,
              line_discount_percent, line_discount_amount,
              line_amount, location_code, delivery_date, variant_code
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
            ) RETURNING *;
          `;
          const lineValues = [
            id,
            line.lineNo || null,
            line.itemNo || null,
            line.description || null,
            line.quantity || 0,
            line.unitOfMeasureCode || null,
            line.unitPrice || 0,
            line.lineDiscountPercent || 0,
            line.lineDiscountAmount || 0,
            line.lineAmount || 0,
            line.locationCode || null,
            line.deliveryDate || null,
            line.variantCode || null,
          ];
          const lineResult = await client.query(lineQuery, lineValues);
          lines.push(lineResult.rows[0]);
        }
      }

      await client.query("COMMIT");
      return { ...order, orderStagingLines: lines };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // ─── Update Status Only ────────────────────────────────
  async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE sales_orders SET status=$1, updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [status, id],
    );
    return result.rows[0] || null;
  },

  // ─── Delete Order + Lines (cascade) ───────────────────
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM sales_orders WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0] || null;
  },
};

module.exports = SalesOrder;
