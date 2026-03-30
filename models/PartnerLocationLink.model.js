const { pool } = require("../config/db");

const PartnerLocationLink = {

  async create(data, userId) {
    const query = `
      INSERT INTO partner_location_links (
        location_code, description, address_name, address, address2,
        city, post_code, country_region_code, contact, phone_no,
        is_default, blocked
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
      ) RETURNING *;
    `;
    const values = [
      data.locationCode      || null,  // $1  location_code
      data.description       || null,  // $2  description
      data.addressName       || null,  // $3  address_name
      data.address           || null,  // $4  address
      data.address2          || null,  // $5  address2
      data.city              || null,  // $6  city
      data.postCode          || null,  // $7  post_code
      data.countryRegionCode || null,  // $8  country_region_code
      data.contact           || null,  // $9  contact
      data.phoneNo           || null,  // $10 phone_no
      data.isDefault         ?? false, // $11 is_default
      data.blocked           ?? false, // $12 blocked
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      "SELECT * FROM partner_location_links ORDER BY created_at DESC",
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM partner_location_links WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  },

  async findByLocationCode(locationCode) {
    const result = await pool.query(
      "SELECT * FROM partner_location_links WHERE location_code = $1 ORDER BY created_at DESC",
      [locationCode],
    );
    return result.rows;
  },

  async findDefault() {
    const result = await pool.query(
      "SELECT * FROM partner_location_links WHERE is_default = true LIMIT 1",
    );
    return result.rows[0] || null;
  },

  async update(id, data) {
    const query = `
      UPDATE partner_location_links SET
        location_code=$1, description=$2, address_name=$3,
        address=$4, address2=$5, city=$6, post_code=$7,
        country_region_code=$8, contact=$9, phone_no=$10,
        is_default=$11, blocked=$12, updated_at=NOW()
      WHERE id=$13 RETURNING *;
    `;
    const values = [
      data.locationCode      || null,  // $1  location_code
      data.description       || null,  // $2  description
      data.addressName       || null,  // $3  address_name
      data.address           || null,  // $4  address
      data.address2          || null,  // $5  address2
      data.city              || null,  // $6  city
      data.postCode          || null,  // $7  post_code
      data.countryRegionCode || null,  // $8  country_region_code
      data.contact           || null,  // $9  contact
      data.phoneNo           || null,  // $10 phone_no
      data.isDefault         ?? false, // $11 is_default
      data.blocked           ?? false, // $12 blocked
      id,                              // $13 id
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  async updateBlocked(id, blocked) {
    const result = await pool.query(
      `UPDATE partner_location_links SET blocked=$1, updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [blocked, id],
    );
    return result.rows[0] || null;
  },

  async updateDefault(id, isDefault) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      if (isDefault) {
        await client.query(
          `UPDATE partner_location_links SET is_default=false WHERE id != $1`,
          [id],
        );
      }

      const result = await client.query(
        `UPDATE partner_location_links SET is_default=$1, updated_at=NOW()
         WHERE id=$2 RETURNING *`,
        [isDefault, id],
      );

      await client.query("COMMIT");
      return result.rows[0] || null;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM partner_location_links WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0] || null;
  },
};

module.exports = PartnerLocationLink;
