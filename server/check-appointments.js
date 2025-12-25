/**
 * Quick script to check all appointments including cancelled ones
 */
const supabase = require('./src/lib/supabaseClient');

async function checkAllAppointments() {
    // Get all appointments INCLUDING cancelled ones
    const { data: allAppointments, error } = await supabase
        .from('appointments')
        .select(`
            id,
            status,
            appointment_at,
            patients (name, email),
            services (name)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('\n=== ALL APPOINTMENTS (including cancelled) ===\n');
    console.log(`Total appointments: ${allAppointments.length}\n`);

    allAppointments.forEach((apt, index) => {
        console.log(`${index + 1}. Patient: ${apt.patients?.name || 'Unknown'}`);
        console.log(`   Service: ${apt.services?.name || 'N/A'}`);
        console.log(`   Status: ${apt.status}`);
        console.log(`   Date: ${apt.appointment_at}`);
        console.log('');
    });

    // Group by status
    const grouped = allAppointments.reduce((acc, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1;
        return acc;
    }, {});

    console.log('=== APPOINTMENTS BY STATUS ===');
    console.log(grouped);
}

checkAllAppointments()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
