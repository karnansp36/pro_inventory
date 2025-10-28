import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "BrandOwner", "Manager", "BranchOwner"],
      default: "BranchOwner",
    },
    // For BranchOwner and Manager: who is their BrandOwner
    assignedBrandOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    // For BranchOwner: who is their Manager
    assignedManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    // For BrandOwner: which managers are assigned to them
    assignedManagers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // For Manager: which branch owners are assigned to them
    assignedBranchOwners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    profileImage: {
      type: String,
      required: false,
    },
    // Add this to your User schema in User.js
    bannerImage: {
      type: String,
      required: false,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    refreshTokenExpires: {
      type: Date,
      required: false,
    },
    // Shop Information (Optional for BranchOwner role)
    shopName: {
      type: String,
      required: false,
    },
    ownerName: {
      type: String,
      required: false,
    },
    shopType: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    establishedYear: {
      type: Number,
      required: false,
    },
    // Contact Information (Optional for BranchOwner role)
    phoneNumbers: [
      {
        type: String,
        required: false,
      },
    ],
    emailAddress: {
      type: String,
      required: false,
    },
    websiteLinks: [
      {
        type: String,
        required: false,
      },
    ],
    socialMediaLinks: [
      {
        type: String,
        required: false,
      },
    ],
    messagingLinks: [
      {
        type: String,
        required: false,
      },
    ],
    // Location & Address (Optional for BranchOwner role)
    fullAddress: {
      type: String,
      required: false,
    },
    landmark: {
      type: String,
      required: false,
    },
    googleMapsLink: {
      type: String,
      required: false,
    },
    operatingArea: {
      type: String,
      required: false,
    },
    deliveryArea: {
      type: String,
      required: false,
    },
    // Operating Details (Optional for BranchOwner role)
    openingClosingTimes: {
      type: String,
      required: false,
    },
    holidays: {
      type: String,
      required: false,
    },
    availableServices: [
      {
        type: String,
        required: false,
      },
    ],
    // Products / Services Offered (Optional for BranchOwner role)
    productCategories: [
      {
        type: String,
        required: false,
      },
    ],
    productHighlights: [
      {
        type: String,
        required: false,
      },
    ],
    serviceDetails: [
      {
        type: String,
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
