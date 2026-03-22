const PurchaseReceipt = require("../models/PurchaseReceipt.model");

// ─── Create ────────────────────────────────────────────────
const createPurchaseReceipt = async (req, res) => {
  try {
    if (!req.body.partnerNo) {
      return res.status(400).json({
        success: false,
        message: "Partner number is required",
      });
    }

    if (
      !req.body.deliveryStagingsLine ||
      req.body.deliveryStagingsLine.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one delivery line is required",
      });
    }
    const userId = req.user ? req.user.id : null;

    const receipt = await PurchaseReceipt.create(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Purchase receipt created successfully",
      data: receipt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All ───────────────────────────────────────────────
const getAllPurchaseReceipts = async (req, res) => {
  try {
    const { status, partnerNo } = req.query;
    let receipts;

    if (status) {
      receipts = await PurchaseReceipt.findByStatus(status);
    } else if (partnerNo) {
      receipts = await PurchaseReceipt.findByPartnerNo(partnerNo);
    } else {
      receipts = await PurchaseReceipt.findAll();
    }

    res.status(200).json({
      success: true,
      count: receipts.length,
      data: receipts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get by ID ─────────────────────────────────────────────
const getPurchaseReceiptById = async (req, res) => {
  try {
    const receipt = await PurchaseReceipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Purchase receipt not found",
      });
    }
    res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get by Shipment No ────────────────────────────────────
const getPurchaseReceiptByShipmentNo = async (req, res) => {
  try {
    const receipt = await PurchaseReceipt.findByShipmentNo(
      req.params.shipmentNo,
    );
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Purchase receipt not found",
      });
    }
    res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get by Partner No ─────────────────────────────────────
const getPurchaseReceiptsByPartner = async (req, res) => {
  try {
    const receipts = await PurchaseReceipt.findByPartnerNo(
      req.params.partnerNo,
    );
    res.status(200).json({
      success: true,
      count: receipts.length,
      data: receipts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update ────────────────────────────────────────────────
const updatePurchaseReceipt = async (req, res) => {
  try {
    const receipt = await PurchaseReceipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Purchase receipt not found",
      });
    }

    if (
      !req.body.deliveryStagingsLine ||
      req.body.deliveryStagingsLine.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one delivery line is required",
      });
    }

    const updated = await PurchaseReceipt.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Purchase receipt updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Status ─────────────────────────────────────────
const updatePurchaseReceiptStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "Processed",
      "Pending",
      "Delivered",
      "Cancelled",
      "Partial",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const receipt = await PurchaseReceipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Purchase receipt not found",
      });
    }

    const updated = await PurchaseReceipt.updateStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: `Purchase receipt status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete ────────────────────────────────────────────────
const deletePurchaseReceipt = async (req, res) => {
  try {
    const receipt = await PurchaseReceipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Purchase receipt not found",
      });
    }

    const deleted = await PurchaseReceipt.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Purchase receipt deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPurchaseReceipt,
  getAllPurchaseReceipts,
  getPurchaseReceiptById,
  getPurchaseReceiptByShipmentNo,
  getPurchaseReceiptsByPartner,
  updatePurchaseReceipt,
  updatePurchaseReceiptStatus,
  deletePurchaseReceipt,
};
