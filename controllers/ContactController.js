const Contact = require("../models/Contact.model");

// ─── Create Contact ────────────────────────────────────────
// POST /api/contacts
const createContact = async (req, res) => {
  try {
    if (!req.body.contactName) {
      return res.status(400).json({
        success: false,
        message: "Contact name is required",
      });
    }

    // Check duplicate contactNo
    if (req.body.contactNo) {
      const existing = await Contact.findByContactNo(req.body.contactNo);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Contact number already exists",
        });
      }
    }

    const contact = await Contact.create(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: contact,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Contacts ──────────────────────────────────────
// GET /api/contacts
// GET /api/contacts?syncStatus=Pending
// GET /api/contacts?partnerNo=40000
// GET /api/contacts?companyNo=CT000019
const getAllContacts = async (req, res) => {
  try {
    const { syncStatus, partnerNo, companyNo } = req.query;

    let contacts;
    if (syncStatus) {
      contacts = await Contact.findBySyncStatus(syncStatus);
    } else if (partnerNo) {
      contacts = await Contact.findByPartnerNo(partnerNo);
    } else if (companyNo) {
      contacts = await Contact.findByCompanyNo(companyNo);
    } else {
      contacts = await Contact.findAll();
    }

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Contact by ID ─────────────────────────────────────
// GET /api/contacts/:id
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Contacts by Partner No ────────────────────────────
// GET /api/contacts/partner/:partnerNo
const getContactsByPartner = async (req, res) => {
  try {
    const contacts = await Contact.findByPartnerNo(req.params.partnerNo);
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Contact ────────────────────────────────────────
// PUT /api/contacts/:id
const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Check duplicate contactNo if changed
    if (req.body.contactNo && req.body.contactNo !== contact.contact_no) {
      const existing = await Contact.findByContactNo(req.body.contactNo);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Contact number already exists",
        });
      }
    }

    const updated = await Contact.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Sync Status ────────────────────────────────────
// PATCH /api/contacts/:id/sync
const updateSyncStatus = async (req, res) => {
  try {
    const { syncStatus } = req.body;

    const validStatuses = ["Pending", "Synced", "Failed"];
    if (!syncStatus || !validStatuses.includes(syncStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sync status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    const updated = await Contact.updateSyncStatus(req.params.id, syncStatus);
    res.status(200).json({
      success: true,
      message: `Sync status updated to ${syncStatus}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Portal Access ──────────────────────────────────
// PATCH /api/contacts/:id/portal
const updatePortalAccess = async (req, res) => {
  try {
    const { portalUser, portalAdmin } = req.body;

    if (typeof portalUser !== "boolean" || typeof portalAdmin !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "portalUser and portalAdmin must be true or false",
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    const updated = await Contact.updatePortalAccess(
      req.params.id,
      portalUser,
      portalAdmin,
    );
    res.status(200).json({
      success: true,
      message: "Portal access updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Contact ────────────────────────────────────────
// DELETE /api/contacts/:id
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    const deleted = await Contact.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  getContactsByPartner,
  updateContact,
  updateSyncStatus,
  updatePortalAccess,
  deleteContact,
};
