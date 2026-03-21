const { pool } = require("../config/db");

const PurchaseReceipt = {
  // ─── Create Receipt with Lines ─────────────────────────
  async create(data, userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // ─── Check duplicate shipmentNo ──────────────────────
      if (data.shipmentNo) {
        const existing = await client.query(
          "SELECT id FROM purchase_receipts WHERE shipment_no = $1",
          [data.shipmentNo],
        );
        if (existing.rows[0]) {
          throw new Error("Shipment number already exists");
        }
      }

      // ─── Insert Header ───────────────────────────────────
      const receiptQuery = `
        INSERT INTO purchase_receipts (
          delivery_type, partner_no, partner_type, linked_order_no,
          shipment_no, tracking_no, carrier_code, shipment_date,
          expected_delivery_date, location_code, ship_to_code,
          status, direction, bc_document_no, created_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
        ) RETURNING *;
      `;
      const receiptValues = [
        data.deliveryType || null, // $1
        data.partnerNo || null, // $2
        data.partnerType || null, // $3
        data.linkedOrderNo || null, // $4
        data.shipmentNo || null, // $5
        data.trackingNo || null, // $6
        data.carrierCode || null, // $7
        data.shipmentDate || null, // $8
        data.expectedDeliveryDate || null, // $9
        data.locationCode || null, // $10
        data.shipToCode || null, // $11
        data.status || "Processed", // $12
        data.direction || null, // $13
        data.bcDocumentNo || null, // $14
        userId || null, // $15
      ];

      const receiptResult = await client.query(receiptQuery, receiptValues);
      const receipt = receiptResult.rows[0];

      // ─── Insert Lines ────────────────────────────────────
      const lines = [];
      if (data.deliveryStagingsLine && data.deliveryStagingsLine.length > 0) {
        for (const line of data.deliveryStagingsLine) {
          const lineQuery = `
            INSERT INTO purchase_receipt_lines (
              receipt_id, line_no, item_no, description,
              expiration_date, lot_no, ordered_quantity,
              remaining_quantity, serial_no, shipped_quantity,
              unit_of_measure_code, variant_code
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
            ) RETURNING *;
          `;
          const lineValues = [
            receipt.id, // $1
            line.lineNo || null, // $2
            line.itemNo || null, // $3
            line.description || null, // $4
            line.expirationDate || null, // $5
            line.lotNo || null, // $6
            line.orderedQuantity || 0, // $7
            line.remainingQuantity || 0, // $8
            line.serialNo || null, // $9
            line.shippedQuantity || 0, // $10
            line.unitOfMeasureCode || null, // $11
            line.variantCode || null, // $12
          ];
          const lineResult = await client.query(lineQuery, lineValues);
          lines.push(lineResult.rows[0]);
        }
      }

      await client.query("COMMIT");
      return { ...receipt, deliveryStagingsLine: lines };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // ─── Find All ──────────────────────────────────────────
  async findAll() {
    const receipts = await pool.query(
      "SELECT * FROM purchase_receipts ORDER BY created_at DESC",
    );
    const result = [];
    for (const receipt of receipts.rows) {
      const lines = await pool.query(
        "SELECT * FROM purchase_receipt_lines WHERE receipt_id = $1 ORDER BY line_no",
        [receipt.id],
      );
      result.push({ ...receipt, deliveryStagingsLine: lines.rows });
    }
    return result;
  },

  // ─── Find by ID ────────────────────────────────────────
  async findById(id) {
    const receipt = await pool.query(
      "SELECT * FROM purchase_receipts WHERE id = $1",
      [id],
    );
    if (!receipt.rows[0]) return null;

    const lines = await pool.query(
      "SELECT * FROM purchase_receipt_lines WHERE receipt_id = $1 ORDER BY line_no",
      [id],
    );
    return { ...receipt.rows[0], deliveryStagingsLine: lines.rows };
  },

  // ─── Find by Shipment No ───────────────────────────────
  async findByShipmentNo(shipmentNo) {
    const receipt = await pool.query(
      "SELECT * FROM purchase_receipts WHERE shipment_no = $1",
      [shipmentNo],
    );
    if (!receipt.rows[0]) return null;

    const lines = await pool.query(
      "SELECT * FROM purchase_receipt_lines WHERE receipt_id = $1 ORDER BY line_no",
      [receipt.rows[0].id],
    );
    return { ...receipt.rows[0], deliveryStagingsLine: lines.rows };
  },

  // ─── Find by Partner No ────────────────────────────────
  async findByPartnerNo(partnerNo) {
    const receipts = await pool.query(
      "SELECT * FROM purchase_receipts WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo],
    );
    const result = [];
    for (const receipt of receipts.rows) {
      const lines = await pool.query(
        "SELECT * FROM purchase_receipt_lines WHERE receipt_id = $1 ORDER BY line_no",
        [receipt.id],
      );
      result.push({ ...receipt, deliveryStagingsLine: lines.rows });
    }
    return result;
  },

  // ─── Find by Status ────────────────────────────────────
  async findByStatus(status) {
    const receipts = await pool.query(
      "SELECT * FROM purchase_receipts WHERE status = $1 ORDER BY created_at DESC",
      [status],
    );
    const result = [];
    for (const receipt of receipts.rows) {
      const lines = await pool.query(
        "SELECT * FROM purchase_receipt_lines WHERE receipt_id = $1 ORDER BY line_no",
        [receipt.id],
      );
      result.push({ ...receipt, deliveryStagingsLine: lines.rows });
    }
    return result;
  },

  // ─── Update ────────────────────────────────────────────
  async update(id, data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const receiptQuery = `
        UPDATE purchase_receipts SET
          delivery_type=$1, partner_no=$2, partner_type=$3,
          linked_order_no=$4, shipment_no=$5, tracking_no=$6,
          carrier_code=$7, shipment_date=$8, expected_delivery_date=$9,
          location_code=$10, ship_to_code=$11, status=$12,
          direction=$13, bc_document_no=$14, updated_at=NOW()
        WHERE id=$15 RETURNING *;
      `;
      const receiptValues = [
        data.deliveryType || null,
        data.partnerNo || null,
        data.partnerType || null,
        data.linkedOrderNo || null,
        data.shipmentNo || null,
        data.trackingNo || null,
        data.carrierCode || null,
        data.shipmentDate || null,
        data.expectedDeliveryDate || null,
        data.locationCode || null,
        data.shipToCode || null,
        data.status || "Processed",
        data.direction || null,
        data.bcDocumentNo || null,
        id,
      ];
      const receiptResult = await client.query(receiptQuery, receiptValues);
      const receipt = receiptResult.rows[0];

      // ─── Delete old lines and reinsert ───────────────────
      await client.query(
        "DELETE FROM purchase_receipt_lines WHERE receipt_id = $1",
        [id],
      );

      const lines = [];
      if (data.deliveryStagingsLine && data.deliveryStagingsLine.length > 0) {
        for (const line of data.deliveryStagingsLine) {
          const lineQuery = `
            INSERT INTO purchase_receipt_lines (
              receipt_id, line_no, item_no, description,
              expiration_date, lot_no, ordered_quantity,
              remaining_quantity, serial_no, shipped_quantity,
              unit_of_measure_code, variant_code
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
            ) RETURNING *;
          `;
          const lineValues = [
            id,
            line.lineNo || null,
            line.itemNo || null,
            line.description || null,
            line.expirationDate || null,
            line.lotNo || null,
            line.orderedQuantity || 0,
            line.remainingQuantity || 0,
            line.serialNo || null,
            line.shippedQuantity || 0,
            line.unitOfMeasureCode || null,
            line.variantCode || null,
          ];
          const lineResult = await client.query(lineQuery, lineValues);
          lines.push(lineResult.rows[0]);
        }
      }

      await client.query("COMMIT");
      return { ...receipt, deliveryStagingsLine: lines };
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
      `UPDATE purchase_receipts SET status=$1, updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [status, id],
    );
    return result.rows[0] || null;
  },

  // ─── Delete Receipt + Lines (cascade) ─────────────────
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM purchase_receipts WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0] || null;
  },
};

module.exports = PurchaseReceipt;
