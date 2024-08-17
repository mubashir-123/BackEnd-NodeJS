import { Products } from "../models/products.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../ApiResponse.js";

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
    const { productName, price, color, stock, shortDescription } = req.body;

    if (
        [productName, price, color, stock, shortDescription].some((field) => field?.trim() === "")
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
        shortDescription
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

     if(!productName || !price || !color || !stock || !shortDescription){
         throw new ApiError(400,"All field are required")
     }   

        const updatedProduct = await Products.findByIdAndUpdate(    
            //  req.Products._id,
             req.params._id,
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
        res.status(200).json(updatedProduct);
     return res
            .status(200)
            .json(new ApiResponse(200,updateProduct,"The product has been updated successfully"))
});


 const deleteProduct = async (req, res) => {

        const deletedProduct = await Products.findByIdAndDelete(req.params.id);
        
        if (!deletedProduct){
            throw new ApiError(400,"Error while deletting the product")
        }
        
        return res.status(200)
              .json(new ApiResponse(200,deleteProduct,"Product has been deleted successfully"));
};

const updateProductImage = asyncHandler(async(req,res) => {
    const productImageLocalPath = req.file?.path

    if(!productImageLocalPath){
        throw new ApiError(400,"Product image file is missing")
    }

    const imageProduct = uploadonCloudinary(productImageLocalPath);

    if(!imageProduct.url){
        throw new ApiError(400,"Error while uploading on product image")
    }

   const productImage = await Products.findByIdAndUpdate(
        req.productImage?._id,
        {
          $set:{
            productImage: productImage.path
          }
        },
        {
            new: true
        }
    )
    
    return res
    .status(200)
    .json(200,user,"Product image is updated successfully")
})


export {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductImage
};

