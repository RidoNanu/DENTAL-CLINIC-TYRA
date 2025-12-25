/**
 * Check availability for a date range
 * GET /api/v1/public/availability?start=YYYY-MM-DD&end=YYYY-MM-DD&service_id=uuid
 */
const getDateAvailability = async (req, res, next) => {
    try {
        const { start, end, service_id } = req.query;

        if (!start || !end || !service_id) {
            return res.status(400).json({
                success: false,
                message: 'start, end, and service_id query parameters are required'
            });
        }

        // Get service to determine duration
        const service = await serviceService.getById(service_id);
        const duration = service?.duration || 30;

        // Fetch all appointments in the date range (query in IST)
        const startDateTime = `${start}T00:00:00+05:30`;
        const endDateTime = `${end}T23:59:59+05:30`;

        const appointments = await appointmentService.getByDateRange(startDateTime, endDateTime);

        // Generate all possible time slots (9 AM - 6 PM, 30-min intervals)
        const allSlots = generateTimeSlots();

        // Group appointments by IST date
        const appointmentsByDate = {};
        appointments.forEach(apt => {
            const aptStart = new Date(apt.appointment_at);
            // Convert to IST and extract date (YYYY-MM-DD)
            const istDate = aptStart.toLocaleString('en-CA', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).split(',')[0];

            if (!appointmentsByDate[istDate]) {
                appointmentsByDate[istDate] = [];
            }
            appointmentsByDate[istDate].push(apt);
        });

        // Build result for each date in range
        const result = {};

        // Parse dates as local dates (no timezone conversion)
        let [y, m, d] = start.split('-').map(Number);
        const currentDate = new Date(y, m - 1, d);

        [y, m, d] = end.split('-').map(Number);
        const lastDate = new Date(y, m - 1, d);

        while (currentDate <= lastDate) {
            // Format as YYYY-MM-DD
            const dateStr = currentDate.toISOString().split('T')[0];

            const dateAppointments = appointmentsByDate[dateStr] || [];

            // Find booked slots for this date
            const bookedSlotsSet = new Set();

            dateAppointments.forEach(apt => {
                const aptStart = new Date(apt.appointment_at);
                const aptEnd = new Date(apt.end_time);

                allSlots.forEach(slot => {
                    // Create Date object for slot in IST  
                    const slotStart = new Date(`${dateStr}T${slot}:00+05:30`);
                    const slotEnd = new Date(slotStart.getTime() + duration * 60000);

                    // Check overlap
                    if (slotStart < aptEnd && slotEnd > aptStart) {
                        bookedSlotsSet.add(slot);
                    }
                });
            });

            const bookedSlots = Array.from(bookedSlotsSet);
            const availableSlots = allSlots.filter(s => !bookedSlots.includes(s));

            result[dateStr] = {
                is_fully_booked: availableSlots.length === 0,
                booked_slots: bookedSlots,
                available_slots: availableSlots
            };

            // Next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[PUBLIC] Error checking availability:', error.message);
        next(error);
    }
};
