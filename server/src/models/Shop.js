const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        nameHindi: { type: String },
        rating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
        category: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String },
        city: { type: String, required: true, default: 'Mathura' },
        state: { type: String, default: 'Uttar Pradesh' },
        pincode: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
        openingHours: { type: String },
        closingHours: { type: String },
        services: [String],
        description: { type: String },
        website: { type: String },
        yearsInBusiness: { type: String },
        features: {
            inStoreShopping: { type: Boolean, default: false },
            kerbsidePickup: { type: Boolean, default: false },
            delivery: { type: Boolean, default: false },
            inStorePickup: { type: Boolean, default: false }
        }
    },
    { timestamps: true }
);

// Index for location-based queries
shopSchema.index({ city: 1 });
shopSchema.index({ address: 'text', name: 'text' });

module.exports = mongoose.model('Shop', shopSchema);

