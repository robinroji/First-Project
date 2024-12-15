const User = require('../model/userModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const moment = require('moment')
const Order = require('../model/orderModel')
const Coupen = require('../model/coupenModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Product = require('../model/productModel')
const { v4: uuidv4 } = require('uuid');


//************** ADMIN  GET LOGIN  *************/

const loadLogin = (req,res)=>{

try {

    if(req.session.admin){
        return res.redirect ('/admin/dashboard');
    }
    return res.render('login',{message:null});


    
} catch (error) {
    console.log(error.message);
    
    
}


}

//******* ADMIN POST LOGIN ************** */

const login = async (req,res)=>{

    console.log(' admin post login route working ');
    

    try {
             const {email,password}= req.body;
             
             
             const admin = await User.findOne({email:email,is_admin:1});  
             

             if (admin )
                
                {
                    console.log(password,' === ',admin.password);
                    
                const passwordMatch =await bcrypt.compare(password,admin.password)                
                if(passwordMatch)

                    {

                    req.session.admin = admin._id;
                    return res.redirect('/admin/dashboard')
                }else{
                    console.log('admin password is not matching ');
                    return res.render('login',{message:'password is incorrect'})
                }
             }else{
                console.log('admin is not verified ');
                return res.render ('login',{message:'email and password are incorrect '})
             }
    } catch (error) {
        console.log( error.message);
        return res.redirect ('/errorpage')
        
        
    }
}



//*********************DASHBOARD ****************************** */

const loadDashbord= async(req,res)=>{
   try {
     const order = await Order.aggregate([{$group:{_id:null,total:{$sum:1}}},{$project:{_id:0,total:1}}])
     const totalOrder = order[0].total
   
     const income = await Order.aggregate([{$group:{_id:null,income:{$sum:'$totalAmount'} }}])
     const totalIncome = income[0].income
     
     const products = await Product.aggregate([{$group:{_id:null,products:{$sum:'$product_quantity'}}}])
     const totalProducts = products[0].products
/////////////////////

     const bestProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
          $group: {
              _id: "$items.product",
              bestProducts: { $sum: "$items.quantity" }
          }
      },
      { $sort: { bestProducts: -1 } },
      {
          $lookup: {
              from: "products", 
              localField: "_id",
              foreignField: "_id",
              as: "productDetails"
          }
      },
      { $unwind: "$productDetails" } 
  ]);
  

    const bestCategory = await Order.aggregate([{$unwind:'$items'},{$group:{_id:'$items.category',bestProducts:{$sum:'$items.quantity'}}},{$sort:{bestProducts:-1}},
        {$lookup:{
            from:'categories',
            localField:'_id',
            foreignField:'_id',
            as:'categoryDetails'

        }}
    ])
   
    const bestBrand = await Order.aggregate([{$unwind:'$items'},{$group:{_id:'$items.brandName',bestProducts:{$sum:'$items.quantity'}}},{$sort:{bestProducts:-1}}])
    
    const topProducts = bestProducts.map(x => x.productDetails.product_name)
    const topCategory = bestCategory.flatMap(x=>x.categoryDetails.map(x=>x.name))
    const topBrand = bestBrand.map(x=>x._id)


// console.log('the top products is ',topProducts)
// console.log('the best category is ',topCategory)
// console.log('the best brand is ',topBrand)

    res.render('admin_Dashboard',{totalOrder,totalIncome,totalProducts,topProducts,topCategory,topBrand})
    
   } catch (error) {
    console.log(error.message);
    return res.redirect('/errorpage')
    
   }
}

