const { pool } = require("../config/db");

const itemCategories = ["FOOD", "BEVERAGE", "DAIRY", "BAKERY", "SNACKS"];
const baseUnits = ["KG", "LTR", "PCS", "BOX", "PKT"];
const currencies = ["USD", "EUR", "INR"];
const statuses = ["Created", "Submitted", "Approved"];
const partnerNumbers = ["VEN000001", "VEN000002", "VEN000003", "VEND-ADMIN-001", "VRG-000001", "VRG-000002"];

const itemNames = [
  "Organic Whole Wheat Flour", "Premium Basmati Rice", "Extra Virgin Olive Oil",
  "Raw Honey", "Almond Butter", "Coconut Milk", "Dark Chocolate Bar",
  "Green Tea Leaves", "Quinoa Seeds", "Chia Seeds", "Flax Seeds",
  "Peanut Butter", "Cashew Nuts", "Walnut Kernels", "Pistachio Nuts",
  "Dried Apricots", "Raisins", "Dates", "Prunes", "Cranberries",
  "Oats", "Cornflakes", "Muesli", "Granola", "Protein Powder",
  "Soy Milk", "Almond Milk", "Greek Yogurt", "Cheddar Cheese", "Mozzarella",
  "Butter", "Cream Cheese", "Cottage Cheese", "Paneer", "Ghee",
  "Pasta", "Noodles", "Spaghetti", "Macaroni", "Vermicelli",
  "Tomato Sauce", "Soy Sauce", "Chili Sauce", "Mayonnaise", "Ketchup",
  "Mustard", "Vinegar", "Pickle", "Jam", "Marmalade",
  "Coffee Beans", "Instant Coffee", "Cocoa Powder", "Drinking Chocolate",
  "Orange Juice", "Apple Juice", "Grape Juice", "Mango Juice",
  "Energy Drink", "Sports Drink", "Mineral Water", "Sparkling Water",
  "Cookies", "Biscuits", "Crackers", "Wafers", "Cake",
  "Bread", "Buns", "Croissant", "Muffin", "Donut",
  "Potato Chips", "Popcorn", "Nachos", "Pretzels", "Trail Mix",
  "Candy", "Chocolate", "Gummy Bears", "Lollipop", "Toffee",
  "Ice Cream", "Frozen Yogurt", "Sorbet", "Popsicle",
  "Pizza Base", "Burger Buns", "Hot Dog Buns", "Tortilla Wraps",
  "Salsa", "Guacamole", "Hummus", "Tahini", "Pesto",
  "Maple Syrup", "Agave Nectar", "Brown Sugar", "White Sugar",
  "Salt", "Black Pepper", "Turmeric", "Cumin", "Coriander"
];

const descriptions = [
  "Premium quality product", "Fresh and organic", "Naturally sourced",
  "High quality ingredients", "Certified organic", "Farm fresh",
  "Handpicked selection", "Artisan crafted", "Traditional recipe",
  "Gourmet quality"
];

const specifications = [
  "100% natural, no additives", "Gluten-free certified", "Non-GMO verified",
  "Vegan friendly", "Sugar-free", "Low sodium", "High protein",
  "Rich in fiber", "Contains antioxidants", "Preservative-free"
];

const allergens = [
  "Contains gluten", "Contains nuts", "Contains dairy", "Contains soy",
  "May contain traces of nuts", "Gluten-free", "Nut-free", "Dairy-free",
  "Allergen-free", "Contains eggs"
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedItems() {
  try {
    console.log("🌱 Starting to seed 100 items...");

    for (let i = 1; i <= 100; i++) {
      const itemData = {
        batchNo: `BATCH-2024-${String(i).padStart(4, '0')}`,
        itemName: getRandomElement(itemNames),
        description: getRandomElement(descriptions),
        itemCategoryCode: getRandomElement(itemCategories),
        baseUnitOfMeasure: getRandomElement(baseUnits),
        netWeight: getRandomNumber(1, 100),
        grossWeight: getRandomNumber(1.5, 105),
        specifications: getRandomElement(specifications),
        ingredients: `${getRandomElement(itemNames)} ingredients`,
        allergenDeclaration: getRandomElement(allergens),
        shelfLifeDays: getRandomInt(30, 365),
        gtin: `${getRandomInt(1000000000000, 9999999999999)}`,
        eanCode: `${getRandomInt(1000000000000, 9999999999999)}`,
        unitPrice: getRandomNumber(10, 500),
        priceCurrencyCode: getRandomElement(currencies),
        partnerNo: getRandomElement(partnerNumbers),
        block: Math.random() > 0.9,
        status: getRandomElement(statuses),
        rejectionReason: null,
        createdBy: null
      };

      const query = `
        INSERT INTO item_requests (
          batch_no, item_name, description, item_category_code,
          base_unit_of_measure, net_weight, gross_weight, specifications,
          ingredients, allergen_declaration, shelf_life_days, gtin,
          ean_code, unit_price, price_currency_code, partner_no,
          block, status, rejection_reason, created_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
        )
      `;

      const values = [
        itemData.batchNo,
        itemData.itemName,
        itemData.description,
        itemData.itemCategoryCode,
        itemData.baseUnitOfMeasure,
        itemData.netWeight,
        itemData.grossWeight,
        itemData.specifications,
        itemData.ingredients,
        itemData.allergenDeclaration,
        itemData.shelfLifeDays,
        itemData.gtin,
        itemData.eanCode,
        itemData.unitPrice,
        itemData.priceCurrencyCode,
        itemData.partnerNo,
        itemData.block,
        itemData.status,
        itemData.rejectionReason,
        itemData.createdBy
      ];

      await pool.query(query, values);
      console.log(`✅ Seeded item ${i}/100: ${itemData.itemName}`);
    }

    console.log("\n🎉 Successfully seeded 100 items!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding items:", error.message);
    process.exit(1);
  }
}

seedItems();
