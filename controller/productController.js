const Product = require('../model/productModel')
const Category = require('../model/categoryModel');
const fs = require('fs');
const path = require('path')
const ProductOffer = require('../model/productOfferModel')
const ReturnProducts = require('../model/returnOrderModel')
const Order = require('../model/orderModel')
const Wallet = require('../model/walletModel')
const multer = require('multer');
const { findByIdAndDelete } = require('../model/userModel');
// const upload = multer().fields([
//     { name: 'productImages', maxCount: 3 },
//     { name: 'croppedImages[]', maxCount: 3 }, // Match frontend naming
// ]);




const addProduct = async (req, res) => {
    try {
        let img = [];
        req.files.forEach((image) => {
            img.push(image.filename);
        });
console.log(img)
        const lastproduct = await Product.findOne().sort({ sl_number: -1 });
        const sl_number = lastproduct ? lastproduct.sl_number + 1 : 1;

        const product = new Product({
            product_name: req.body.pro_name,
            product_regular_price: req.body.pro_reg_price,
            product_category: req.body.pro_category,
            product_description: req.body.pro_description,
            product_quantity: req.body.pro_quantity,
            product_image: img,
            product_sale_price: req.body.pro_sale_price,
            product_brand: req.body.pro_brand,
            sl_number: sl_number,
        });

        const catName = await Category.findOne({ _id: product.product_category });
        if (catName) {
            const offer = (product.product_sale_price * catName.offerAmount) / 100;
            product.product_sale_price -= offer;
            console.log('catname is working')
        }

        await product.save();

        return res.redirect('/product/add_product')

    } catch (error) {
        console.error(error.message);
        // res.status(500).json({ success: false, message: 'An error occurred while adding the product.' });
        return res.redirect('/errorpage');
    }
};


//*****  PRODUCT GET PAGE */

const load_product = async(req,res)=>{
    try {
        const category= await Category.find()
        console.log('the cat is ',category);
        res.render('add_product',{category})
        
        
            
    } 
    catch (error) {
        console.log(error.message);
        res.redirect('/errorpage')
        
        
    }
}


//**** PRODUCT PAGE******

const productPage = async(req,res)=>{
    try {
        
       

        const page = parseInt(req.query.page)||1
        const limit = 4;
        const skip =(page-1)*limit
        
        const totalProduct = await Product.countDocuments()
        const product =await Product.find().sort({createdAt:-1}).populate('product_category').limit(limit).skip(skip)

        
        

            res.render('products',{product,totalPages:Math.ceil(totalProduct/limit)})       
                
    } 

    catch (error) {
        console.log(error.message);
        res.redirect('/errorpage')
        
        
    }
}

//********PRODUCT EDIT PAGE *********///
const load_edit_page = async (req, res) => {
    console.log('Edit page is coming');

    try {
        // Fetch all product offers
        const productOffer = await ProductOffer.find();
        
        // Fetch the product by ID and populate category
        const product = await Product.findById(req.params.id).populate('product_category');

        // If product doesn't exist, redirect to error page
        if (!product) {
            console.log('No product found');
            return res.redirect('/errorpage');
        }

        // Fetch categories for the select dropdown or related fields
        const category = await Category.find();
        
        // Check if any product offers are associated with the product
        const offerxist = productOffer.some(offer => offer.usedBy.includes(product._id));

        // Render the edit-product page with necessary data
        return res.render('edit-product', { offerxist, product, category, productOffer });
        
    } catch (error) {
        console.log('Error occurred:', error.message);
        // Redirect to an error page if something goes wrong
        return res.redirect('/errorpage');
    }
};

//********** UPDATE THE PRODUCT */


const update_product = async (req, res) => {
    console.log('ggghh')
    try {
        let img = [];
        req.files.forEach((image) => {
            img.push(image.filename);
        });
        // Handle cropped images sent as base64
        const croppedImages = req.body.croppedImages; // Assuming `croppedImages` is an array of base64 strings
        console.log('cropped image ',img)
        console.log('c',req.body.croppedImages)
        if (croppedImages && Array.isArray(croppedImages)) {
            croppedImages.forEach((base64Image, index) => {
                if (base64Image) {
                    // Decode base64 and create a buffer
                    const buffer = Buffer.from(base64Image.split(',')[1], 'base64');

                    // Define a unique filename for the cropped image
                    const filename = `cropped_${Date.now()}_${index}.jpg`;

                    // Save the cropped image to the public/uploads folder
                    const filePath = path.join(__dirname, '../public/', filename);
                    fs.writeFileSync(filePath, buffer);

                    // Push the filename to the image array
                    img.push(filename);
                }
            });
        }

        // Handle new image uploads via `req.files`
        if (req.files && req.files.length > 0) {
            req.files.forEach((file) => {
                img.push(file.filename);
            });
        }

        // Find the product by ID
        const updateProduct = await Product.findById(req.params.id);
        if (!updateProduct) {
            return res.status(404).send('No product found');
        }

        // Update the product with new details and images
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                product_name: req.body.pro_name,
                product_regular_price: req.body.pro_reg_price,
                product_category: req.body.pro_category,
                product_description: req.body.pro_description,
                product_quantity: req.body.pro_quantity,
                product_image: img.length > 0 ? img : updateProduct.product_image, // Keep existing images if no new ones are added
                product_sale_price: req.body.pro_sale_price,
                product_brand: req.body.pro_brand
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).send('No product found');
        }

        // Redirect to the product page after updating
        return res.redirect('/product/productPage');
    } catch (error) {
        console.error(error.message);
        return res.redirect('/errorpage');
    }
};

