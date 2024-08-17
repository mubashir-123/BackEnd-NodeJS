import {Schema} from "mongoose";
import mongoose from "mongoose";

const checkoutSchema = new Schema(
    {
      Name:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },
      PhoneNumber: {
        type: Number,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },
        Address:{
          type: String,
          required: true,
          lowercase: true,
          trim: true,
          index: true,
      },
       City:{
          type: String,
          required: true,
          lowercase: true,
          trim: true,
          index: true,
       },
    },
    {
      timestamps: true
    }
)

export const checkout = mongoose.model("checkout", checkoutSchema);