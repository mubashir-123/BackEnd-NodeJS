import { Products } from "../models/products.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../ApiResponse.js";
import { v2 as cloudinary } from "cloudinary";

 const getAllProducts =asyncHandler( async (req, res) => {
    
        const products = await Products.find();
     
        if(!products) {
        throw new ApiError(500,"Cannot find the products")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200,products,"Products loaded successfully"))
});

 const getProductById =asyncHandler( async (req, res) => {
    
        const product = await Products.findById(req.params.id);

    if(!product) {
        throw new ApiError(404,"The product is not found")
    }
    return res
          .status(200)
          .json(new ApiResponse(200,product,"The product you requested loaded successfully"))
});

 const addProduct = asyncHandler( async (req, res) => {
    const { productName, price, color, stock, shortDescription,  category  } = req.body;

    if (
        [productName, price, color, stock, shortDescription,  category ].some((field) => field?.trim() === "")
      ) {
        throw new ApiError(400, "All fields are required");
      }
    
      const existProduct = await Products.findOne({
        $or : [{productName}]
      })
      if(existProduct){
        throw new ApiError(409,"Product is already exist")
      }
       
      const productImageLocalPath = req.files?.productImage?.[0]?.path;
  
      if(!productImageLocalPath){
          throw new ApiError(400,"Product image file is required");
      }
  
      const imageProduct = await uploadonCloudinary(productImageLocalPath);
          // Validate if the image was uploaded successfully
    if (!imageProduct?.url) {
        throw new ApiError(500, "Error while uploading the product image");
    }


    const newProduct = new Products({
        productName,
        price,
        color,
        stock,
        productImage: imageProduct.url,
        productImagePublicId: imageProduct.public_id,
        shortDescription,
        category 
    });

        const savedProduct = await newProduct.save({validateBeforeSave: false});
      
        if(!savedProduct) {
           throw new ApiError(400,"Error while adding the product")
    }

    return res
           .status(200)
           .json(new ApiResponse(200,savedProduct,"The product has been added successfully"))
});

 const updateProduct = asyncHandler( async (req, res) => {

   const { productName, price, color, stock, shortDescription } = req.body;
   console.log(req.body);

    //  if(productName || price || color || stock || shortDescription){
    //        new ApiResponse(200,"Data is accpeted by the function update product")
    // }   
    console.log(productName,price,color,stock,shortDescription)

        const updatedProduct = await Products.findByIdAndUpdate(    
            //  req.Products._id,
             req.params.id,
             {
                productName,
                price, 
                color, 
                stock, 
                shortDescription,
             },
            { new: true }
        );
        if (!updatedProduct){ 
            throw new ApiError(404,"Error while updating product")
        }
        // res.status(200).json(updatedProduct);
     return res
            .status(200)
            .json(new ApiResponse(200,updatedProduct,"The product has been updated successfully"))
});


 const deleteProduct = async (req, res) => {

        const deletedProduct = await Products.findByIdAndDelete(req.params.id);
        
        if (!deletedProduct){
            throw new ApiError(400,"Error while deletting the product")
        }
        
        return res
        .status(200)
        .json(new ApiResponse(200,deletedProduct,"Product has been deleted successfully"));
};

const updateProductImage = asyncHandler(async(req,res) => {
    const productImageLocalPath = req.file?.path

    if(!productImageLocalPath){
        throw new ApiError(400,"Product image file is missing")
    }

       // Fetch the product to get the current userProductImage public_id
  const userProductImage = await Products.findById(req.params.id);

  if (userProductImage.productImagePublicId) {
    // Delete the old avatar from Cloudinary
    const oldPublicId = userProductImage.productImagePublicId;
    await cloudinary.uploader.destroy(oldPublicId);
  }

    const imageProduct = await uploadonCloudinary(productImageLocalPath);

    if(!imageProduct.url){
        throw new ApiError(400,"Error while uploading on product image")
    }

   const productImage = await Products.findByIdAndUpdate(
        req.params.id,
        {
          $set:{
            productImage: imageProduct.url,                      // Update the avatar URL
            productImagePublicId: imageProduct.public_id        // Update the public_id
          }
        },
        {
            new: true
        }
    )
    
    return res
    .status(200)
    .json(new ApiResponse(200,productImage,"Product image is updated successfully"))
})


export {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductImage
};