module.exports = { update_product };



//***** GET DELETE */

const active_product = async(req,res)=>{
    try {

     await Product.findByIdAndUpdate(req.params.id,{

        $set:{isActive:true }})

        res.redirect('/product/productPage')

        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')     
    }
}




const deactive_product = async(req,res)=>{
    try {

     await Product.findByIdAndUpdate(req.params.id,{

        $set:{isActive:false}})

        res.redirect('/product/productPage')

        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')     
    }
}

//**** Img delete */
const img_delete = async (req, res) => {
    console.log('ITS ENTERED...');


    try {
        const {product_id,img} = req.body
        try {
            const OldPath = path.join(__dirname,'../public/newfile/',img)
            console.log(OldPath)
        fs.unlinkSync(OldPath)
        } catch (error) {
            console.log(error.message);    
            // return res.status(400).json({success:false,message:'image deleted error'})
            return res.redirect('/errorpage');
        }

  

    const product = await Product.findOneAndUpdate({_id:product_id},

        {$pull:{product_image:img}},
        {new:true}

    )
    return res.status(200).json({success:true, message:'image deleted'})
    
    } catch (error) {
        console.log(error.message);
        // return res.status(500).json({success:false,message:'Internal server Error'})
        return res.redirect('/errorpage');
    }
    



  };

  //***   filter  *******************************************************************************/

//   const filter_category = async (req,res)=>{
//     try {

//         console.log('params is',req.params.id);
        
//         const categoryId = await Category.findOne({name:req.params.id}) 
//         console.log('the category id is ',categoryId);
        

//             if(categoryId){
//                 console.log('filter category ');
                
//             }
                

//     } catch (error) {
//         console.log(error.message);
        
        
//     }
//   }


