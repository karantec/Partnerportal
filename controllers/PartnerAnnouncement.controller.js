// controllers/partnerAnnouncementController.js

const PartnerAnnouncement = require("../models/PartnerAnnouncement");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/partner-announcements
// Create a new partner announcement
// ─────────────────────────────────────────────────────────────────────────────
const createPartnerAnnouncement = async (req, res) => {
  try {
    const {
      title,
      body,
      publishDate,
      expiryDate,
      priority,
      status,
      targetPartnerType,
    } = req.body;

    const announcement = await PartnerAnnouncement.create({
      title,
      body,
      publishDate,
      expiryDate,
      priority,
      status,
      targetPartnerType,
    });

    return res.status(201).json({
      success: true,
      message: "Partner announcement created successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("createPartnerAnnouncement error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/partner-announcements
// Get all announcements (optional ?status= filter)
// ─────────────────────────────────────────────────────────────────────────────
const getAllPartnerAnnouncements = async (req, res) => {
  try {
    const { status } = req.query;

    const announcements = await PartnerAnnouncement.findAll(status || null);

    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("getAllPartnerAnnouncements error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/partner-announcements/active
// Get all currently active (Published + within date window) announcements
// ─────────────────────────────────────────────────────────────────────────────
const getActivePartnerAnnouncements = async (req, res) => {
  try {
    const announcements = await PartnerAnnouncement.findActive();

    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("getActivePartnerAnnouncements error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/partner-announcements/:id
// Get a single announcement by ID
// ─────────────────────────────────────────────────────────────────────────────
const getPartnerAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await PartnerAnnouncement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Partner announcement not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("getPartnerAnnouncementById error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/partner-announcements/partner-type/:targetPartnerType
// Get announcements by target partner type
// ─────────────────────────────────────────────────────────────────────────────
const getAnnouncementsByPartnerType = async (req, res) => {
  try {
    const { targetPartnerType } = req.params;

    const announcements =
      await PartnerAnnouncement.findByTargetPartnerType(targetPartnerType);

    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("getAnnouncementsByPartnerType error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/partner-announcements/:id
// Update a partner announcement
// ─────────────────────────────────────────────────────────────────────────────
const updatePartnerAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    // Check existence first
    const existing = await PartnerAnnouncement.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Partner announcement not found",
      });
    }

    const {
      title,
      body,
      publishDate,
      expiryDate,
      priority,
      status,
      targetPartnerType,
    } = req.body;

    // Merge incoming fields with existing data so partial updates work
    const updatedData = {
      title:               title               ?? existing.title,
      body:                body                ?? existing.body,
      publishDate:         publishDate         ?? existing.publish_date,
      expiryDate:          expiryDate          ?? existing.expiry_date,
      priority:            priority            ?? existing.priority,
      status:              status              ?? existing.status,
      targetPartnerType:   targetPartnerType   ?? existing.target_partner_type,
    };

    const updated = await PartnerAnnouncement.update(id, updatedData);

    return res.status(200).json({
      success: true,
      message: "Partner announcement updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("updatePartnerAnnouncement error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/partner-announcements/:id/status
// Update only the status of an announcement
// ─────────────────────────────────────────────────────────────────────────────
const updateAnnouncementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(422).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["Draft", "Published", "Archived"];
    if (!validStatuses.includes(status)) {
      return res.status(422).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const existing = await PartnerAnnouncement.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Partner announcement not found",
      });
    }

    const updated = await PartnerAnnouncement.update(id, {
      title:             existing.title,
      body:              existing.body,
      publishDate:       existing.publish_date,
      expiryDate:        existing.expiry_date,
      priority:          existing.priority,
      status,                               // ← only this changes
      targetPartnerType: existing.target_partner_type,
    });

    return res.status(200).json({
      success: true,
      message: `Announcement status updated to "${status}"`,
      data: updated,
    });
  } catch (error) {
    console.error("updateAnnouncementStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/partner-announcements/:id
// Delete a partner announcement
// ─────────────────────────────────────────────────────────────────────────────
const deletePartnerAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await PartnerAnnouncement.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Partner announcement not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Partner announcement deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("deletePartnerAnnouncement error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createPartnerAnnouncement,
  getAllPartnerAnnouncements,
  getActivePartnerAnnouncements,
  getPartnerAnnouncementById,
  getAnnouncementsByPartnerType,
  updatePartnerAnnouncement,
  updateAnnouncementStatus,
  deletePartnerAnnouncement,
};