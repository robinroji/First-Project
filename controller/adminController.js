const User = require('../model/userModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const moment = require('moment')
const Order = require('../model/orderModel')
const Coupen = require('../model/coupenModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Product = require('../model/productModel')

//************** ADMIN  GET LOGIN  *************/

const loadLogin = (req,res)=>{

try {

    if(req.session.admin){
        return res.redirect ('/admin/dashboard');
    }
    return res.render('login',{message:null});


    
} catch (error) {
    console.log(error.message);
    return res.redirect('/errorpage');
    
    
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
      { $unwind: "$productDetails" } , { $limit: 10 },
  ]);
  

    const bestCategory = await Order.aggregate([{$unwind:'$items'},{$group:{_id:'$items.category',bestProducts:{$sum:'$items.quantity'}}},{$sort:{bestProducts:-1}},
        {$lookup:{
            from:'categories',
            localField:'_id',
            foreignField:'_id',
            as:'categoryDetails'

        }} ,
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
////********************************* */
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
///********************************** */
const loadOrderList = async (req, res) => {
    try {
        
        const itemsPerPage = 10;

        const currentPage = parseInt(req.query.page) || 1;

        const skip = (currentPage - 1) * itemsPerPage;

        const orders = await Order.find()
            .skip(skip)  
            .limit(itemsPerPage)  
            .populate('user')  
            .populate('shippingAddress')  
            .sort({ createdAt: -1 });  

        const totalOrders = await Order.countDocuments();

        const totalPages = Math.ceil(totalOrders / itemsPerPage);

        res.render('orderPage', {
            orders,
            currentPage,
            totalPages
        });

    } catch (error) {
        console.log(error.message);
        // res.status(500).send('Server Error');
        return res.redirect('/errorpage');
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
        return res.redirect('/errorpage');
        
        
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
        return res.redirect('/errorpage');
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
        return res.redirect('/errorpage');
        
        
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
const salesReport = async (req, res) => {
    try {
        let sort = null
       let  filterEndDate = null
       let filterStartDate = null
       let orderStatus = null
      console.log('Getting the sales report');
      let filterDate = null
  
      // 1. Get query parameters for pagination
      const page = parseInt(req.query.page) || 1; // Current page (default: 1)
      const limit = parseInt(req.query.limit) || 10; // Records per page (default: 10)
  
      // 2. Fetch paginated data with sorting (most recent first)
      const salesData = await Order.find()
        .sort({ orderDate: -1 }) // Sort by orderDate in descending order (most recent first)
        .skip((page - 1) * limit)
        .limit(limit);
  
        console.log('the original sales data is ',salesData)
      // 3. Calculate total orders and other aggregations
      const orders = await Order.find(); // Fetch all orders to compute totals
      let sum = 0;
      let totalOffer = 0;
  
      orders.forEach((x) => {
        sum += x.totalAmount;
        totalOffer += x.couponDiscount;
      });
  
      const length = orders.length;
  
      // 4. Calculate total pages
      const totalPages = Math.ceil(length / limit);
  
      res.render('salesReport', {
        salesData,
        sum,
        totalOffer,
        length,
        currentPage: page,
        totalPages,
        limit,
        filterDate,
        sort,
        filterEndDate,
        filterStartDate,
        orderStatus 
      });
  
    } catch (error) {
      console.log(error.message);
      res.redirect('/errorPage');
    }
  };
  
  
////********* */

const sales_report_filter = async (req, res) => {
  const {sort,filterStartDate,filterEndDate,filterDate,orderStatus,rangesortStart,rangesortEnd} = req.query;

  console.log('the sales report filter is ',filterStartDate)
  console.log('the orderstatus is ',orderStatus)


  console.log('sort is ',sort)


const Status = orderStatus
console.log('ssssttt',Status);


  let filter = {};

  // Apply the date filter if a specific date is selected
  if (filterStartDate) {
    const rangesortStart = moment(filterStartDate).startOf('day').toDate();
    const rangesortEnd = moment(filterEndDate).endOf('day').toDate();
    filter.orderDate = { $gte: rangesortStart, $lte: rangesortEnd };
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
  if (orderStatus) {
    filter.orderStatus = orderStatus;
    console.log('Order status filter applied:', orderStatus);
  }


  try {
    // Pagination logic
    const page = parseInt(req.query.page) || 1; // Current page (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Records per page (default: 10)
    

    // Calculate total records matching filter
    const totalOrders = await Order.countDocuments(filter);

    // Fetch paginated data using skip and limit
    const salesData = await Order.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ orderDate: -1 })
      .exec();

    // Calculate summary
    let sum = 0;
    let totalOffer = 0;
    salesData.forEach((x) => {
      sum += x.totalAmount;
      totalOffer += x.couponDiscount;
    });


    console.log('current filter is',salesData)
    const length = totalOrders; // Total records

    // Calculate total pages
    const totalPages = Math.ceil(length / limit);

    // Render the sales report with pagination data
    res.render('salesReport', {
      salesData,
      sum,
      totalOffer,
      length,
      currentPage: page,
      totalPages,
      limit,
      filterStartDate,
      filterEndDate,
      sort,
      filterDate,
      orderStatus: Status // Passing orderStatus to the view

    });
  } catch (error) {
    console.log(error.message);
    res.redirect('/errorPage');
  }
};


//***************  PDF  *********************/
const pdf = async (req, res) => {
    try {
        const { sort, filterStartDate, filterEndDate, orderStatus } = req.query;
        let filter = {};

        // Apply order status filter
        if (orderStatus) {
            filter.orderStatus = orderStatus;
        }

        // Apply date filter
        if (filterStartDate) {
            const rangeStart = moment(filterStartDate).startOf('day').toDate();
            const rangeEnd = moment(filterEndDate).endOf('day').toDate();
            filter.orderDate = { $gte: rangeStart, $lte: rangeEnd };
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

        console.log('PDF filter:', filter);
        const salesData = await Order.find(filter).sort({ orderDate: -1 }); // Sort orders by latest first

        console.log('PDF salesData:', salesData);

        // Sales summary calculations
        let totalOrders = salesData.length;
        let totalDiscount = salesData.reduce((sum, order) => sum + (order.couponDiscount || 0), 0);
        let totalPrice = salesData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Generate date range text
        let dateRangeText = '';
        if (filterStartDate && filterEndDate) {
            dateRangeText = `Date Range: ${new Date(filterStartDate).toLocaleDateString('en-US')} - ${new Date(filterEndDate).toLocaleDateString('en-US')}`;
        } else if (sort === 'day') {
            dateRangeText = `Date Range: ${moment().startOf('day').format('MM/DD/YYYY')} - ${moment().endOf('day').format('MM/DD/YYYY')}`;
        } else if (sort === 'week') {
            dateRangeText = `Date Range: ${moment().startOf('isoWeek').format('MM/DD/YYYY')} - ${moment().endOf('isoWeek').format('MM/DD/YYYY')}`;
        } else if (sort === 'month') {
            dateRangeText = `Date Range: ${moment().startOf('month').format('MM/DD/YYYY')} - ${moment().endOf('month').format('MM/DD/YYYY')}`;
        }

        const doc = new PDFDocument({ margin: 30 });
        const filename = `sales_report_${Date.now()}.pdf`;

        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/pdf');

        doc.pipe(res);

        // Title
        doc.fontSize(18).text('Sales Report', { align: 'center' }).moveDown(1);

        // Add Date Range and Order Status (if applied)
        if (dateRangeText) {
            doc.fontSize(12).font('Helvetica').text(dateRangeText, { align: 'center' }).moveDown(0.5);
        }
        if (orderStatus) {
            doc.fontSize(12).font('Helvetica').text(`Order Status: ${orderStatus}`, { align: 'center' }).moveDown(1);
        }

        // Table Headers
        const headers = ['No', 'Order ID', 'Amount', 'Discount', 'Payment Status', 'Method', 'Date'];
        const columnWidths = [30, 90, 80, 80, 80, 100, 100];
        let startY = doc.y + 10;
        let startX = doc.page.margins.left;

        doc.fontSize(10).fillColor('black').font('Helvetica-Bold');
        headers.forEach((header, i) => {
            doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), startY, {
                width: columnWidths[i],
                align: 'center',
            });
        });

        // Line below headers
        doc
            .moveTo(startX, startY + 12)
            .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), startY + 12)
            .stroke();

        // Table Rows
        doc.font('Helvetica').fontSize(9);
        startY += 15;

        salesData.forEach((item, index) => {
            if (startY > doc.page.height - 100) {
                doc.addPage(); // Add a new page if content exceeds page height
                startY = doc.page.margins.top;
            }

            const customOrderID = item.customOrderId;
            const rowData = [
                index + 1,
                customOrderID,
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
            startY += 12;
        });

        // Sales Summary Section
        startY += 20;
        doc.fontSize(12).font('Helvetica-Bold').text('Sales Summary', startX, startY);
        startY += 15;
        doc.fontSize(10).font('Helvetica');

        if (dateRangeText) {
            doc.text(dateRangeText, startX, startY);
            startY += 12;
        }

        if (orderStatus) {
            doc.text(`Order Status: ${orderStatus}`, startX, startY);
            startY += 12;
        }

        doc.text(`Total Orders: ${totalOrders}`, startX, startY);
        startY += 12;
        doc.text(`Total Discounts: ${totalDiscount.toFixed(2)}`, startX, startY);
        startY += 12;
        doc.text(`Total Price: ${totalPrice.toFixed(2)}`, startX, startY);

        // Finalize PDF
        doc.end();
        console.log('Generating the PDF report');
    } catch (error) {
        console.log('Error generating PDF:', error.message);
        res.redirect('/errorPage');
    }
};








//**********   excel  ************ */
const excel = async (req, res) => {
    try {
        const { sort, filterStartDate, filterEndDate, orderStatus } = req.query;

        // Build the filter object
        let filter = {};
        if (orderStatus) {
            filter.orderStatus = orderStatus;
        }

        // Date filter logic
        let dateRangeText = "";
        if (filterStartDate && filterEndDate) {
            const startDate = new Date(filterStartDate);
            const endDate = new Date(filterEndDate);
            endDate.setHours(23, 59, 59, 999); // Include the entire end date
            filter.orderDate = { $gte: startDate, $lte: endDate };
            dateRangeText = `Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        } else if (sort === 'day') {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));
            filter.orderDate = { $gte: startOfDay, $lte: endOfDay };
            dateRangeText = `Date Range: ${startOfDay.toLocaleDateString()} - ${endOfDay.toLocaleDateString()}`;
        } else if (sort === 'week') {
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Start of week (Monday)
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6); // End of week (Sunday)
            endOfWeek.setHours(23, 59, 59, 999);

            filter.orderDate = { $gte: startOfWeek, $lte: endOfWeek };
            dateRangeText = `Date Range: ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
        } else if (sort === 'month') {
            const startOfMonth = new Date(new Date().setDate(1)); // First day of the current month
            const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1));
            endOfMonth.setDate(0); // Last day of the current month
            endOfMonth.setHours(23, 59, 59, 999);

            filter.orderDate = { $gte: startOfMonth, $lte: endOfMonth };
            dateRangeText = `Date Range: ${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`;
        }

        // Fetch filtered and sorted sales data
        const salesData = await Order.find(filter).sort({ orderDate: -1 }); // Sort by orderDate in descending order

        // Define workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Add title
        worksheet.mergeCells('A1:G1');
        worksheet.getCell('A1').value = 'Sales Report';
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        // Add date range
        worksheet.mergeCells('A2:G2');
        worksheet.getCell('A2').value = dateRangeText;
        worksheet.getCell('A2').font = { size: 12, italic: true };
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        // Define worksheet columns
        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Order ID', key: 'id', width: 20 },
            { header: 'Order Amount', key: 'amount', width: 15 },
            { header: 'Coupon Discount', key: 'discount', width: 15 },
            { header: 'Payment Status', key: 'status', width: 15 },
            { header: 'Payment Method', key: 'method', width: 15 },
            { header: 'Sales Report', key: 'date', width: 15 },
        ];

        // Add headers explicitly
        worksheet.addRow(); // Blank row for spacing
        worksheet.addRow({
            no: 'No',
            id: 'Order ID',
            amount: 'Order Amount',
            discount: 'Coupon Discount',
            status: 'Payment Status',
            method: 'Payment Method',
            date: 'Order Date',
        }).font = { bold: true };

        let totalOrderAmount = 0;
        let totalCouponDiscount = 0;

        // Populate rows with sorted sales data
        salesData.forEach((item, index) => {
            worksheet.addRow({
                no: index + 1,
                id: item.customOrderId,
                amount: item.totalAmount,
                discount: item.couponDiscount || 0,
                status: item.paymentStatus,
                method: item.paymentMethod,
                date: item.orderDate.toLocaleDateString(),
            });

            // Calculate totals
            totalOrderAmount += item.totalAmount || 0;
            totalCouponDiscount += item.couponDiscount || 0;
        });

        // Add a summary row
        worksheet.addRow({}); // Blank row for spacing
        worksheet.addRow({
            no: '',
            id: 'Total Summary',
            amount: totalOrderAmount,
            discount: totalCouponDiscount,
            status: '',
            method: '',
            date: '',
        });

        // Style the summary row
        const summaryRow = worksheet.lastRow;
        summaryRow.font = { bold: true };
        summaryRow.alignment = { horizontal: 'center' };

        // Set headers for file download
        const filename = `sales_report_${Date.now()}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

        // Write the Excel file to the response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error.message);
        res.redirect('/errorPage');
    }
};

//////********  chart data************ */

// Backend Route to Handle Chart Data Request
// const chartData = async (req, res) => {



    const getSalesData = async (startDate) => {
        const sales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }, // Filter orders starting from the given date
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by day
                    totalSales: { $sum: 1 }, // Count the total number of orders
                },
            },
            { $sort: { _id: 1 } }, // Sort by date
        ]);
    
        return {
            labels: sales.map((s) => s._id), // Date labels
            data: sales.map((s) => s.totalSales), // Sales count
        };
    };
    
    // Helper function to get aggregated revenue data
    const getRevenueData = async (startDate) => {
        const revenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }, // Filter orders starting from the given date
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by day
                    totalRevenue: { $sum: "$totalAmount" }, // Sum up the totalAmount field
                },
            },
            { $sort: { _id: 1 } }, // Sort by date
        ]);
    
        return {
            labels: revenue.map((r) => r._id), // Date labels
            data: revenue.map((r) => r.totalRevenue), // Revenue data
        };
    };
    
    // Controller for Chart Data
    const chartData = async (req, res) => {
        try {
            const { filter, startDate, endDate } = req.query; // Get filter and date range from the frontend
    
            console.log('Filter is:', filter);
    
            let start;
            let end = new Date(); // Default end date is now
    
            if (filter === 'daily') {
                start = new Date();
                start.setDate(start.getDate() - 1);
            } else if (filter === 'monthly') {
                start = new Date();
                start.setMonth(start.getMonth() - 1);
            } else if (filter === 'yearly') {
                start = new Date();
                start.setFullYear(start.getFullYear() - 1);
            } else if (filter === 'custom') {
                if (!startDate || !endDate) {
                    return res.status(400).json({ error: 'Custom date range requires startDate and endDate' });
                }
                start = new Date(startDate);
                end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // Ensure the end date covers the entire day
            } else {
                return res.status(400).json({ error: 'Invalid filter value' });
            }
    
            // Fetch sales and revenue data using helper functions and the determined start and end dates
            const salesData = await getSalesData(start, end);
            const revenueData = await getRevenueData(start, end);
    
            // Prepare response data
            const data = {
                labels: salesData.labels,
                salesData: salesData.data,
                revenueData: revenueData.data,
            };
    
            // Send JSON response
            res.json(data);
        } catch (error) {
            console.error('Error fetching chart data:', error.message);
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
    sales_report_filter,
    pdf,
    excel,
    chartData

}