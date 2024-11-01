const Product = require('../model/productModel')
const Category = require('../model/categoryModel');
const fs = require('fs');
const path = require('path')

const addProduct = async(req,res)=>{
    console.log('add product is comming');
    
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
        console.log('logs into the page');
        
       

        const page = parseInt(req.query.page)||1
        const limit = 4;
        const skip =(page-1)*limit
        
        const totalProduct = await Product.countDocuments()
        const product =await Product.find().sort({createdAt:-1}).populate('product_category').limit(limit).skip(skip)

        const aa = product.length
        console.log(aa);
        
        console.log('bug page entered');

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
        
        
        const product = await Product.findById(req.params.id).populate
        ('product_category')
        console.log('product is',product);


        const category= await  Category.find();
        
        if(!product){
            console.log('no product found ');
            
        }

      return res.render('edit-product',{product,category})
        
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





module.exports ={
    addProduct,
    load_product,
    productPage,
    load_edit_page,
    update_product,
    active_product,
    deactive_product,
    img_delete,
    
    
}