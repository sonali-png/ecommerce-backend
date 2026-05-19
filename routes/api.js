import express from "express";
const router = express.Router();
import { adminAuthMiddleware } from "../src/middlewares/adminAuthMiddleware.js";
//https://chatgpt.com/c/69d3a036-4cd0-8320-aa49-ccfd9185bdef
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import multer from "multer";
import cloudinary from "../src/config/cloudinary.js";

const upload = multer({ dest: "uploads/" });

const uploadAndMapImages = async ({
  req,
  parsedData,
  folder = "products",
  mergeExisting = false,
  existingData = null
}) => {
  if (!req.files || req.files.length === 0) return parsedData;

  const uploadedResults = await Promise.all(
    req.files.map(file =>
      cloudinary.uploader.upload(file.path, { folder })
    )
  );

  const filesWithUrls = req.files.map((file, index) => ({
    fieldname: file.fieldname,
    url: uploadedResults[index].secure_url,
    public_id: uploadedResults[index].public_id
  }));

  parsedData.colorImages = parsedData.colorImages.map((c, i) => {
    const matched = filesWithUrls.filter(
      f => f.fieldname === `images_${i}`
    );

    let images = matched.map(m => ({
      url: m.url,
      public_id: m.public_id
    }));

    if (mergeExisting && existingData) {
      const oldColor = existingData.colorImages?.find(
        oc => oc.color === c.color
      );

      images = [...(oldColor?.images || []), ...images];
    }

    return {
      ...c,
      images
    };
  });
  return parsedData;
};

router.post("/fetchRecords", async (req, res) => {
  try {
    const { collectionName } = req.body;
    console.log(`collectionName : ${collectionName}`);
    const data = await mongoose.connection.db
      .collection(collectionName)
      .find({ isDeleted: { $ne: true } }) // ✅ filter
      .toArray();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/deleteRecord", async (req, res) => {
  try {
    const { collectionName, id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "ID required" });
    }
    const result = await mongoose.connection.db
      .collection(collectionName)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { isDeleted: true } }
      );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Delete error" });
  }
});

router.post("/getSingleRecord", async (req, res) => {
  const { collectionName, id } = req.body;

  const data = await mongoose.connection.db
    .collection(collectionName)
    .findOne({ _id: new ObjectId(id) });

  res.json({ data });
});

router.patch("/updateRecord", upload.any(), async (req, res) => {
  try {
    const { collectionName, id, data } = req.body;

    let parsedData = JSON.parse(data);

    if (collectionName === "product") {
      const existing = await mongoose.connection.db
        .collection(collectionName)
        .findOne({ _id: new ObjectId(id) });

      parsedData = await uploadAndMapImages({
        req,
        parsedData,
        folder: "products",
        mergeExisting: true,
        existingData: existing
      });
    }

    await mongoose.connection.db
      .collection(collectionName)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: parsedData }
      );

    res.json({ message: "Updated" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed", error });
  }
});

router.post("/addRecord", upload.any(), async (req, res) => {
  try {
    const { collectionName, data } = req.body;

    let parsedData = JSON.parse(data);

    if (collectionName === "products") {
      parsedData = await uploadAndMapImages({
        req,
        parsedData,
        folder: "products"
      });
    }
    const result = await mongoose.connection.db
      .collection(collectionName)
      .insertOne(parsedData);

    res.status(201).json({ message: "Added", id: result.insertedId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Add failed", error });
  }
});

router.delete("/deleteRecord/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { collectionName } = req.query;

    const record = await mongoose.connection.db
      .collection(collectionName)
      .findOne({ _id: new ObjectId(id) });

      if(collectionName === 'product') {
        // ✅ collect all public_ids
        let publicIds = [];

        if (record?.colorImages) {
          record.colorImages.forEach(c => {
            c.images.forEach(img => {
              publicIds.push(img.public_id);
            });
          });
        }
        // ✅ delete from cloudinary
        await Promise.all(
          publicIds.map(id => cloudinary.uploader.destroy(id))
        );
      }
    
      // ✅ delete from DB
      await mongoose.connection.db
        .collection(collectionName)
        .deleteOne({ _id: new ObjectId(id) });

      res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;