const bcrypt = require('bcryptjs');

// Get the hash from the database
const dbHash = '$2a$10$OC2ItIAc1ijpszg6D2KkkeawZ4vUB76zBVu28W1gHUM64O1Y5l/bO';

console.log('Full hash from DB:', dbHash);
console.log('Hash length:', dbHash.length);

// Test if it matches "password123"
const result = bcrypt.compareSync('password123', dbHash);
console.log('Compare with password123:', result);

// Generate a fresh hash to verify format
const newHash = bcrypt.hashSync('password123', 10);
console.log('New hash of password123:', newHash);
console.log('New hash length:', newHash.length);
console.log('New hash compare:', bcrypt.compareSync('password123', newHash));

console.log('Admin hash compare (duplicate):', bcrypt.compareSync('password123', dbHash));
