const  Category = require('../model/categoryModel')
const CategoryOffer = require('../model/categoryOfferModel')
const Product = require('../model/productModel')
const Cart = require('../model/cartModel')



//** CAATEGORY PAGE **/
const categoryPage = async(req,res)=>{
        try {
            const categories = await Category.find().sort({createdAt:-1})
            
            res.render('categories',{categories})
            
            } catch (error) {
            console.log(error.message);
            return res.redirect('/errorpage')
            
            
        }
}
//*************** Add category Page ********************************************* */
const load_addCategory = async (req,res) =>{
    console.log('get is here');
    
    try {

        res.render('add-category',{message:''})
     } catch (error) {
        console.log(error.message);
        res.redirect('/errorpage')
        
    }
}
//****************** Add Category  *************************************************** */
const addCategory = async (req,res)=>{
    try {
        console.log('entering into the post category');
        
       
        const newCategory = new Category({

            name:req.body.name,
            description:req.body.description
          

        })
        const existingCat = await Category.findOne({ name: { $regex: `^${req.body.name}$`, $options: 'i' } });

       
        if(existingCat){
                console.log('category name alredy exist');
                res.status(400).render('add-category', { message: 'Name already exists' });

            }else{
                    const cat =   await  newCategory .save();
                    console.log(cat);

                    return   res.redirect('/category/categoryPage')

        }

    } catch (error) {

            console.log(error.message);
            return res.redirect('/errorpage')
        
        
    }
}
//************** Edit Category Page ************************************ */
const load_editCategory = async (req,res)=>{
    console.log('welcome');
    
    
    try {
        const categoryOffer = await CategoryOffer.find()
        // console.log('cat offer is ',categoryOffer)
        const category = await Category.findById(req.params.id)    
    if(!category){
        console.log('category not found');
    }

        return res.render('edit-category',{category,categoryOffer})
        
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')
        
        
    }
}
//***************   Post edit Category ************************************ */
const editCategory = async (req,res)=>{
     try {
        
        
        const updateCategory = await Category.findByIdAndUpdate(req.params.id,{$set:{name:req.body.name,description:req.body.description}})
       
        if(!updateCategory){
          return res.status(404).send('update category error')
      }
      return res.redirect('/category/categoryPage')

     } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')
        
     }
}
//*****POST BLOCK ****** */
const block_category = async (req, res) => {
    console.log('entered');
    
    try {
        await Category.findByIdAndUpdate( req.params.id,
            { $set: { isListed: false } } );
        return res.redirect('/category/categoryPage');
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage');
    }
};


///***** podt disable**** */

const unblock_category = async(req,res)=>{
    try {
        console.log('loged in');
        
            await Category.findByIdAndUpdate(req.params.id,{
            $set:{ isListed:true}})

            res.redirect('/category/categoryPage')


    } catch (error) {
        console.log(error.message);
        
        
    }
}
//*****************     loadOffer        ************** */

const loadOffer = async(req,res)=>{
    try {
        console.log('entering into the offerPage')
        res.render('categoryOfferPage')
        
    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')

    }
}
const createOffer = async (req, res) => {
    try {
      const newOffer = new CategoryOffer({
        name: req.body.categoryName,
        discountPercentage: req.body.categoryDiscount,
        startDate: req.body.startDate,
        expiryData: req.body.expiryDate,
        description: req.body.description,
        status: req.body.status,
      });
  
      await newOffer.save();
  
      res.redirect('/category/categoryPage');
    } catch (error) {
      console.log(error.message)
      res.redirect('/errorPage')
    }
  };
  
  //*********  applyCoupen ********* */

  const applyCoupen = async(req,res)=>{
    try {

        const {categoryOfferId,categoryId} = req.body
        
        
        const categoryOffer = await CategoryOffer.findOne({_id:categoryOfferId})
         const product = await Product.find({product_category:categoryId})
        const category = await Category.findOne({_id:categoryId})
        
        if(category.offerAmount>0){
            console.log('190')
            return res.status(400).json({success:false,message:'offer already exists'})
        }
        category.offerAmount=categoryOffer.discountPercentage;
        category.save()
        
        console.log('the category offeramount is',category.offerAmount)
        
       product.forEach(async function(item){
           console.log('old price',item.product_sale_price)
            
            const newSalePrice = item.product_sale_price*category.offerAmount/100
            // console.log(newSalePrice)

            const productUpdate = await  Product.findOneAndUpdate(
                { product_category: categoryId ,_id:item._id},
                { product_sale_price:Math.round(item.product_sale_price - newSalePrice) ,offerValue:newSalePrice},
                { new: true } 
               )        
               
               
               console.log('new price',item.product_sale_price)
              
        })


        return res.status(200).json({ success: true, message: 'Coupon applied successfully.' });


        // category.offerAmount/100

        //  console.log('offerAmount is',offerAmount)
        //  const productUpdate = await Product.findOneAndUpdate(
        //     { product_category: categoryId },
        //     { product_sale_price: newSalePrice },
        //     { new: true } 
        //    )        
           
        //    console.log(productUpdate)

        // console.log(product.product_sale_price)

        //


        // product.product_sale_price = product.product_sale_price-offerAmount
        //  product.save()
        // console.log(product.product_sale_price)




        // console.log(req.body.categoryOfferId)
        // console.log(req.body.categoryId)
        // const category = await Category.findOne({_id:req.body.categoryId})
        // console.log(category)
        // const categoryOfferId = await CategoryOffer.findById(req.body.categoryOfferId);
        // console.log(categoryOfferId);

        // category.offerAmount = categoryOfferId.discountPercentage
        // category.save()


        



    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }

  const delete_offer = async(req,res)=>{

      try {
        const {category_id} = req.body
        console.log(category_id)
        const categoryData  = await Category.findOne({_id:category_id})
        if(!categoryData.offerAmount){
            return res.status(400).json({success:false,message:'offer doesnt exists'})
        }
        const product= await Product.find({product_category:category_id})
        console.log(product)

        console.log('before product price',product.product_sale_price)
        for (const item of product) {
            try {
                // console.log(`Updating product with category_id: ${category_id}, offerValue: ${item.offerValue}`);
                
                const productUpdate = await Product.findOneAndUpdate(
                    { product_category: category_id,_id:item.id},
                    {
                        product_sale_price:Math.round(item.product_sale_price + item.offerValue),
                        offerValue: 0 // Ensure this matches the schema
                    },
                    { new: true } // Return the updated document
                );
        
                if (productUpdate) {
                    console.log(`Updated product successfully:`, productUpdate);
                } else {
                    console.log(`No product found for category_id: ${category_id}`);
                }
            } catch (error) {
                console.error(`Error updating product: ${error.message}`);
            }
        }
        
         categoryData.offerAmount = 0
         await categoryData.save()
           
         return res.status(200).json({ success: true, message: 'Coupon removed successfully.' });




        
    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
  }




module.exports = {
    categoryPage,
    load_addCategory,
    addCategory,
    load_editCategory,
    editCategory,
    block_category,
    unblock_category,
    loadOffer,
    createOffer,
    applyCoupen,
    delete_offer
}
    
