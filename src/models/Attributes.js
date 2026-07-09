import mongoose from "mongoose";

const AttributesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    label : { type: String }, 
    slug: {type: String},
    values: Array,
    filterable: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isVariant: { type: Boolean, default: false},
    isUsedForMeasurement: { type: Boolean, default: false},
    status: { type: Boolean, default: true},
    isDeleted: { type: Boolean, default: false},
});

export default mongoose.model("Attributes", AttributesSchema);