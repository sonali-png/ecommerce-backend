import mongoose from "mongoose";

const HomePageSectionItemSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomePageSection",
      required: true
    },

    title: {
      type: String,
      default: ""
    },

    subtitle: {
      type: String,
      default: ""
    },

    image: {
      url: String,
      public_id: String
    },

    url: {
      type: String,
      default: ""
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
  "HomePageSectionItem",
  HomePageSectionItemSchema
);