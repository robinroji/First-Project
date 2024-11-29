const User = require('../model/userModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const moment = require('moment')
const Order = require('../model/orderModel')
const Coupen = require('../model/coupenModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

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
                    return res.render('admin_Dashboard')
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
    res.render('admin_Dashboard')
    
   } catch (error) {
    console.log(error.messge);
    
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

const loadOrderList = async (req,res)=>{
    try {
        const orders = await Order.find().populate('user').populate('shippingAddress')
        console.log('Orders with populated user: ', orders);
        
        
        res.render('orderPage',{orders})
    } catch (error) {
        console.log(error.message);            
    }
}

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

    const doc = new PDFDocument();
    const filename = `sales_report_${Date.now()}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Sales Report', { align: 'center' }).moveDown(2);

    // Table Headers
    const headers = ['No', 'Order ID', 'Amount', 'Discount', 'Status', 'Method', 'Date'];
    const columnWidths = [20, 190, 80, 65, 80, 100, 100]; // Adjust column widths as needed

    let startY = doc.y;
    let startX = doc.page.margins.left;

    // Draw Header Row
    doc.fontSize(12).fillColor('black').font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), startY, {
        width: columnWidths[i],
        align: 'center',
      });
    });

    // Draw line below header
    doc
      .moveTo(startX, startY + 15)
      .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), startY + 15)
      .stroke();

    // Reset font for content
    doc.font('Helvetica');

    // Table Rows
    salesData.forEach((item, index) => {
      startY += 20;

      const rowData = [
        index + 1,
        item._id,
        `${item.totalAmount.toFixed(2)}`,
        `${item.couponDiscount.toFixed(2)}`,
        item.paymentStatus,
        item.paymentMethod,
        new Date(item.orderDate).toLocaleDateString('en-US'),
      ];

      rowData.forEach((data, i) => {
        doc.text(data, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), startY, {
          width: columnWidths[i],
          align: 'center',
        });
      });
    });

    // Finalize PDF
    doc.end();

    console.log('Generating the PDF report');
  } catch (error) {
    console.log('Error generating PDF:', error.message);
    res.redirect('/errorPage');
  }
};

//**********   excel  ************ */

const excel = async (req,res)=>{
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');
      
        const salesData = await Order.find()
        worksheet.columns = [
          { header: 'No', key: 'no', width: 5 },
          { header: 'Order ID', key: 'id', width: 20 },
          { header: 'Order Amount', key: 'amount', width: 15 },
          { header: 'Coupon Discount', key: 'discount', width: 15 },
          { header: 'Payment Status', key: 'status', width: 15 },
          { header: 'Payment Method', key: 'method', width: 15 },
          { header: 'Order Date', key: 'date', width: 15 },
        ];
      
        salesData.forEach((item, index) => {
          worksheet.addRow({
            no: index + 1,
            id: item._id,
            amount: item.totalAmount,
            discount: item.couponDiscount,
            status: item.paymentStatus,
            method: item.paymentMethod,
            date: item.orderDate.toLocaleDateString(),
          });
        });
      
        const filename = `sales_report_${Date.now()}.xlsx`;
      
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
        await workbook.xlsx.write(res);
        res.end();
     
      
    } catch (error) {
        console.log(error.message)
        res.redirect('/errorPage')
        
    }
}










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