#!/usr/bin/env node
/**
 * Generate Postman v2.1 collection from Express routes.
 *
 * Output:
 *   PartnerPortal.postman_collection.json (repo root)
 *
 * Usage:
 *   npm run postman:generate
 */
require("dotenv").config();
if (!process.env.JWT_SECRET) {
  // listEndpoints doesn't use JWT_SECRET, but routes/auth modules may import it.
  process.env.JWT_SECRET = "postman-collection-placeholder";
}

const fs = require("fs");
const path = require("path");
const express = require("express");
const listEndpoints = require("express-list-endpoints");

const { router: AuthRoutes } = require("../routes/auth.routes");
const UserRoutes = require("../routes/user.routes");
const ItemRoutes = require("../routes/item.routes");
const ContactRoutes = require("../routes/contact.routes");
const PurchaseOrderRoutes = require("../routes/purchaseOrder.routes");
const SalesOrderRoutes = require("../routes/salesOrder.routes");
const InvoiceRoutes = require("../routes/invoice.routes");
const PurchaseInvoiceRoutes = require("../routes/purchaseInvoice.routes");
const PurchaseReceiptRoutes = require("../routes/purchaseReceipt.routes");
const PartnerLocationLinkRoutes = require("../routes/partnerLocationLink.routes");

const PAYLOADS = {
  // Auth
  "POST|/api/auth/login": `{
  "email": "user@example.com",
  "password": "yourPassword"
}`,
  "POST|/api/auth/create-super-admin": `{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "securePassword",
  "superAdminSecret": "<SUPER_ADMIN_SECRET_KEY>"
}`,
  "POST|/api/auth/change-password": `{
  "oldPassword": "CurrentPassword@123",
  "newPassword": "NewPassword@456"
}`,

  // Users
  "POST|/api/users/register": `{
  "partnerno": "CUS000001",
  "name": "Test Customer",
  "name2": "Branch 1",
  "address": "Street 1",
  "address2": "Area",
  "city": "Bengaluru",
  "postCode": "560001",
  "countryRegionCode": "IN",
  "phoneNo": "+919999999999",
  "email": "customer@example.com",
  "vatRegistrationNo": "VAT123",
  "currencyCode": "INR",
  "paymentTermsCode": "NET30",
  "password": "Password@123",
  "role": "customer",
  "customerNo": "CUS000001",
  "vendorNo": null
}`,
  "PUT|/api/users/:id": `{
  "name": "Updated Name",
  "name2": "Updated Branch",
  "address": "Updated Street",
  "address2": "Updated Area",
  "city": "Mumbai",
  "postCode": "400001",
  "countryRegionCode": "IN",
  "phoneNo": "+919888888888",
  "email": "updated@example.com",
  "vatRegistrationNo": "VAT999",
  "currencyCode": "INR",
  "paymentTermsCode": "NET45"
}`,

  // Items
  "POST|/api/vendor/item": `{
  "batchNo": "BATCH-1001",
  "itemName": "Organic Rice",
  "description": "Premium grade",
  "itemCategoryCode": "FOOD",
  "baseUnitOfMeasure": "KG",
  "netWeight": 25,
  "grossWeight": 26,
  "specifications": "Long grain",
  "ingredients": "Rice",
  "allergenDeclaration": "None",
  "shelfLifeDays": 365,
  "gtin": "12345678901234",
  "eanCode": "8901234567890",
  "unitPrice": 120.5,
  "priceCurrencyCode": "INR",
  "partnerNo": "VNR000001",
  "block": false,
  "status": "Created",
  "rejectionReason": null
}`,
  "POST|/api/vendor/item/businesscentral": `{
  "batchNo": "BATCH-1001",
  "itemName": "Organic Rice",
  "description": "Premium grade",
  "itemCategoryCode": "FOOD",
  "baseUnitOfMeasure": "KG",
  "netWeight": 25,
  "grossWeight": 26,
  "specifications": "Long grain",
  "ingredients": "Rice",
  "allergenDeclaration": "None",
  "shelfLifeDays": 365,
  "gtin": "12345678901234",
  "eanCode": "8901234567890",
  "unitPrice": 120.5,
  "priceCurrencyCode": "INR",
  "partnerNo": "VNR000001",
  "block": false,
  "status": "Created",
  "rejectionReason": null
}`,
  "PUT|/api/vendor/item/:id": `{
  "batchNo": "BATCH-1001",
  "itemName": "Organic Rice Updated",
  "description": "Premium grade updated",
  "itemCategoryCode": "FOOD",
  "baseUnitOfMeasure": "KG",
  "netWeight": 24,
  "grossWeight": 25,
  "specifications": "Long grain polished",
  "ingredients": "Rice",
  "allergenDeclaration": "None",
  "shelfLifeDays": 300,
  "gtin": "12345678901234",
  "eanCode": "8901234567890",
  "unitPrice": 125,
  "priceCurrencyCode": "INR",
  "partnerNo": "VNR000001",
  "block": false,
  "status": "Created",
  "rejectionReason": null
}`,
  "PATCH|/api/vendor/item/:id/status": `{
  "status": "Approved",
  "rejectionReason": null
}`,
  "PATCH|/api/vendor/item/:id/block": `{
  "block": false
}`,

  // Contacts
  "POST|/api/contact": `{
  "contactNo": "CONT0001",
  "contactName": "John Doe",
  "eMail": "john@example.com",
  "phoneNo": "+911234567890",
  "mobilePhoneNo": "+919876543210",
  "companyNo": "COMP0001",
  "companyName": "Nova Soft",
  "portalUser": true,
  "portalAdmin": false,
  "partnerType": "customer",
  "partnerNo": "CUS000001",
  "shipToCode": "SHIP001",
  "vendorLocationCode": "VLOC001",
  "locationCode": "LOC001",
  "address": "Address line 1",
  "address2": "Address line 2",
  "city": "Bengaluru",
  "postCode": "560001",
  "countryRegionCode": "IN",
  "jobTitle": "Manager",
  "languageCode": "EN",
  "syncStatus": "Pending",
  "lastSyncedDateTime": null
}`,
  "PUT|/api/contact/:id": `{
  "contactNo": "CONT0001",
  "contactName": "John Doe Updated",
  "eMail": "john.updated@example.com",
  "phoneNo": "+911234567890",
  "mobilePhoneNo": "+919876543210",
  "companyNo": "COMP0001",
  "companyName": "Nova Soft",
  "portalUser": true,
  "portalAdmin": true,
  "partnerType": "customer",
  "partnerNo": "CUS000001",
  "shipToCode": "SHIP001",
  "vendorLocationCode": "VLOC001",
  "locationCode": "LOC001",
  "address": "Address line 1",
  "address2": "Address line 2",
  "city": "Mumbai",
  "postCode": "400001",
  "countryRegionCode": "IN",
  "jobTitle": "Senior Manager",
  "languageCode": "EN",
  "syncStatus": "Pending",
  "lastSyncedDateTime": null
}`,
  "PATCH|/api/contact/:id/sync": `{
  "syncStatus": "Synced"
}`,
  "PATCH|/api/contact/:id/portal": `{
  "portalUser": true,
  "portalAdmin": false
}`,

  // Purchase Orders
  "POST|/api/purchase-orders": `{
  "orderType": "PO",
  "partnerNo": "VNR000001",
  "partnerType": "vendor",
  "shipToCode": "SHIP001",
  "locationCode": "LOC001",
  "orderDate": "2026-03-22",
  "requestedDeliveryDate": "2026-03-30",
  "currencyCode": "INR",
  "externalDocumentNo": "EXT-PO-1001",
  "status": "Processed",
  "direction": "Inbound",
  "submittedDate": "2026-03-22",
  "orderStagingLines": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM001",
      "description": "Item 1",
      "quantity": 10,
      "unitOfMeasureCode": "PCS",
      "unitPrice": 100,
      "lineDiscountPercent": 5,
      "lineDiscountAmount": 50,
      "lineAmount": 950,
      "locationCode": "LOC001",
      "deliveryDate": "2026-03-30",
      "variantCode": "BLUE"
    }
  ]
}`,
  "POST|/api/purchase-orders/businesscentral": `{
  "orderType": "PO",
  "partnerNo": "VNR000001",
  "partnerType": "vendor",
  "shipToCode": "SHIP001",
  "locationCode": "LOC001",
  "orderDate": "2026-03-22",
  "requestedDeliveryDate": "2026-03-30",
  "currencyCode": "INR",
  "externalDocumentNo": "EXT-PO-1001",
  "status": "Processed",
  "direction": "Inbound",
  "submittedDate": "2026-03-22",
  "orderStagingLines": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM001",
      "description": "Item 1",
      "quantity": 10,
      "unitOfMeasureCode": "PCS",
      "unitPrice": 100,
      "lineDiscountPercent": 5,
      "lineDiscountAmount": 50,
      "lineAmount": 950,
      "locationCode": "LOC001",
      "deliveryDate": "2026-03-30",
      "variantCode": "BLUE"
    }
  ]
}`,
  "PUT|/api/purchase-orders/:id": `{
  "orderType": "PO",
  "partnerNo": "VNR000001",
  "partnerType": "vendor",
  "shipToCode": "SHIP001",
  "locationCode": "LOC002",
  "orderDate": "2026-03-22",
  "requestedDeliveryDate": "2026-04-02",
  "currencyCode": "INR",
  "externalDocumentNo": "EXT-PO-1001-REV1",
  "status": "Processed",
  "direction": "Inbound",
  "submittedDate": "2026-03-22",
  "orderStagingLines": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM001",
      "description": "Item 1 Updated",
      "quantity": 12,
      "unitOfMeasureCode": "PCS",
      "unitPrice": 100,
      "lineDiscountPercent": 5,
      "lineDiscountAmount": 60,
      "lineAmount": 1140,
      "locationCode": "LOC002",
      "deliveryDate": "2026-04-02",
      "variantCode": "BLUE"
    }
  ]
}`,
  "PATCH|/api/purchase-orders/:id/status": `{
  "status": "Approved"
}`,

  // Sales Orders
  "POST|/api/sales-orders": `{
  "orderType": "SO",
  "partnerNo": "CUS000001",
  "partnerType": "customer",
  "shipToCode": "SHIP001",
  "locationCode": "LOC001",
  "orderDate": "2026-03-22",
  "requestedDeliveryDate": "2026-03-29",
  "currencyCode": "INR",
  "externalDocumentNo": "EXT-SO-1001",
  "status": "Processed",
  "direction": "Outbound",
  "submittedDate": "2026-03-22",
  "orderStagingLines": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM001",
      "description": "Sales Item",
      "quantity": 5,
      "unitOfMeasureCode": "PCS",
      "unitPrice": 150,
      "lineDiscountPercent": 0,
      "lineDiscountAmount": 0,
      "lineAmount": 750,
      "locationCode": "LOC001",
      "deliveryDate": "2026-03-29",
      "variantCode": "STD"
    }
  ]
}`,
  "POST|/api/sales-orders/businesscentral": `{
  "orderType": "SO",
  "partnerNo": "CUS000001",
  "partnerType": "customer",
  "shipToCode": "SHIP001",
  "locationCode": "LOC001",
  "orderDate": "2026-03-22",
  "requestedDeliveryDate": "2026-03-29",
  "currencyCode": "INR",
  "externalDocumentNo": "EXT-SO-1001",
  "status": "Processed",
  "direction": "Outbound",
  "submittedDate": "2026-03-22",
  "orderStagingLines": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM001",
      "description": "Sales Item",
      "quantity": 5,
      "unitOfMeasureCode": "PCS",
      "unitPrice": 150,
      "lineDiscountPercent": 0,
      "lineDiscountAmount": 0,
      "lineAmount": 750,
      "locationCode": "LOC001",
      "deliveryDate": "2026-03-29",
      "variantCode": "STD"
    }
  ]
}`,
  "PUT|/api/sales-orders/:id": `{
  "orderType": "SO",
  "partnerNo": "CUS000001",
  "partnerType": "customer",
  "shipToCode": "SHIP001",
  "locationCode": "LOC002",
  "orderDate": "2026-03-22",
  "requestedDeliveryDate": "2026-04-01",
  "currencyCode": "INR",
  "externalDocumentNo": "EXT-SO-1001-REV1",
  "status": "Processed",
  "direction": "Outbound",
  "submittedDate": "2026-03-22",
  "orderStagingLines": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM001",
      "description": "Sales Item Updated",
      "quantity": 7,
      "unitOfMeasureCode": "PCS",
      "unitPrice": 150,
      "lineDiscountPercent": 2,
      "lineDiscountAmount": 21,
      "lineAmount": 1029,
      "locationCode": "LOC002",
      "deliveryDate": "2026-04-01",
      "variantCode": "STD"
    }
  ]
}`,
  "PATCH|/api/sales-orders/:id/status": `{
  "status": "Approved"
}`,

  // Invoices
  "POST|/api/invoices": `{
  "invoiceType": "Sales",
  "invoiceNo": "INV-1001",
  "invoiceDate": "2026-03-22",
  "dueDate": "2026-04-21",
  "partnerNo": "CUS000001",
  "partnerType": "customer",
  "totalAmount": 1000,
  "currencyCode": "INR",
  "outstandingAmount": 1000,
  "status": "Pending",
  "bcInvoiceNo": "BC-INV-1001",
  "linkedOrderNo": "SO-1001",
  "portalInvoiceLine": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM001",
      "description": "Invoice line",
      "lineAmount": 1000,
      "lineDiscount": 0,
      "lineDiscountAmount": 0,
      "quantity": 10,
      "unitPrice": 100,
      "unitOfMeasureCode": "PCS",
      "vat": 18,
      "vatAmount": 180,
      "variantCode": "STD"
    }
  ]
}`,
  "POST|/api/invoices/businesscentral": `{
  "invoiceType": "Sales",
  "invoiceNo": "INV-1001",
  "invoiceDate": "2026-03-22",
  "dueDate": "2026-04-21",
  "partnerNo": "CUS000001",
  "partnerType": "customer",
  "totalAmount": 1000,
  "currencyCode": "INR",
  "outstandingAmount": 1000,
  "status": "Pending",
  "bcInvoiceNo": "BC-INV-1001",
  "linkedOrderNo": "SO-1001",
  "portalInvoiceLine": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM001",
      "description": "Invoice line",
      "lineAmount": 1000,
      "lineDiscount": 0,
      "lineDiscountAmount": 0,
      "quantity": 10,
      "unitPrice": 100,
      "unitOfMeasureCode": "PCS",
      "vat": 18,
      "vatAmount": 180,
      "variantCode": "STD"
    }
  ]
}`,
  "PUT|/api/invoices/:id": `{
  "invoiceType": "Sales",
  "invoiceNo": "INV-1001",
  "invoiceDate": "2026-03-22",
  "dueDate": "2026-04-25",
  "partnerNo": "CUS000001",
  "partnerType": "customer",
  "totalAmount": 1200,
  "currencyCode": "INR",
  "outstandingAmount": 1200,
  "status": "Pending",
  "bcInvoiceNo": "BC-INV-1001",
  "linkedOrderNo": "SO-1001",
  "portalInvoiceLine": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM001",
      "description": "Invoice line updated",
      "lineAmount": 1200,
      "lineDiscount": 0,
      "lineDiscountAmount": 0,
      "quantity": 12,
      "unitPrice": 100,
      "unitOfMeasureCode": "PCS",
      "vat": 18,
      "vatAmount": 216,
      "variantCode": "STD"
    }
  ]
}`,
  "PATCH|/api/invoices/:id/status": `{
  "status": "Paid"
}`,

  // Purchase Invoices
  "POST|/api/purchase-invoices": `{
  "invoiceType": "Purchase",
  "invoiceNo": "PINV-1001",
  "invoiceDate": "2026-03-22",
  "dueDate": "2026-04-21",
  "partnerNo": "VNR000001",
  "partnerType": "vendor",
  "totalAmount": 2000,
  "currencyCode": "INR",
  "outstandingAmount": 2000,
  "status": "Pending",
  "bcInvoiceNo": "BC-PINV-1001",
  "linkedOrderNo": "PO-1001",
  "portalInvoiceLine": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM002",
      "description": "Purchase line",
      "lineAmount": 2000,
      "lineDiscount": 0,
      "lineDiscountAmount": 0,
      "quantity": 20,
      "unitPrice": 100,
      "unitOfMeasureCode": "PCS",
      "vat": 18,
      "vatAmount": 360,
      "variantCode": "STD"
    }
  ]
}`,
  "POST|/api/purchase-invoices/businesscentral": `{
  "invoiceType": "Purchase",
  "invoiceNo": "PINV-1001",
  "invoiceDate": "2026-03-22",
  "dueDate": "2026-04-21",
  "partnerNo": "VNR000001",
  "partnerType": "vendor",
  "totalAmount": 2000,
  "currencyCode": "INR",
  "outstandingAmount": 2000,
  "status": "Pending",
  "bcInvoiceNo": "BC-PINV-1001",
  "linkedOrderNo": "PO-1001",
  "portalInvoiceLine": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM002",
      "description": "Purchase line",
      "lineAmount": 2000,
      "lineDiscount": 0,
      "lineDiscountAmount": 0,
      "quantity": 20,
      "unitPrice": 100,
      "unitOfMeasureCode": "PCS",
      "vat": 18,
      "vatAmount": 360,
      "variantCode": "STD"
    }
  ]
}`,
  "PUT|/api/purchase-invoices/:id": `{
  "invoiceType": "Purchase",
  "invoiceNo": "PINV-1001",
  "invoiceDate": "2026-03-22",
  "dueDate": "2026-04-25",
  "partnerNo": "VNR000001",
  "partnerType": "vendor",
  "totalAmount": 2100,
  "currencyCode": "INR",
  "outstandingAmount": 2100,
  "status": "Pending",
  "bcInvoiceNo": "BC-PINV-1001",
  "linkedOrderNo": "PO-1001",
  "portalInvoiceLine": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM002",
      "description": "Purchase line updated",
      "lineAmount": 2100,
      "lineDiscount": 0,
      "lineDiscountAmount": 0,
      "quantity": 21,
      "unitPrice": 100,
      "unitOfMeasureCode": "PCS",
      "vat": 18,
      "vatAmount": 378,
      "variantCode": "STD"
    }
  ]
}`,
  "PATCH|/api/purchase-invoices/:id/status": `{
  "status": "Paid"
}`,

  // Purchase Receipts
  "POST|/api/purchase-receipts": `{
  "deliveryType": "Receipt",
  "partnerNo": "VNR000001",
  "partnerType": "vendor",
  "linkedOrderNo": "PO-1001",
  "shipmentNo": "SHP-1001",
  "trackingNo": "TRK-1001",
  "carrierCode": "DHL",
  "shipmentDate": "2026-03-22",
  "expectedDeliveryDate": "2026-03-28",
  "locationCode": "LOC001",
  "shipToCode": "SHIP001",
  "status": "Processed",
  "direction": "Inbound",
  "bcDocumentNo": "BC-REC-1001",
  "deliveryStagingsLine": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM002",
      "description": "Receipt line",
      "expirationDate": "2027-03-22",
      "lotNo": "LOT001",
      "orderedQuantity": 20,
      "remainingQuantity": 0,
      "serialNo": "SER001",
      "shippedQuantity": 20,
      "unitOfMeasureCode": "PCS",
      "variantCode": "STD"
    }
  ]
}`,
  "POST|/api/purchase-receipts/businesscentral": `{
  "deliveryType": "Receipt",
  "partnerNo": "VNR000001",
  "partnerType": "vendor",
  "linkedOrderNo": "PO-1001",
  "shipmentNo": "SHP-1001",
  "trackingNo": "TRK-1001",
  "carrierCode": "DHL",
  "shipmentDate": "2026-03-22",
  "expectedDeliveryDate": "2026-03-28",
  "locationCode": "LOC001",
  "shipToCode": "SHIP001",
  "status": "Processed",
  "direction": "Inbound",
  "bcDocumentNo": "BC-REC-1001",
  "deliveryStagingsLine": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM002",
      "description": "Receipt line",
      "expirationDate": "2027-03-22",
      "lotNo": "LOT001",
      "orderedQuantity": 20,
      "remainingQuantity": 0,
      "serialNo": "SER001",
      "shippedQuantity": 20,
      "unitOfMeasureCode": "PCS",
      "variantCode": "STD"
    }
  ]
}`,
  "PUT|/api/purchase-receipts/:id": `{
  "deliveryType": "Receipt",
  "partnerNo": "VNR000001",
  "partnerType": "vendor",
  "linkedOrderNo": "PO-1001",
  "shipmentNo": "SHP-1001",
  "trackingNo": "TRK-1001-REV1",
  "carrierCode": "DHL",
  "shipmentDate": "2026-03-22",
  "expectedDeliveryDate": "2026-03-30",
  "locationCode": "LOC002",
  "shipToCode": "SHIP001",
  "status": "Processed",
  "direction": "Inbound",
  "bcDocumentNo": "BC-REC-1001",
  "deliveryStagingsLine": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM002",
      "description": "Receipt line updated",
      "expirationDate": "2027-03-22",
      "lotNo": "LOT001",
      "orderedQuantity": 20,
      "remainingQuantity": 2,
      "serialNo": "SER001",
      "shippedQuantity": 18,
      "unitOfMeasureCode": "PCS",
      "variantCode": "STD"
    }
  ]
}`,
  "PATCH|/api/purchase-receipts/:id/status": `{
  "status": "Delivered"
}`,

  // Partner location links
  "POST|/api/partner-location-links": `{
  "partnerType": "vendor",
  "partnerNo": "VNR000001",
  "description": "Main Warehouse",
  "addressCode": "ADDR001",
  "addressName": "Warehouse A",
  "locationCode": "LOC001",
  "address": "Line 1",
  "address2": "Line 2",
  "city": "Bengaluru",
  "postCode": "560001",
  "countryRegionCode": "IN",
  "contact": "Warehouse Manager",
  "phoneNo": "+919999999000",
  "isDefault": true,
  "blocked": false
}`,
  "POST|/api/partner-location-links/businesscentral": `{
  "partnerType": "vendor",
  "partnerNo": "VNR000001",
  "description": "Main Warehouse",
  "addressCode": "ADDR001",
  "addressName": "Warehouse A",
  "locationCode": "LOC001",
  "address": "Line 1",
  "address2": "Line 2",
  "city": "Bengaluru",
  "postCode": "560001",
  "countryRegionCode": "IN",
  "contact": "Warehouse Manager",
  "phoneNo": "+919999999000",
  "isDefault": true,
  "blocked": false
}`,
  "PUT|/api/partner-location-links/:id": `{
  "partnerType": "vendor",
  "partnerNo": "VNR000001",
  "description": "Secondary Warehouse",
  "addressCode": "ADDR002",
  "addressName": "Warehouse B",
  "locationCode": "LOC002",
  "address": "Line 1",
  "address2": "Line 2",
  "city": "Mumbai",
  "postCode": "400001",
  "countryRegionCode": "IN",
  "contact": "Ops Manager",
  "phoneNo": "+919999999111",
  "isDefault": false,
  "blocked": false
}`,
  "PATCH|/api/partner-location-links/:id/block": `{
  "blocked": false
}`,
  "PATCH|/api/partner-location-links/:id/default": `{
  "isDefault": true
}`,
};

