import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../ApiResponse.js";
import { checkout } from "../models/checkout.models.js";

const addCheckout = asyncHandler(async(req,res) => {
    const { Name,PhoneNumber, Address, City } = req.body;

    const createCheckout = await checkout.create({
        Name,
        PhoneNumber,
        Address,
        City
        })
        
        const savedCheckout = await createCheckout.save({validateBeforeSave: false});

        if(!savedCheckout) {
            throw new ApiError(400,"Error while checkout product")
     }
    
     return res
     .status(200)
     .json(new ApiResponse(200,savedCheckout,"Checout user successfully"))
})

const getCheckoutUser = asyncHandler(async(req,res) => {
    const checkoutdetails = await checkout.find();
    if(!checkoutdetails) {
        throw new ApiError(500,"Cannot find the products")
    }
    return res.json(new ApiResponse(200,checkoutdetails,"Checkout data render successfully"))
})

export {addCheckout, getCheckoutUser}