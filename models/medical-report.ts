import mongoose, { Schema, type Document } from "mongoose"

export interface IMedicalReport extends Document {
  patient: mongoose.Types.ObjectId
  doctor: mongoose.Types.ObjectId
  title: string
  type: "blood_test" | "x_ray" | "mri" | "ct_scan" | "general" | "other"
  fileUrl: string
  summary?: string
  aiSummary?: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

const MedicalReportSchema = new Schema<IMedicalReport>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient is required"],
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    type: {
      type: String,
      enum: ["blood_test", "x_ray", "mri", "ct_scan", "general", "other"],
      default: "general",
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    summary: {
      type: String,
    },
    aiSummary: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.MedicalReport || mongoose.model<IMedicalReport>("MedicalReport", MedicalReportSchema)