const logout = async(req,res)=>{
    try {
        
        req.session.destroy(error=>{
            if(error){

                console.log(error.message);
                return  res.render('/admin/login');
            }
           res.redirect('/admin/login')
            
        })
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorpage')
        
        
    }
}
//************** */
const loadOrderList = async (req, res) => {
    try {
        // Extract page and limit from query parameters with defaults
        const { page = 1, limit = 10 } = req.query; 
        const skip = (page - 1) * limit; // Calculate how many documents to skip

        // Fetch paginated orders
        const orders = await Order.find()
            .populate('user') // Populate user details
            .populate('shippingAddress') // Populate shipping address
            .skip(skip) // Skip documents for pagination
            .limit(limit); // Limit the number of documents per page

        // Get the total number of orders for pagination
        const totalOrders = await Order.countDocuments();

        // Pass data to the view
        res.render('orderPage', {
            orders,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalOrders / limit),
        });
    } catch (error) {
        console.log(error.message);
        res.redirect('/errorPage'); // Redirect to an error page if an error occurs
    }
};


//*******  ****************** */

const editOrder = async(req,res)=>{
    try {
        console.log('edit o');
        const order = await Order.findById(req.params.id).populate('user');
        // console.log('the orders is ',order)

        const orders = await Order.findById(req.params.id).populate('user').populate('shippingAddress')
        console.log('the orders is ',orders.shippingAddress.houseName)


        res.render('orderDetailPage',{order,orders});
       
        
    } catch (error) {
        console.log(error.message);
        
        
    }
}

//******** deleteOrder from the order detail  */

const deleteOrder = async (req,res)=>{
    try {
        const order = await Order.findByIdAndDelete(req.params.id)
        console.log('reached the order cancel');
        
        return res.redirect('/admin/orderList')
        
    } catch (error) {
        console.log(error.message); 
    }
}

//*********  updateStatus   */

const updateStatus = async(req,res)=>{
    console.log('entering');
    
    try {
        console.log(req.params.id);
        const id = req.params.id

        const statusUpdate = await Order.findByIdAndUpdate(id,{$set:{orderStatus:req.body.status}},{new:true})
        res.redirect(`/admin/edit_order/${id}`)
        
        
    } catch (error) {
        console.log(error.message,"uuupdate");
        
        
    }
}

//*********   Create Coupen  *****/

const getCoupen = async(req,res)=>{
    try {

        console.log('create coupen page entered')
        const coupens = await Coupen.find({isActive:true})
        console.log('coupens are',coupens)
        res.render('coupen',{coupens})
        
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')
        
    }
}

//************  add_Coupen  *************** */

const add_Coupen = async(req,res)=>{
    try {
        const admin = await User.findById(req.session.admin)

        const coupen = new Coupen({

            code:req.body.couponCode,
            discountPercentage:req.body.discount,
            expiryDate:req.body.expiryDate,
            minimumPurchaseAmount:req.body.minOrderValue,
            usedBy:admin


        })

        coupen.save()
        return res.redirect('/admin/coupen')
        
    } catch (error) {
        console.log(error.message);
        res.redirect('/errorPage')
        
        
    }
}

//****   Load Add coupen  ******/

const load_add_Coupen = async(req,res)=>{
    try {
        res.render('addCoupen')
    } catch (error) {
        console.log(error.message);
        return res.redirect('/errorPage')
        
        
    }
}

//*********  load_edit_Coupen ******** */

const load_edit_Coupen = async(req,res)=>{
    try {
        const coupens = await Coupen.findById(req.params.id)

        console.log('load edit ******************************************9999')
        
        res.render('edit_Coupen',{coupens})
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')
        
    }
}


//****************    edit_Coupen    *********************/

const edit_Coupen = async(req,res)=>{

    try {
        console.log('edit page entered ')
        const update = await Coupen.findByIdAndUpdate(req.params.id,{
            code:req.body.code,
            discountPercentage:req.body.discountPercentage,
            expiryDate:req.body.expiryDate,
            minimumPurchaseAmount:req.body.minimumPurchaseAmount,
        },
             {new:true}
    )
        return res.redirect('/admin/coupen')
    } catch (error) {
        console.log(error.message)
        return res.redirect('/errorPage')
        
    }
}


//******** delete_Coupen */

const delete_Coupen = async(req,res)=>{
    try {
        console.log('the id is ',req.params.id)
        const coupenId= await Coupen.findByIdAndDelete(req.params.id)
        return res.redirect('/admin/coupen')
        
    } catch (error) {
        console.log('error found heere in the delete coupen')
        console.log(error.messsage)
        return res.redirect('/errorPage')
        
    }
}


