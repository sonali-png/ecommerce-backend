import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    title: {
      type: String,
      default: ""
    },

    subtitle: {
      type: String,
      default: ""
    },

    description: {
      type: String,
      default: ""
    },

    bannerImage: {
      url: String,
      public_id: String
    },

    mobileBannerImage: {
      url: String,
      public_id: String
    },

    campaignType: {
      type: String,
      enum: [
        "seasonal",
        "festival",
        "clearance",
        "brand",
        "custom"
      ],
      default: "custom"
    },

    discountLabel: {
      type: String,
      default: ""
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    isFeatured: {
      type: Boolean,
      default: false
    },

    status: {
      type: Boolean,
      default: true
    },

    displayOrder: {
      type: Number,
      default: 0
    },

    seoTitle: String,
    seoDescription: String,

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);


export default mongoose.model(
  "Campaign",
  CampaignSchema
);