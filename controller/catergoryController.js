const  Category = require('../model/categoryModel')



//** CAATEGORY PAGE **/
const categoryPage = async(req,res)=>{
        try {
            const categories = await Category.find()
            
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

        res.render('add-category')
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
        const existingCat = await Category.findOne({name:req.body.name})

       
        if(existingCat){
                console.log('category name alredy exist');
                res.redirect('/errorPage')

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
        const category = await Category.findById(req.params.id)    
    if(!category){
        console.log('category not found');
    }

        return res.render('edit-category',{category})
        
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

module.exports = {
    categoryPage,
    load_addCategory,
    addCategory,
    load_editCategory,
    editCategory,
    block_category,
    unblock_category
}
    
