const Product = require('../model/productModel')
const Category = require('../model/categoryModel');
const fs = require('fs');
const path = require('path')
const ProductOffer = require('../model/productOfferModel')
const ReturnProducts = require('../model/returnOrderModel')
const Order = require('../model/orderModel')
const Wallet = require('../model/walletModel')


const addProduct = async (req, res) => {
    try {
        let img = [];
        req.files.forEach((image) => {
            img.push(image.filename);
        });

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
        }

        await product.save();

        return res.status(200).json({ success: true, message: 'Product added successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'An error occurred while adding the product.' });
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
        res.redirect('/errorpage')
        console.log(error.message);
        
        
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
        res.redirect('/errorpage')
        console.log(error.message);
        
        
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
    try {
        let img = [];
        
        // Check if cropped image data is sent
        if (req.body.croppedImage) {
            // Decode the base64 image data
            const base64Data = req.body.croppedImage.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            // Define a unique filename for the cropped image
            const filename = `cropped_${Date.now()}.jpg`;

            // Save the cropped image to the public/uploads folder
            const filePath = path.join(__dirname, '../public/uploads', filename);
            fs.writeFileSync(filePath, buffer);

            img.push(filename);
        }

        // Handle new image uploads via req.files
        req.files.forEach((file) => {
            img.push(file.filename);
        });

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
                product_image: img.length > 0 ? img : updateProduct.product_image,
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
            console.log(error);    
            return res.status(400).json({success:false,message:'image deleted error'})
        }

  

    const product = await Product.findOneAndUpdate({_id:product_id},

        {$pull:{product_image:img}},
        {new:true}

    )
    return res.status(200).json({success:true, message:'image deleted'})
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:'Internal server Error'})
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
       product.product_sale_price = product.product_sale_price-offerAmount

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
        const offerAmount = req.body.offerAmount
        console.log('offeramount is ',req.body.offerAmount)
        const product = await Product.findById(productId)
        console.log('productId',product)
        const updatedProduct = await Product.findByIdAndUpdate( product, { $inc: { product_sale_price: offerAmount } }, { new: true });
        console.log('newprice', updatedProduct.product_sale_price)
        const productOffer = await ProductOffer.findOneAndUpdate({usedBy:productId},{$pull:{usedBy:productId}},{new:true})
        const actualPrice = updatedProduct.product_sale_price
        // console.log('productOffer is',productOffer)
        res.json({offer:productOffer,actualPrice:actualPrice})


    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
}

//***    returnProducts  */

const returnProducts = async(req,res)=>{
    try {
        const order = await ReturnProducts.find()

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
         const wallet = await Wallet.findOneAndUpdate(
            { user: order.user },
            { $inc: { balance: amount } },
            { new: true }
        );
        
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
    rejectOrder
    
}