//***** **     load_productOffer   */
const load_productOffer = async(req,res)=>{
    try {
        res.render('productOfferPage',{categories:null})
        
    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
}
//******** prouct offer *******/
const productOffer = async(req,res)=>{
    try {
        
        const newOffer = new ProductOffer({
            name:req.body.productName,
            discountPercentage:req.body.productDiscount,
            startDate:req.body.startDate,
            expiryData:req.body.expiryDate,
            description:req.body.description,
            status:req.body.status,
        })
            await newOffer.save()
    

    res.redirect('/product/productPage')
    } 
    catch (error) {
        console.log(error.message);
        res.redirect('/errorPage')
        
        
    }
}

//******** apply productOffer ****/

const applyProducOffer = async(req,res)=>{
    try {
        const {offerId,productId} = req.body
        const offerProduct = await ProductOffer.findById(req.body.offer)
        console.log('oo',offerId)
        console.log('productId is ',productId)

        const product = await Product.findById(productId)
        const productOffer = await ProductOffer.findById(offerId)


        const existing = await ProductOffer.findOne({_id:productOffer,
            usedBy:{$in:[product]}
        })
            if(existing){
                console.log('offer alredy claimed for the product')
                return
            }
      console.log('existing',existing)

       const offerAmount = product.product_sale_price * productOffer.discountPercentage /100
       console.log('offer is ',offerAmount)
       product.product_sale_price = Math.ceil(product.product_sale_price-offerAmount)
       product.offerValue = offerAmount
       productOffer.usedBy.push(product)

       product.save()
       productOffer.save()
        
        res.json({amount:product.product_sale_price,offerAmount:offerAmount})
       

        
    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
}

//**********   removeOffer   *************/


const removeOffer = async(req,res)=>{
    try {        
        const productId = req.body.productId
        const product = await Product.findById(productId)
        if(product.offerValue<=0){
            return res.status(400).json({success:false,message:'offer doesnot exist'})
        }
        console.log('productId',product)
        const updatedProduct = await Product.findByIdAndUpdate( product, { $inc: { product_sale_price: Math.ceil(product.offerValue) } }, { new: true });
        console.log('newprice', updatedProduct.product_sale_price)
        const productOffer = await ProductOffer.findOneAndUpdate({usedBy:productId},{$pull:{usedBy:productId}},{new:true})
        const actualPrice = updatedProduct.product_sale_price
        product.offerValue = 0
        await product.save()
        // console.log('productOffer is',productOffer)
        return res.status(200).json({success:true,offer:productOffer,actualPrice:actualPrice})


    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
}

//***    returnProducts  */

const returnProducts = async(req,res)=>{
    try {
        const order = await ReturnProducts.find().sort({createdAt:-1})

        res.render('returnProductPage',{order})
        
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')


        
    }
}

//***********    acceptReturn    ****** */

const acceptReturn = async(req,res)=>{
    try {

        const {orderId} = req.body
        console.log('the i',orderId)

        const trial = await ReturnProducts.findOne({order:orderId})

         const acceptReturn =  await ReturnProducts.findOneAndUpdate({order:orderId},{returnProductStatus:'ReturnApproved'},{new:true})
         const orderAmount = await Order.findOne({_id:orderId},{totalAmount:1,_id:0})
         
         const amount = orderAmount?.totalAmount
         const order = await Order.findOneAndUpdate({_id:orderId}, { orderStatus: 'Return Approved'}, { new: true });
         console.log('The order iss',order)
         order.items.forEach(async function (item){
            await Product.findOneAndUpdate({_id:item.product},{$inc:{product_quantity:item.quantity}})
         })
         const wallet = await Wallet.findOneAndUpdate(
            { user: order.user },
            { $inc: { balance: amount }, },
            { new: true }
        );
        const existingUser = await Wallet.findOne({ user:order.user});


         // Push transaction details
         existingUser.transactions.push({
            orderId: order._id,
            amount: order.totalAmount,
            type: 'credit', // Refund is a credit transaction
            status: 'success',
            walletFrom:'Returned Product'

        });

        // Save the updated wallet
        await existingUser.save();

    
        await wallet.save()
        res.json({success:true})

        
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')
        
    }
}

//*********** rejectOrder    ********* */

const rejectOrder =async(req,res)=>{
    try {
        const {orderId} = req.body

        const RejectReturn =  await ReturnProducts.findOneAndUpdate({order:orderId},{returnProductStatus:'returnRejected'},{new:true})

        const order = await Order.findOneAndUpdate({_id:orderId}, { orderStatus: 'Return Rejected'}, { new: true });

        res.json({success:true})
        console.log('the order status is ',order)
        console.log('the rejectREturn is ',RejectReturn)
        
        
    } catch (error) {
        console.log(error.messge)
        return res.redirect('/errorPage')
        
    }
}

const upload_cropped_image = async(req,res)=>{
    try {
        
        console.log('getting in the upload route')
    } catch (error) {
        console.log(error.message)
        res.return('/errorPage')        
    }
}

//***********    List offer ******/

const listOffer = async(req,res)=>{
    try {

        const productOffer = await ProductOffer.find()
        console.log(productOffer)

        res.render('productOfferList',{productOffer})
        
    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
}

///*************************** load_editProductOffer  */

const load_editProductOffer =  async(req,res)=>{
    try {
       const offer =  await ProductOffer.findById(req.params.id)
        res.render('edit_ProductofferPage',{offer})
        
    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
}

//*************  edit_productOffer    */
const edit_productOffer = async (req, res) => {
    try {
        console.log('edit page entered ');
        const update = await ProductOffer.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                discountPercentage: req.body.discountPercentage,
                expiryData: req.body.expiryDate,
                startDate: req.body.startDate,
                description: req.body.description,
            },
            { new: true }
        );

         res.redirect('/product/list_ProductOffer'); 
    } catch (error) {
        console.log(error.message);
        res.redirect('/errorPage');
    }
};

//*************   deleteOffer   *********/

const deleteOffer = async(req,res)=>{
    try {
    
        const offer = await ProductOffer.findByIdAndDelete(req.params.id)
        res.redirect('/product/list_ProductOffer')
        
    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
}















module.exports ={
    addProduct,
    load_product,
    productPage,
    load_edit_page,
    update_product,
    active_product,
    deactive_product,
    img_delete,
    load_productOffer,
    productOffer,
    applyProducOffer,
    removeOffer,
    returnProducts,
    acceptReturn,
    rejectOrder,
    upload_cropped_image,
    listOffer,
    load_editProductOffer,
    edit_productOffer,
    deleteOffer
    
}