import mongoose, { Schema, type Document } from "mongoose"

export interface IHospitalResource extends Document {
  name: string
  type: "bed" | "equipment" | "staff" | "room" | "other"
  total: number
  available: number
  location?: string
  details?: string
  createdAt: Date
  updatedAt: Date
}

const HospitalResourceSchema = new Schema<IHospitalResource>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["bed", "equipment", "staff", "room", "other"],
      required: [true, "Type is required"],
    },
    total: {
      type: Number,
      required: [true, "Total count is required"],
      min: [0, "Total count cannot be negative"],
    },
    available: {
      type: Number,
      required: [true, "Available count is required"],
      min: [0, "Available count cannot be negative"],
      validate: {
        validator: function (this: IHospitalResource, value: number) {
          return value <= this.total
        },
        message: "Available count cannot exceed total count",
      },
    },
    location: {
      type: String,
    },
    details: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.HospitalResource ||
  mongoose.model<IHospitalResource>("HospitalResource", HospitalResourceSchema)

