import mongoose from "mongoose";

const HomePageSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    position: {
      type: String,
      required: true
    },
    designType: {
      type: String,
      required: true,
      enum: [
        "carousel",
        "grid-2",
        "grid-3",
        "grid-4",
        "grid-6",
        "banner",
        "banner-grid",
        "product-carousel"
      ],
      default: "grid-2"
    }, 
    
    displayOrder: {
      type: Number,
      default: 0
    },

    status: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "HomePageSection",
  HomePageSectionSchema
);