function appGraph() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.get("/", (req, res) => res.send("You are connected to partner server"));
  app.use("/api/auth", AuthRoutes);
  app.use("/api/users", UserRoutes);
  app.use("/api/vendor/item", ItemRoutes);
  app.use("/api/contact", ContactRoutes);
  app.use("/api/purchase-orders", PurchaseOrderRoutes);
  app.use("/api/sales-orders", SalesOrderRoutes);
  app.use("/api/invoices", InvoiceRoutes);
  app.use("/api/purchase-invoices", PurchaseInvoiceRoutes);
  app.use("/api/purchase-receipts", PurchaseReceiptRoutes);
  app.use("/api/partner-location-links", PartnerLocationLinkRoutes);
  app.get("/api/routes", (req, res) => res.json(listEndpoints(app)));
  return app;
}

function urlParts(routePath) {
  if (routePath === "/") {
    return { raw: "{{baseUrl}}/", host: ["{{baseUrl}}"], path: [""] };
  }
  const parts = routePath.split("/").filter(Boolean);
  return {
    raw: `{{baseUrl}}${routePath}`,
    host: ["{{baseUrl}}"],
    path: parts,
  };
}

function isProtectRegister(method, routePath) {
  return (
    (method === "POST" && routePath === "/api/users/register") ||
    (method === "POST" && routePath.endsWith("/businesscentral"))
  );
}

