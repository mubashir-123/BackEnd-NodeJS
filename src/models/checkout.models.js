import {Schema} from "mongoose";
import mongoose from "mongoose";

const checkoutSchema = new Schema(
    {
      name:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },
      phone: {
        type: Number,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },
        address:{
          type: String,
          required: true,
          lowercase: true,
          trim: true,
          index: true,
      },
       city:{
          type: String,
          required: true,
          lowercase: true,
          trim: true,
          index: true,
       },
       productName:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
     },
     description:{
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
   },
   price:{
    type: Number,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
 },
       quantity:{
          type: String,
          lowercase: true,
          trim: true,
          index: true,
       },
       category:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
     },
     size:{
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
   },
       color: {
        type: String,
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