const mongoose = require("mongoose");

const BatchAnchorSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },
    merkleRoot: {
      type: String,
      required: true,
      index: true,
    },
    studentCount: {
      type: Number,
      default: 0,
    },
    documentCount: {
      type: Number,
      default: 0,
    },
    network: {
      type: String,
      default: "Polygon Amoy Testnet",
    },
    chainId: {
      type: Number,
      default: 80002,
    },
    contractAddress: {
      type: String,
      default: "",
    },
    transactionHash: {
      type: String,
      required: true,
      index: true,
    },
    blockNumber: {
      type: Number,
      default: 0,
    },
    anchoredAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "FAILED", "PENDING"],
      default: "CONFIRMED",
    },
    merkleVersion: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BatchAnchor", BatchAnchorSchema);