function needsBearer(method, routePath) {
  // Routes where token is supplied directly by middleware itself:
  const publicNoBearer = new Set([
    "POST|/api/auth/get-register-token",
    "POST|/api/users/register", // protectRegister uses x-register-token
    // businesscentral uses x-register-token too
  ]);
  if (publicNoBearer.has(`${method}|${routePath}`)) return false;

  if (isProtectRegister(method, routePath)) return false;

  // /api/routes and "/" are not protected.
  if ((method === "GET" && (routePath === "/" || routePath === "/api/routes"))) {
    return false;
  }

  // Everything else that is not protectRegister is expected to use Bearer token
  // (either via middleware `protect` or via handler reading req.headers.authorization).
  return true;
}

function folderFor(routePath) {
  if (routePath === "/" || routePath === "/api/routes") return "Health";
  if (routePath.startsWith("/api/auth")) return "Auth";
  if (routePath.startsWith("/api/users")) return "Users";
  if (routePath.startsWith("/api/vendor/item")) return "Items";
  if (routePath.startsWith("/api/contact")) return "Contacts";
  if (routePath.startsWith("/api/purchase-orders")) return "Purchase Orders";
  if (routePath.startsWith("/api/sales-orders")) return "Sales Orders";
  if (routePath.startsWith("/api/invoices")) return "Invoices";
  if (routePath.startsWith("/api/purchase-invoices")) return "Purchase Invoices";
  if (routePath.startsWith("/api/purchase-receipts")) return "Purchase Receipts";
  if (routePath.startsWith("/api/partner-location-links")) return "Partner Location Links";
  return "Other";
}

