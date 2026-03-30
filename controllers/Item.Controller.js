const ItemRequest = require("../models/Item.model");
const bcService = require("../services/businessCentral.service");
const User = require("../models/Authorization.model");

// ─── Create Item Request ───────────────────────────────────
// POST /api/items
const createItemRequest = async (req, res) => {
  try {
    // ─── Validate required fields ──────────────────────────
    if (!req.body.itemName) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    
    // ─── Check duplicate batchNo ───────────────────────────
    if (req.body.batchNo) {
      const existing = await ItemRequest.findByBatchNo(req.body.batchNo);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Batch number already exists",
        });
      }
    }

    // ─── Get authenticated user's partner number ───────────
    const userId = req.user ? req.user.id : null;
    let partnerNo = req.body.partnerNo;
    
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.ref_no) {
        partnerNo = user.ref_no; // Use authenticated user's partner number
      }
    }

    // ─── Create item with user's partner number ────────────
    const itemData = {
      ...req.body,
      partnerNo: partnerNo,
      status: req.body.status || "Open" // Default to Open if not provided
    };
    
    // ─── Validate status if provided ───────────────────────
    const validStatuses = ["Open", "Pending", "Approved"];
    if (itemData.status && !validStatuses.includes(itemData.status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }
    
    const item = await ItemRequest.create(itemData, userId);

    // ─── Send to Business Central ──────────────────────────
    let bcResponse = null;
    let bcError = null;
    try {
      bcResponse = await bcService.createItemRequest(itemData);
      console.log("✅ Item synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync to Business Central:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "Item request Created successfully",
      data: item,
      businessCentral: {
        synced: !!bcResponse,
        response: bcResponse,
        error: bcError,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Item Requests ─────────────────────────────────
// GET /api/items
// GET /api/items?status=Open
// GET /api/items?partnerNo=VNR000001
const getAllItemRequests = async (req, res) => {
  try {
    const { status, partnerNo } = req.query;
    const { role, id: userId } = req.user;

    let items;
    
    // ─── Vendors see only their own items ──────────────────
    if (role === "vendor" || role === "vendor_admin") {
      const user = await User.findById(userId);
      const userPartnerNo = user?.ref_no;
      
      if (status) {
        items = await ItemRequest.findByStatus(status);
        items = items.filter(item => item.partner_no === userPartnerNo);
      } else if (partnerNo) {
        // Vendors can only see their own partner items
        if (partnerNo === userPartnerNo) {
          items = await ItemRequest.findByPartnerNo(partnerNo);
        } else {
          items = [];
        }
      } else {
        items = await ItemRequest.findByPartnerNo(userPartnerNo);
      }
    } else {
      // ─── Admins see all items ──────────────────────────────
      if (status) {
        items = await ItemRequest.findByStatus(status);
      } else if (partnerNo) {
        items = await ItemRequest.findByPartnerNo(partnerNo);
      } else {
        items = await ItemRequest.findAll();
      }
    }

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Item Request by ID ────────────────────────────────
// GET /api/items/:id
const getItemRequestById = async (req, res) => {
  try {
    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Items by Partner No ───────────────────────────────
// GET /api/items/partner/:partnerNo
const getItemsByPartner = async (req, res) => {
  try {
    const items = await ItemRequest.findByPartnerNo(req.params.partnerNo);
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateItemRequest = async (req, res) => {
  try {
    // ─── Check item exists ─────────────────────────────────
    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    // ─── Only allow update if status is Open ────────────
    if (item.status !== "Open") {
      return res.status(400).json({
        success: false,
        message: `Cannot update item with status: ${item.status}. Only 'Open' items can be updated`,
      });
    }

    // ─── Validate status if provided ───────────────────────
    const validStatuses = ["Open", "Pending", "Approved"];
    if (itemData.status && !validStatuses.includes(itemData.status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    // ─── Check duplicate batchNo if changed ────────────────
    if (req.body.batchNo && req.body.batchNo !== item.batch_no) {
      const existing = await ItemRequest.findByBatchNo(req.body.batchNo);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Batch number already exists",
        });
      }
    }

    // ─── Validate status if provided ───────────────────────
    if (req.body.status && !validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const updated = await ItemRequest.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Item request updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Item Status ────────────────────────────────────
// PATCH /api/items/:id/status
const updateItemStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    // ─── Validate status ───────────────────────────────────
    const validStatuses = ["Open", "Pending", "Approved"];
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    // ─── Rejection reason required if rejected ─────────────
    if (status === "Rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when rejecting an item",
      });
    }

    // ─── Check item exists ─────────────────────────────────
    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    const updated = await ItemRequest.updateStatus(
      req.params.id,
      status,
      rejectionReason || null,
    );

    res.status(200).json({
      success: true,
      message: `Item status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Block / Unblock Item ──────────────────────────────────
// PATCH /api/items/:id/block
const updateItemBlock = async (req, res) => {
  try {
    const { block } = req.body;

    if (typeof block !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Block must be true or false",
      });
    }

    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    const updated = await ItemRequest.updateBlock(req.params.id, block);
    res.status(200).json({
      success: true,
      message: `Item ${block ? "blocked" : "unblocked"} successfully`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Item Request ───────────────────────────────────
// DELETE /api/items/:id
const deleteItemRequest = async (req, res) => {
  try {
    // ─── Check item exists ─────────────────────────────────
    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    // ─── Only allow delete if status is Open ────────────
    if (item.status !== "Open") {
      return res.status(400).json({
        success: false,
        message: `Cannot delete item with status: ${item.status}. Only 'Open' items can be deleted`,
      });
    }

    await ItemRequest.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Item request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createItemRequest,
  getAllItemRequests,
  getItemRequestById,
  getItemsByPartner,
  updateItemRequest,
  updateItemStatus,
  updateItemBlock,
  deleteItemRequest,
};
