const { pool } = require("../config/db");

const User = {
  async create(data, role) {
    const query = `
      INSERT INTO users (
        ref_no, name, name2,
        address, address2, city, post_code, country_region_code,
        phone_no, email, vat_registration_no, currency_code,
        payment_terms_code, password, role
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
      ) RETURNING *;
    `;
    const values = [
      data.customerNo || data.vendorNo || null, // $1  ref_no
      data.name, // $2  name
      data.name2 || null, // $3  name2
      data.address || null, // $4  address
      data.address2 || null, // $5  address2
      data.city || null, // $6  city
      data.postCode || null, // $7  post_code
      data.countryRegionCode || null, // $8  country_region_code
      data.phoneNo || null, // $9  phone_no
      data.email || null, // $10 email
      data.vatRegistrationNo || null, // $11 vat_registration_no
      data.currencyCode || null, // $12 currency_code
      data.paymentTermsCode || null, // $13 payment_terms_code
      data.password || null, // $14 password
      role, // $15 role
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findAll(role) {
    const query = role
      ? `SELECT id, ref_no, name, name2, address, address2, city, post_code,
         country_region_code, phone_no, email, vat_registration_no, currency_code,
         payment_terms_code, role, created_at, updated_at
         FROM users WHERE role = $1 ORDER BY created_at DESC`
      : `SELECT id, ref_no, name, name2, address, address2, city, post_code,
         country_region_code, phone_no, email, vat_registration_no, currency_code,
         payment_terms_code, role, created_at, updated_at
         FROM users ORDER BY created_at DESC`;
    const values = role ? [role] : [];
    const result = await pool.query(query, values);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id, ref_no, name, name2, address, address2, city, post_code,
       country_region_code, phone_no, email, vat_registration_no, currency_code,
       payment_terms_code, role, created_at, updated_at
       FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  async findByIdAndRole(id, role) {
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND role = $2",
      [id, role],
    );
    return result.rows[0] || null;
  },

  async findByRefNo(refNo) {
    const result = await pool.query("SELECT * FROM users WHERE ref_no = $1", [
      refNo,
    ]);
    return result.rows[0] || null;
  },

  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] || null;
  },

  async findByEmailWithPassword(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] || null;
  },

  async update(id, data) {
    const query = `
      UPDATE users SET
        name=$1, name2=$2, address=$3, address2=$4, city=$5,
        post_code=$6, country_region_code=$7, phone_no=$8,
        email=$9, vat_registration_no=$10, currency_code=$11,
        payment_terms_code=$12, updated_at=NOW()
      WHERE id=$13 RETURNING *;
    `;
    const values = [
      data.name,
      data.name2 || null,
      data.address || null,
      data.address2 || null,
      data.city || null,
      data.postCode || null,
      data.countryRegionCode || null,
      data.phoneNo || null,
      data.email || null,
      data.vatRegistrationNo || null,
      data.currencyCode || null,
      data.paymentTermsCode || null,
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0] || null;
  },
};

module.exports = User;