function nameFor(method, routePath) {
  const tag = routePath.includes("/businesscentral") ? "BC" : "";
  const display = routePath.replace(/^\/api\//, "").replace(/^\/+/, "");
  return `${method} ${display}${tag ? ` (${tag})` : ""}`;
}

function buildRequest(method, routePath) {
  const url = urlParts(routePath);
  const headers = [];
  const key = `${method}|${routePath}`;
  const bodyRaw = PAYLOADS[key] || null;

  if (isProtectRegister(method, routePath)) {
    headers.push({ key: "x-register-token", value: "{{registerToken}}" });
  }
  if (bodyRaw) {
    headers.push({ key: "Content-Type", value: "application/json" });
  }

  const request = {
    method,
    header: headers,
    url: {
      raw: url.raw,
      host: url.host,
      path: url.path,
    },
  };

  if (bodyRaw) {
    request.body = { mode: "raw", raw: bodyRaw };
  }

  if (needsBearer(method, routePath)) {
    request.auth = {
      type: "bearer",
      bearer: [{ key: "token", value: "{{token}}", type: "string" }],
    };
  }

  return {
    name: nameFor(method, routePath),
    request,
  };
}

function main() {
  const app = appGraph();
  const endpoints = listEndpoints(app);

  const folders = {};
  for (const ep of endpoints) {
    const folder = folderFor(ep.path);
    if (!folders[folder]) folders[folder] = [];
    for (const method of ep.methods) {
      folders[folder].push(buildRequest(method, ep.path));
    }
  }

  const folderOrder = [
    "Health",
    "Auth",
    "Users",
    "Items",
    "Contacts",
    "Purchase Orders",
    "Sales Orders",
    "Invoices",
    "Purchase Invoices",
    "Purchase Receipts",
    "Partner Location Links",
    "Other",
  ];

  const item = folderOrder
    .filter((f) => folders[f] && folders[f].length > 0)
    .map((f) => ({ name: f, item: folders[f] }));

  const collection = {
    info: {
      name: "PartnerPortal API",
      description:
        "Auto-generated from Express routes. Re-run when routes/controllers change.",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      _postman_id: "a6f39f8a-0e26-4c5a-904e-6c739ff67d2d",
    },
    variable: [
      { key: "baseUrl", value: "http://localhost:3000" },
      { key: "token", value: "" },
      { key: "registerToken", value: "" },
    ],
    item,
  };

  const outPath = path.join(__dirname, "..", "PartnerPortal.postman_collection.json");
  fs.writeFileSync(outPath, JSON.stringify(collection, null, 2) + "\n", "utf8");
  console.log(`Wrote ${outPath}`);
}

main();

