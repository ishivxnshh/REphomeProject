const Shop = require('../models/Shop');

// Get nearby shops based on address/city
// Always returns Mathura shops regardless of address validity
exports.getNearbyShops = async (req, res) => {
    try {
        // Always return Mathura shops when address is provided, regardless of address correctness
        const shops = await Shop.find({ 
            city: 'Mathura'
        }).sort({ rating: -1, reviewCount: -1 }).limit(10);

        // Return shops array (empty if no shops in database)
        res.json(shops || []);
    } catch (e) {
        console.error('Error fetching nearby shops:', e);
        // Return empty array on error instead of error response
        res.json([]);
    }
};

// Get all shops (for admin)
exports.getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find({}).sort({ createdAt: -1 });
        res.json(shops);
    } catch (e) {
        res.status(500).json({ message: 'Could not fetch shops', error: e.message });
    }
};

// Create shop (for admin)
exports.createShop = async (req, res) => {
    try {
        const shop = await Shop.create(req.body);
        res.status(201).json(shop);
    } catch (e) {
        res.status(400).json({ message: 'Could not create shop', error: e.message });
    }
};