///*******  salesReport   ******* */

const salesReport = async(req,res)=>{
    try {
        let amount =0
        console.log('getting the salesReport')
        let salesData = await Order.find()
        const orders = await Order.find()

       let sum =0
       let totalOffer = 0
    orders.forEach((x)=>{
        sum += x.totalAmount;
        totalOffer+=x.couponDiscount;
    })

    length=orders.length

        console.log(salesData)
        res.render('salesReport',{salesData,sum,totalOffer,length})

    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
}
///**************** */
const sales_report = async(req,res)=>{

    const { sort, filterDate } = req.query;

    let filter = {};
  
    if (filterDate) {
      const startOfDay = moment(filterDate).startOf('day').toDate();
      const endOfDay = moment(filterDate).endOf('day').toDate();
      filter.orderDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (sort === 'day') {
      const today = moment().startOf('day');
      const tomorrow = moment().endOf('day');
      filter.orderDate = { $gte: today.toDate(), $lte: tomorrow.toDate() };
    } else if (sort === 'week') {
      const startOfWeek = moment().startOf('isoWeek');
      const endOfWeek = moment().endOf('isoWeek');
      filter.orderDate = { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() };
    } else if (sort === 'month') {
      const startOfMonth = moment().startOf('month');
      const endOfMonth = moment().endOf('month');
      filter.orderDate = { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() };
    }

    

    try {


        const orders = await Order.find()
        let sum,totalOffer,length
      sum =0
        totalOffer = 0
     orders.forEach((x)=>{
         sum += x.totalAmount;
         totalOffer+=x.couponDiscount;
     })

     length=orders.length

        
        const salesData = await Order.find(filter).sort({ orderDate: -1 }).exec();
        
        res.render('salesReport', { salesData ,sum,totalOffer,length});

    } catch (error) {
        console.log(error.message);
        res.redirect('/errorPage')
        
    }
}

//***************  PDF  *********************/

const pdf = async (req, res) => {
  try {
    const salesData = await Order.find();

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const filename = `sales_report_${Date.now()}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Header Section with Company Info
    doc.rect(30, 30, 540, 70).fill('#f5f5f5');
    doc.fillColor('#000').fontSize(16).text('ArmorEdge Sales Report', 50, 50);
    doc.fontSize(8).text('Phone: 9285888432 | Email: armoredge@gmail.com', 50, 70);
    doc.fontSize(10).text(`Report Date: ${new Date().toLocaleDateString()}`, 400, 70, { align: 'right' });

    // Line separator
    doc.moveTo(30, 110).lineTo(570, 110).stroke();

    // Title Section
    doc.fontSize(12).text('Sales Report', 30, 130, { align: 'center' }).moveDown(1);

    // Table Headers
    const tableTop = 150;
    const columnWidths = [30, 120, 70, 70, 60, 80, 80];
    const headers = ['S.No', 'Order ID', 'Amount', 'Discount', 'Status', 'Method', 'Date'];

    headers.forEach((header, i) => {
      doc.fontSize(10).font('Helvetica-Bold').text(
        header,
        30 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
        tableTop,
        { width: columnWidths[i], align: 'center' }
      );
    });

    // Line separator for table header
    doc.moveTo(30, tableTop + 15).lineTo(570, tableTop + 15).stroke();

    // Table Rows
    let startY = tableTop + 20;
    let totalAmount = 0;
    let totalDiscount = 0;

    salesData.forEach((item, index) => {
      const generatedOrderId = `ORD-${uuidv4().split('-')[0].toUpperCase()}`; // Generate a custom order ID
      const rowData = [
        index + 1,
        generatedOrderId, // Replace the existing order ID
        `${item.totalAmount.toFixed(2)}`,
        `${item.couponDiscount.toFixed(2)}`,
        item.paymentStatus,
        item.paymentMethod,
        new Date(item.orderDate).toLocaleDateString('en-US'),
      ];

      totalAmount += item.totalAmount;
      totalDiscount += item.couponDiscount;

      rowData.forEach((data, i) => {
        doc.fontSize(8).text(
          data,
          30 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
          startY,
          { width: columnWidths[i], align: 'center' }
        );
      });
      startY += 15;
    });

    // Line separator below table
    doc.moveTo(30, startY + 5).lineTo(570, startY + 5).stroke();

    // Summary Section
    startY += 5;
    doc.fontSize(10)
      .text(`Total Sales Amount: ${totalAmount.toFixed(2)}`, 400, startY, { align: 'right' })
      .text(`Total Discounts Given: ${totalDiscount.toFixed(2)}`, 400, startY + 15, { align: 'right' });

    // Footer Section
    startY += 35;
    doc.fontSize(8).text('Thank you for reviewing the sales report.', { align: 'center' });
    doc.text('For any inquiries, contact us at armoredge@gmail.com', { align: 'center' });

    // Finalize the PDF
    doc.end();

    console.log('Generating the Sales Report PDF with Custom Order IDs');
  } catch (error) {
    console.log('Error generating PDF:', error.message);
    res.redirect('/errorPage');
  }
};


//**********   excel  ************ */

const excel = async (req, res) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');
  
      const salesData = await Order.find();
  
      // Adding Report Title
      worksheet.mergeCells('A1:G1');
      worksheet.getCell('A1').value = 'ArmorEdge Sales Report';
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };
  
      // Adding Contact Information
      worksheet.mergeCells('A2:G2');
      worksheet.getCell('A2').value = 'Phone: 9285888432 | Email: armoredge@gmail.com';
      worksheet.getCell('A2').font = { size: 10, italic: true };
      worksheet.getCell('A2').alignment = { horizontal: 'center' };
  
      // Adding Report Date
      worksheet.mergeCells('A3:G3');
      worksheet.getCell('A3').value = `Report Date: ${new Date().toLocaleDateString()}`;
      worksheet.getCell('A3').font = { size: 10 };
      worksheet.getCell('A3').alignment = { horizontal: 'center' };
  
      // Adding a blank row for spacing
      worksheet.addRow([]);
  
      // Adding Table Headers Explicitly
      const headers = [
        'No',
        'Order ID',
        'Order Amount',
        'Coupon Discount',
        'Payment Status',
        'Payment Method',
        'Order Date',
      ];
  
      const headerRow = worksheet.addRow(headers);
  
      // Apply styling to the header row
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } }; // White text
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '000000' } }; // Black background
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(colNumber).width = headers[colNumber - 1].length + 5; // Set column width
      });
  
      // Adding Table Rows
      let totalAmount = 0;
      let totalDiscount = 0;
  
      salesData.forEach((item, index) => {
        const generatedOrderId = `ORD-${uuidv4().split('-')[0].toUpperCase()}`; // Generate a custom order ID
        worksheet.addRow([
          index + 1,
          generatedOrderId, // Replace the existing order ID
          item.totalAmount.toFixed(2),
          item.couponDiscount.toFixed(2),
          item.paymentStatus,
          item.paymentMethod,
          new Date(item.orderDate).toLocaleDateString(),
        ]);
  
        totalAmount += item.totalAmount;
        totalDiscount += item.couponDiscount;
      });
  
      // Adding Summary Rows
      worksheet.addRow([]); // Blank row for spacing
      worksheet.addRow(['', '', '', '', '', 'Total Sales Amount:', totalAmount.toFixed(2)]);
      worksheet.addRow(['', '', '', '', '', 'Total Discounts Given:', totalDiscount.toFixed(2)]);
  
      // Set Response Headers and Send File
      const filename = `sales_report_${Date.now()}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.log(error.message);
      res.redirect('/errorPage');
    }
  };
  










module.exports ={
    loadLogin,
    login,
    loadDashbord,
    logout,
    loadOrderList,
    editOrder,
    deleteOrder,
    updateStatus,
    getCoupen,
    add_Coupen,
    load_add_Coupen,
    load_edit_Coupen,
    edit_Coupen,
    delete_Coupen,
    salesReport,
    sales_report,
    pdf,
    excel

}