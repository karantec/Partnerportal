const { pool } = require("../config/db");

const PartnerAnnouncement = {
  // ─── CREATE ──────────────────────────────────────────────────────────────
  async create(data) {
    const query = `
      INSERT INTO partner_announcements (
        title, body,
        publish_date, expiry_date,
        priority, status,
        target_partner_type
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      ) RETURNING *;
    `;
    const values = [
      data.title,                        // $1  title
      data.body              || "",      // $2  body
      data.publishDate,                  // $3  publish_date
      data.expiryDate,                   // $4  expiry_date
      data.priority          || "Low",// $5  priority
      data.status            || "Draft", // $6  status
      data.targetPartnerType,            // $7  target_partner_type
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // ─── FIND ALL (optional status filter) ───────────────────────────────────
  async findAll(status) {
    const query = status
      ? `SELECT id, title, body, publish_date, expiry_date,
               priority, status, target_partner_type,
               created_at, updated_at
         FROM partner_announcements
         WHERE status = $1
         ORDER BY created_at DESC`
      : `SELECT id, title, body, publish_date, expiry_date,
               priority, status, target_partner_type,
               created_at, updated_at
         FROM partner_announcements
         ORDER BY created_at DESC`;
    const values = status ? [status] : [];
    const result = await pool.query(query, values);
    return result.rows;
  },

  // ─── FIND BY ID ───────────────────────────────────────────────────────────
  async findById(id) {
    const result = await pool.query(
      `SELECT id, title, body, publish_date, expiry_date,
              priority, status, target_partner_type,
              created_at, updated_at
       FROM partner_announcements
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  // ─── FIND BY STATUS ───────────────────────────────────────────────────────
  async findByStatus(status) {
    const result = await pool.query(
      `SELECT id, title, body, publish_date, expiry_date,
              priority, status, target_partner_type,
              created_at, updated_at
       FROM partner_announcements
       WHERE status = $1
       ORDER BY created_at DESC`,
      [status],
    );
    return result.rows;
  },

  // ─── FIND BY TARGET PARTNER TYPE ─────────────────────────────────────────
  async findByTargetPartnerType(targetPartnerType) {
    const result = await pool.query(
      `SELECT id, title, body, publish_date, expiry_date,
              priority, status, target_partner_type,
              created_at, updated_at
       FROM partner_announcements
       WHERE target_partner_type = $1
       ORDER BY created_at DESC`,
      [targetPartnerType],
    );
    return result.rows;
  },

  // ─── FIND ACTIVE (within publish/expiry window) ───────────────────────────
  async findActive() {
    const result = await pool.query(
      `SELECT id, title, body, publish_date, expiry_date,
              priority, status, target_partner_type,
              created_at, updated_at
       FROM partner_announcements
       WHERE status = 'Published'
         AND publish_date <= CURRENT_DATE
         AND expiry_date  >= CURRENT_DATE
       ORDER BY priority DESC, created_at DESC`,
    );
    return result.rows;
  },

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id, data) {
    const query = `
      UPDATE partner_announcements SET
        title               = $1,
        body                = $2,
        publish_date        = $3,
        expiry_date         = $4,
        priority            = $5,
        status              = $6,
        target_partner_type = $7,
        updated_at          = NOW()
      WHERE id = $8
      RETURNING *;
    `;
    const values = [
      data.title,                        // $1
      data.body              || "",      // $2
      data.publishDate,                  // $3
      data.expiryDate,                   // $4
      data.priority          || "Low",// $5
      data.status            || "Draft", // $6
      data.targetPartnerType,            // $7
      id,                                // $8
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM partner_announcements WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0] || null;
  },
};

module.exports = PartnerAnnouncement;