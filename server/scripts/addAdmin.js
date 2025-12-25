#!/usr/bin/env node
/**
 * Add Admin Script
 * 
 * Interactive CLI tool to create new admin accounts.
 * No SQL required - just run this script!
 * 
 * Usage: node scripts/addAdmin.js
 */

const bcrypt = require('bcrypt');
const readline = require('readline');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function addAdmin() {
    console.log('\n🔐 Add New Admin Account\n');

    // Get email
    const email = await question('Enter admin email: ');
    if (!email || !email.includes('@')) {
        console.error('❌ Invalid email address');
        rl.close();
        process.exit(1);
    }

    // Get password
    const password = await question('Enter password: ');
    if (!password || password.length < 6) {
        console.error('❌ Password must be at least 6 characters');
        rl.close();
        process.exit(1);
    }

    console.log('\n⏳ Creating admin account...');

    try {
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert into database
        const { data, error } = await supabase
            .from('admins')
            .insert({
                email: email.toLowerCase(),
                password_hash: passwordHash
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                console.error('❌ Error: An admin with this email already exists');
            } else {
                console.error('❌ Error:', error.message);
            }
            rl.close();
            process.exit(1);
        }

        console.log('\n✅ Admin account created successfully!');
        console.log('\n📧 Email:', email);
        console.log('🔒 Password:', password);
        console.log('\nℹ️  Admin can now login at /admin/login\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }

    rl.close();
}

addAdmin();
