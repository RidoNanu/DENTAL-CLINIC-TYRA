/**
 * Dashboard Controller
 * 
 * Handles admin dashboard statistics and analytics
 */

const supabase = require('../lib/supabaseClient');

/**
 * Get dashboard statistics
 * GET /api/v1/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
    try {
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get yesterday's date for comparison
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Get month start
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        // Get last month start
        const lastMonthStart = new Date(monthStart);
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

        // Run all queries in parallel for better performance
        const [
            todayResult,
            yesterdayResult,
            pendingResult,
            newPendingResult,
            patientResult,
            monthlyNewPatientsResult,
            revenueResult,
            lastMonthRevenueResult,
            pendingAppointmentsResult
        ] = await Promise.all([
            // 1. Today's Morning Shift Count
            supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .gte('appointment_at', today.toISOString())
                .lt('appointment_at', tomorrow.toISOString())
                .eq('shift', 'morning')
                .neq('status', 'cancelled'),

            // 2. Today's Evening Shift Count
            supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .gte('appointment_at', today.toISOString())
                .lt('appointment_at', tomorrow.toISOString())
                .eq('shift', 'evening')
                .neq('status', 'cancelled'),

            // 3. Pending Requests Count
            supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending'),

            // 4. New pending (created today)
            supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')
                .gte('created_at', today.toISOString()),

            // 5. Total Patients Count
            supabase
                .from('patients')
                .select('*', { count: 'exact', head: true }),

            // 6. Monthly new patients
            supabase
                .from('patients')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', monthStart.toISOString()),

            // 7. Monthly Revenue
            supabase
                .from('appointments')
                .select(`
                    id,
                    service:service_id (
                        price
                    )
                `)
                .in('status', ['confirmed', 'completed'])
                .gte('appointment_at', monthStart.toISOString()),

            // 8. Last month's revenue
            supabase
                .from('appointments')
                .select(`
                    id,
                    service:service_id (
                        price
                    )
                `)
                .in('status', ['confirmed', 'completed'])
                .gte('appointment_at', lastMonthStart.toISOString())
                .lt('appointment_at', monthStart.toISOString()),

            // 9. Pending Appointments List
            supabase
                .from('appointments')
                .select(`
                    id,
                    appointment_at,
                    status,
                    notes,
                    shift,
                    patient:patient_id (
                        name
                    ),
                    service:service_id (
                        name
                    )
                `)
                .eq('status', 'pending')
                .order('appointment_at', { ascending: true })
                .limit(5)
        ]);

        // Check for errors
        if (todayResult.error) throw todayResult.error;
        if (pendingResult.error) throw pendingResult.error;
        if (patientResult.error) throw patientResult.error;
        if (revenueResult.error) throw revenueResult.error;
        if (pendingAppointmentsResult.error) throw pendingAppointmentsResult.error;

        // Extract counts
        const morningCount = todayResult.count || 0;
        const eveningCount = yesterdayResult.count || 0; // reusing variable slot strictly for mapped results
        const pendingCount = pendingResult.count || 0;
        const newPendingCount = newPendingResult.count || 0;

        // Count for "Total Patients" card should act as "Total Appointments Today" based on user feedback
        const patientCount = morningCount + eveningCount;

        const monthlyNewPatients = monthlyNewPatientsResult.count || 0;



        // Calculate revenue
        const revenue = (revenueResult.data || []).reduce((sum, apt) => {
            return sum + (apt.service?.price || 0);
        }, 0);

        const lastMonthRevenue = (lastMonthRevenueResult.data || []).reduce((sum, apt) => {
            return sum + (apt.service?.price || 0);
        }, 0);

        // Format revenue
        const formattedRevenue = revenue >= 100000
            ? `₹${(revenue / 100000).toFixed(1)}L`
            : revenue >= 1000
                ? `₹${(revenue / 1000).toFixed(1)}K`
                : `₹${revenue}`;

        // Calculate revenue change
        let revenueChange = '+0%';
        if (lastMonthRevenue > 0) {
            const percentChange = ((revenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(0);
            revenueChange = percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`;
        }

        // Send response
        res.status(200).json({
            success: true,
            data: {
                morningShift: {
                    count: morningCount,
                    change: '' // Trend not needed for now or calc if needed
                },
                eveningShift: {
                    count: eveningCount,
                    change: ''
                },
                pendingRequests: {
                    count: pendingCount,
                    newCount: newPendingCount
                },
                totalPatients: {
                    count: patientCount,
                    monthlyNew: monthlyNewPatients
                },
                monthlyRevenue: {
                    amount: revenue,
                    formatted: formattedRevenue,
                    change: revenueChange
                },
                pendingAppointments: pendingAppointmentsResult.data || []
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats
};
