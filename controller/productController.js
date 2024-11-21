const Product = require('../model/productModel')
const Category = require('../model/categoryModel');
const fs = require('fs');
const path = require('path')
const ProductOffer = require('../model/productOfferModel')

const addProduct = async(req,res)=>{
    // console.log('add product is comming',req.body.pro_name);

    
try {
    
      let img = []
      req.files.forEach(image => {
    img.push(image.filename)        
      });
      console.log('img is',img);
    
        const lastproduct = await Product.findOne().sort({sl_number:-1})
        const sl_number = await lastproduct? lastproduct.sl_number+1 :1

      const product = new Product({
        product_name:req.body.pro_name,
        product_regular_price:  req.body.pro_reg_price,
        product_category:req.body.pro_category,
        product_description:req.body.pro_description,
        product_quantity:req.body.pro_quantity,
        product_image:img,
        product_sale_price:req.body.pro_sale_price,
        product_brand:req.body.pro_brand,
        sl_number:sl_number

      })

      await product.save();
      res.redirect('/product/productPage')

} catch (error) {
    res.redirect('/errorpage')
    console.log(error.message);   
}

}

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

const load_edit_page = async(req,res)=>{
    console.log('edit page is comming');
    
    try {
        
        const productOffer = await ProductOffer.find()
        // console.log('available productoffer is ',productOffer)
        const product = await Product.findById(req.params.id).populate
        ('product_category')
        // console.log('product is',product);


        const category= await  Category.find();
        
        if(!product){
            console.log('no product found ');
            
        }
        let offerxist = false
        for(let i=0;i<productOffer.length;i++){
                
            if( productOffer[i].usedBy.includes(product._id)){
                offerxist = true
            }

        }

      return res.render('edit-product',{offerxist,product,category,productOffer})
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')
        
        
    }
}

//********** UPDATE THE PRODUCT */
const update_product = async (req, res) => {
    try {
        // Find the product by ID
        const updateProduct = await Product.findById(req.params.id);
        console.log(updateProduct);
        
        if (!updateProduct) {
            return res.status(404).send('No product found');
        }

        // Handle new image uploads
        const newImages = req.files ? req.files.map(file => file.filename) : [];
        console.log(newImages);
        
        const updatedProductImages = newImages.length > 0 ? newImages : updateProduct.product_image;
        console.log("2",updatedProductImages);
        console.log(req.body.pro_category);
        
        
        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                product_name: req.body.pro_name,
                product_regular_price: req.body.pro_reg_price,
                product_category: req.body.pro_category,
                product_description: req.body.pro_description,
                product_quantity: req.body.pro_quantity,
                product_image: updatedProductImages, // Use the correct variable here
                product_sale_price: req.body.pro_sale_price,
                product_brand: req.body.pro_brand
            },
            { new: true }
        );

        console.log(updatedProduct);
    


        if (!updatedProduct) {
            return res.status(404).send('No product found');
        }

        // Redirect to the product page
        return res.redirect('/product/productPage');
    } catch (error) {
        console.log(error.message);
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
    removeOffer
    
    
}