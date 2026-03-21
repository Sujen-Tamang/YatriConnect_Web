import Bus from '../../models/Bus.js';
import Booking from '../../models/Booking.js';
import { User } from '../../models/userModel.js';

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
};

// GET /api/v1/admin/dashboard/stats
export const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(new Date(now).setHours(0, 0, 0, 0));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const totalUsers = await User.countDocuments();
        const lastMonthUsers = await User.countDocuments({
            createdAt: { $lte: endOfLastMonth },
        });
        const totalUsersChange = calculatePercentageChange(totalUsers, lastMonthUsers);

        // Map 'active' to the Boolean field 'active' in Bus model
        const activeBusesCount = await Bus.countDocuments({ active: true });
        const lastMonthActiveBuses = await Bus.countDocuments({
            active: true,
            createdAt: { $lte: endOfLastMonth },
        });
        const activeBusesChange = calculatePercentageChange(activeBusesCount, lastMonthActiveBuses);

        const bookingsToday = await Booking.countDocuments({
            createdAt: { $gte: startOfToday },
        });
        
        // Calculate bookings on same day last month for comparison
        const sameDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const startOfSameDayLastMonth = new Date(new Date(sameDayLastMonth).setHours(0, 0, 0, 0));
        const endOfSameDayLastMonth = new Date(new Date(sameDayLastMonth).setHours(23, 59, 59, 999));
        
        const lastMonthBookingsToday = await Booking.countDocuments({
            createdAt: {
                $gte: startOfSameDayLastMonth,
                $lte: endOfSameDayLastMonth,
            },
        });
        const bookingsTodayChange = calculatePercentageChange(bookingsToday, lastMonthBookingsToday);

        // Revenue aggregation with correct field: totalPrice
        const revenueMTDResult = await Booking.aggregate([
            { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);
        const revenueMTD = revenueMTDResult[0]?.total || 0;

        const lastMonthRevenueResult = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
                    status: { $ne: 'Cancelled' }
                },
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);
        const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;
        const revenueMTDChange = calculatePercentageChange(revenueMTD, lastMonthRevenue);

        const stats = {
            totalUsers,
            totalUsersChange,
            activeBuses: activeBusesCount,
            activeBusesChange,
            bookingsToday,
            bookingsTodayChange,
            revenueMTD,
            revenueMTDChange,
        };

        res.status(200).json({
            success: true,
            data: stats,
            message: 'Stats fetched successfully',
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching dashboard stats',
        });
    }
};

// GET /api/v1/admin/dashboard/bookings/recent
export const getRecentBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name')
            .populate('bus', 'route')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const formattedBookings = bookings.map((booking) => ({
            id: booking.bookingId || booking._id.toString(),
            customer: booking.user?.name || "Unknown",
            route: booking.bus?.route ? `${booking.bus.route.from} ➔ ${booking.bus.route.to}` : "N/A",
            date: booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : "N/A",
            status: booking.status,
            amount: booking.totalPrice || 0,
        }));

        res.status(200).json({
            success: true,
            data: formattedBookings,
            message: 'Recent bookings fetched successfully',
        });
    } catch (error) {
        console.error('Error fetching recent bookings:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching recent bookings',
        });
    }
};

// GET /api/v1/admin/dashboard/routes/popular
export const getPopularRoutes = async (req, res) => {
    try {
        // Aggregate bookings grouped by bus, then lookup bus to get route
        const popular = await Booking.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: '$bus',
                    revenue: { $sum: '$totalPrice' },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'buses', // Mongoose model 'Bus' usually becomes 'buses' in MongoDB
                    localField: '_id',
                    foreignField: '_id',
                    as: 'busDetails'
                }
            },
            { $unwind: '$busDetails' },
            {
                $project: {
                    route: { 
                        $concat: ['$busDetails.route.from', ' ➔ ', '$busDetails.route.to'] 
                    },
                    revenue: 1
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 4 }
        ]);

        res.status(200).json({
            success: true,
            data: popular,
            message: 'Popular routes fetched successfully',
        });
    } catch (error) {
        console.error('Error fetching popular routes:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching popular routes',
        });
    }
};