const seedTamilNaduColleges = require("./seeds/tnCollegesSeed");

if (require.main === module) {
  seedTamilNaduColleges()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seeding Error:", err);
      process.exit(1);
    });
}

module.exports = seedTamilNaduColleges;
