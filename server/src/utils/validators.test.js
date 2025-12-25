/**
 * Test script for validators
 * Run with: node src/utils/validators.test.js
 */

const {
    validateUUID,
    validateEmail,
    validatePhone,
    validateRequired,
    validateTimestamp,
    validateEnum,
    validatePositiveNumber,
} = require('./validators');

console.log('Testing validators...\n');

// Test UUID validation
console.log('✓ UUID Validation:');
try {
    validateUUID('123e4567-e89b-42d3-a456-426614174000', 'test_id');
    console.log('  ✓ Valid UUID passed');
} catch (e) {
    console.log('  ✗ FAILED:', e.message);
}

try {
    validateUUID('invalid-uuid', 'test_id');
    console.log('  ✗ FAILED: Should have rejected invalid UUID');
} catch (e) {
    console.log('  ✓ Invalid UUID rejected:', e.message);
}

// Test email validation
console.log('\n✓ Email Validation:');
try {
    validateEmail('test@example.com');
    console.log('  ✓ Valid email passed');
} catch (e) {
    console.log('  ✗ FAILED:', e.message);
}

try {
    validateEmail('invalid.email');
    console.log('  ✗ FAILED: Should have rejected invalid email');
} catch (e) {
    console.log('  ✓ Invalid email rejected:', e.message);
}

// Test phone validation
console.log('\n✓ Phone Validation:');
try {
    validatePhone('1234567890');
    console.log('  ✓ Valid phone (10 digits) passed');
} catch (e) {
    console.log('  ✗ FAILED:', e.message);
}

try {
    validatePhone('123456789012345');
    console.log('  ✓ Valid phone (15 digits) passed');
} catch (e) {
    console.log('  ✗ FAILED:', e.message);
}

try {
    validatePhone('123');
    console.log('  ✗ FAILED: Should have rejected short phone');
} catch (e) {
    console.log('  ✓ Short phone rejected:', e.message);
}

// Test timestamp validation
console.log('\n✓ Timestamp Validation:');
try {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    validateTimestamp(futureDate, true);
    console.log('  ✓ Future timestamp passed');
} catch (e) {
    console.log('  ✗ FAILED:', e.message);
}

try {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    validateTimestamp(pastDate, true);
    console.log('  ✗ FAILED: Should have rejected past date');
} catch (e) {
    console.log('  ✓ Past timestamp rejected:', e.message);
}

// Test enum validation
console.log('\n✓ Enum Validation:');
try {
    validateEnum('male', ['male', 'female', 'other'], 'Gender');
    console.log('  ✓ Valid enum value passed');
} catch (e) {
    console.log('  ✗ FAILED:', e.message);
}

try {
    validateEnum('invalid', ['male', 'female', 'other'], 'Gender');
    console.log('  ✗ FAILED: Should have rejected invalid enum');
} catch (e) {
    console.log('  ✓ Invalid enum rejected:', e.message);
}

// Test positive number validation
console.log('\n✓ Positive Number Validation:');
try {
    validatePositiveNumber(100, 'Price');
    console.log('  ✓ Valid positive number passed');
} catch (e) {
    console.log('  ✗ FAILED:', e.message);
}

try {
    validatePositiveNumber(-5, 'Price');
    console.log('  ✗ FAILED: Should have rejected negative number');
} catch (e) {
    console.log('  ✓ Negative number rejected:', e.message);
}

console.log('\n✅ All validator tests completed!\n');
