import Address from "../models/Address.js";

export const getAddresses = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const addresses = await Address.find({
      userId: userId,
    }).sort({ isDefault: -1, createdAt: -1 });

    return res.status(200).json({
      addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error.message);

    return res.status(500).json({
      message: "Unable to fetch addresses",
    });
  }
};

export const save = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const result = await Address.create({
      ...req.body,
      userId,
    });

    return res.status(201).json({
      message: "Address added successfully",
      address: result,
    });
  } catch (error) {
    console.error("Error saving address:", error.message);

    return res.status(500).json({
      message: "Unable to save address",
    });
  }
};