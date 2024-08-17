import { Schema } from "mongoose";
import mongoose from "mongoose";

const productSchema = new Schema(
    {
        productName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        price:{
            type: Number,
            required: true,
            lowercase: true,
            trim: true
        },
        color:{
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        stock:{
            type: Number,
            required: true,
            lowercase: true,
            trim: true
        },
        productImage:{
            type: String, //cloudinary url
            required: true
        },
        productImagePublicId:{
            type: String,
            required: true
        },
        shortDescription:{
             type: String,
             lowercase: true
        }
    },
    {
        timestamps: true
    }
)

export const Products = mongoose.model("Products",productSchema);