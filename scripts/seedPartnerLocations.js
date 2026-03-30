const { pool } = require("../config/db");

const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"];
const countries = ["US", "CA", "UK", "AU", "DE"];
const contacts = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "David Brown", "Emily Davis", "Chris Wilson", "Lisa Anderson", "Tom Martinez", "Anna Taylor"];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedPartnerLocations() {
  try {
    console.log("🌱 Starting to seed 50 partner locations...");

    for (let i = 1; i <= 50; i++) {
      const locationData = {
        locationCode: `LOC-${String(i).padStart(4, '0')}`,
        description: `Location ${i} - ${getRandomElement(cities)}`,
        addressName: `${getRandomElement(["Warehouse", "Distribution Center", "Office", "Store", "Facility"])} ${i}`,
        address: `${getRandomInt(100, 9999)} ${getRandomElement(["Main St", "Oak Ave", "Park Blvd", "Industrial Rd", "Commerce Dr"])}`,
        address2: getRandomInt(1, 10) > 7 ? `Suite ${getRandomInt(100, 999)}` : null,
        city: getRandomElement(cities),
        postCode: `${getRandomInt(10000, 99999)}`,
        countryRegionCode: getRandomElement(countries),
        contact: getRandomElement(contacts),
        phoneNo: `+1-${getRandomInt(200, 999)}-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
        isDefault: i === 1, // First location is default
        blocked: Math.random() > 0.9
      };

      const query = `
        INSERT INTO partner_location_links (
          location_code, description, address_name, address, address2,
          city, post_code, country_region_code, contact, phone_no,
          is_default, blocked, created_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
        )
      `;

      const values = [
        locationData.locationCode,
        locationData.description,
        locationData.addressName,
        locationData.address,
        locationData.address2,
        locationData.city,
        locationData.postCode,
        locationData.countryRegionCode,
        locationData.contact,
        locationData.phoneNo,
        locationData.isDefault,
        locationData.blocked,
        null
      ];

      await pool.query(query, values);
      console.log(`✅ Seeded location ${i}/50: ${locationData.locationCode} - ${locationData.city}`);
    }

    console.log("\n🎉 Successfully seeded 50 partner locations!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding partner locations:", error.message);
    process.exit(1);
  }
}

seedPartnerLocations();
