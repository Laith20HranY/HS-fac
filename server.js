const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const ipRangeCheck = require('ip-range-check'); // Make sure to install this or implement your own IP range check










const app = express();

const port = 3000;


const mongoURI = 'mongodb://localhost:27017/HS_factory';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const workerSchema = new mongoose.Schema({
  Worker_id: { type: Number, required: true, unique: true },
  Worker_first_name: { type: String, required: true },
  Worker_last_name: { type: String, required: true },
  National_ID: { type: Number, required: true },
  DEP: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
});

const managerSchema = new mongoose.Schema({
  Manager_id: { type: Number, required: true, unique: true },
  Manager_first_name: { type: String, required: true },
  Manager_last_name: { type: String, required: true },
  National_ID: { type: Number, required: true },
  DEP: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
});

const dayOffSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeId: { type: Number, required: true },
  submitDate: { type: Date, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' }
});
// Define schema for salary increase requests
const salaryIncreaseSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeId: { type: Number, required: true },
  submitDate: { type: Date, required: true },
  expectedIncrease: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' } // Default status to "Pending"
});
const leaveSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeId: { type: Number, required: true },
  submitDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' }
});

const advancePaymentSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeId: { type: Number, required: true },
  submitDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  numberOfPayments: { type: Number, required: true },
  monthlyInstallment: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' }
});

const transferSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeId: { type: Number, required: true },
  submitDate: { type: Date, required: true },
  currentDepartment: { type: String, required: true },
  desiredDepartment: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' }
});
const salaryReviewSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeId: { type: Number, required: true },
  submitDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' }
});

const generalizationSchema = new mongoose.Schema({
  message: String,
  updatedAt: { type: Date, default: Date.now }
});


const orderSchema = new mongoose.Schema({
  product_id: String,
  machine_id: String,
  quantity: Number,
  order_date: Date,
  status: String, // Example: "Pending", "In Progress", "Completed"
  patch_num: Number,
});
const dpp1Schema = new mongoose.Schema({
  workerId: { type: String, required: true },
  machineId: { type: String, required: true },
  productId: { type: String, required: true },
  orderNum: { type: String, required: true },
  quantityProduced: { type: Number, required: true },
  machineSpeed: { type: Number, required: true },
  shift: { type: String, required: true },
  numOfWorkers: { type: Number, required: true },
  productionDetails: { type: String, required: true }
});


const dpp2Schema = new mongoose.Schema({
  workerId: { type: String, required: true },
  machineId: { type: String, required: true },
  productId: { type: String, required: true },
  orderNum: { type: String, required: true },
  fromTime: { type: Date, required: true },
  toTime: { type: Date, required: true },
  description: { type: String, required: true }
});







const Worker = mongoose.model('Worker', workerSchema, 'Workers');
const Manager = mongoose.model('Manager', managerSchema, 'Managers');
const DayOff = mongoose.model('DayOff', dayOffSchema, 'day_off');
const SalaryIncrease = mongoose.model('SalaryIncrease', salaryIncreaseSchema, 'salary_increase');
const Leave = mongoose.model('Leave', leaveSchema, 'leave');
const AdvancePayment = mongoose.model('AdvancePayment', advancePaymentSchema, 'advance_payment');
const Transfer = mongoose.model('Transfer', transferSchema, 'transfer');
const SalaryReview = mongoose.model('SalaryReview', salaryReviewSchema, 'salary_review');
const Generalization = mongoose.model('Generalization', generalizationSchema);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;



const Dpp1 = mongoose.model('Dpp1', dpp1Schema, 'production_report');

const Dpp2 = mongoose.model('Dpp2', dpp2Schema, 'Malfunction_report');










app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files from the "log in html" directory
app.use(express.static(path.join(__dirname, 'log in html')));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'log in html', 'h5.html')); // Change 'h5.html' if you rename the HTML file
});

// Route to check if a Worker ID exists
app.get('/workers/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const worker = await Worker.findOne({ Worker_id: id });
    if (worker) {
      res.status(200).json(worker);
    } else {
      res.status(404).json( 'Worker not found' );
    }
  } catch (err) {
    console.error('Error fetching worker:', err);
    res.status(500).json(  'Server error' );
  }
});

// Route to add a new worker
app.post('/workers', async (req, res) => {
  const { Worker_id, Worker_first_name, Worker_last_name, National_ID, DEP, email, password } = req.body;

  try {
    const existingWorker = await Worker.findOne({ Worker_id });
    if (existingWorker) {
      res.status(400).json( 'Worker ID already exists in the database.' );
    } else {
      const newWorker = new Worker({ Worker_id, Worker_first_name, Worker_last_name, National_ID, DEP, email, password });
      await newWorker.save();
      res.status(201).json( 'Worker added successfully, please return to Home!' );
    }
  } catch (err) {
    console.error('Error adding worker:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to add a new manager
app.post('/managers', async (req, res) => {
  const { Manager_id, Manager_first_name, Manager_last_name, National_ID, DEP, email, password } = req.body;

  try {
    const existingManager = await Manager.findOne({ Manager_id });
    if (existingManager) {
      res.status(400).json( 'Manager ID already exists in the database.' );
    } else {
      const newManager = new Manager({ Manager_id, Manager_first_name, Manager_last_name, National_ID, DEP, email, password });
      await newManager.save();
      res.status(201).json({ message: 'Manager added successfully, please return to Home!' });
    }
  } catch (err) {
    console.error('Error adding manager:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to reset password
app.post('/reset-password', async (req, res) => {
  const { employee_id, new_password, confirm_password } = req.body;

  if (new_password !== confirm_password) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    let employee = await Worker.findOne({ Worker_id: employee_id });
    if (employee) {
      employee.password = new_password;
      await employee.save();
      return res.status(200).json('Password updated successfully for worker' );
    }

    employee = await Manager.findOne({ Manager_id: employee_id });
    if (employee) {
      employee.password = new_password;
      await employee.save();
      return res.status(200).json( 'Password updated successfully for manager, please go to HOME!' );
    }

    res.status(404).json({ message: 'Employee not found' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

let managerOtps = {}; // { manager_id: { otp: '123456', expiresAt: timestamp } }
const allowedIP = '192.168.1.0/24';

// Function to generate OTP
function generateOtp() {
  return crypto.randomBytes(3).toString('hex');
}

// Function to update OTPs for managers every 30 seconds
function updateManagerOtps() {
  const managers = Object.keys(managerOtps);
  managers.forEach(manager_id => {
    const newOtp = generateOtp();
    managerOtps[manager_id] = { otp: newOtp, expiresAt: Date.now() + 30000 };
  });
}

// Initial OTP generation
setInterval(updateManagerOtps, 30000);

// Endpoint to get current OTP for a manager
app.get('/get-otp/:manager_id', (req, res) => {
  const manager_id = req.params.manager_id;
  const otpData = managerOtps[manager_id];
  if (otpData) {
    res.json(otpData);
  } else {
    res.status(404).json({ message: 'Manager not found' });
  }
});

// Route to serve manager page
app.get('/managerpage.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'managerpage.html'));
});





// Route to handle login
app.post('/login', async (req, res) => {
  const { employee_id, password } = req.body;

  // Check client IP
  const clientIp = req.ip;
  if (!ipRangeCheck(clientIp, allowedIP)) {
    return res.status(403).send('Access denied.');
  }

  try {
    // Check if the user is a worker or manager
    let employee = await Worker.findOne({ Worker_id: employee_id });
    if (!employee) {
      employee = await Manager.findOne({ Manager_id: employee_id });
    }

    if (employee && employee.password === password) {
      // Generate a new OTP
      const newOtp = crypto.randomBytes(3).toString('hex');
      otps[employee_id] = { otp: newOtp, expiresAt: Date.now() + 30 * 1000 }; // Valid for 30 seconds

      // Redirect user to OTP entry page
      return res.json({
        message: 'Please enter the OTP sent to the central device.',
        redirect: '/otp.html', // Redirect to OTP entry page
        employee_id, // Send employee ID to frontend
      });
    }

    // If login credentials are incorrect
    res.status(400).json({ message: 'Invalid employee ID or password' });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { employee_id, otp } = req.body;

  try {
    // Verify if the OTP exists and is valid
    const storedOtpData = otps[employee_id];
    if (!storedOtpData || Date.now() > storedOtpData.expiresAt) {
      delete otps[employee_id]; // Delete expired OTP
      return res.status(403).json({ message: 'OTP expired. Please login again.' });
    }

    if (storedOtpData.otp !== otp) {
      return res.status(403).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Delete OTP after successful verification
    delete otps[employee_id];

    // Determine user role and redirect accordingly
    const worker = await Worker.findOne({ Worker_id: employee_id });
    if (worker) {
      req.session.workerId = employee_id;
      return res.json({
        message: 'OTP verified. Login successful.',
        redirect: '/workergate.html', // Redirect to worker portal
      });
    }

    const manager = await Manager.findOne({ Manager_id: employee_id });
    if (manager) {
      req.session.managerId = employee_id;
      return res.json({
        message: 'OTP verified. Login successful.',
        redirect: '/managergate.html', // Redirect to manager portal
      });
    }

    res.status(403).json({ message: 'Access denied. Please login again.' });
  } catch (err) {
    console.error('Error during role determination:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get session worker ID
app.get('/get-session-worker-id', (req, res) => {
  if (req.session && req.session.workerId) {
    res.status(200).json({ employee_id: req.session.workerId });
  } else {
    res.status(404).json({ message: 'Session worker ID not found' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Add this route to get worker info by ID
app.get('/worker-info/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const worker = await Worker.findOne({ Worker_id: id });
    if (worker) {
      res.status(200).json(worker);
    } else {
      res.status(404).json({ message: 'Worker not found' });
    }
  } catch (err) {
    console.error('Error fetching worker info:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to handle day off form submission
app.post('/submit-dayoff', async (req, res) => {
  try {
    const { employeeName, employeeId, submitDate, startDate, endDate, reason } = req.body;
    const newDayOff = new DayOff({ employeeName, employeeId, submitDate, startDate, endDate, reason });
    await newDayOff.save();
    res.status(200).send('Day off request submitted successfully!');
  } catch (error) {
    console.error('Error submitting day off request:', error);
    res.status(500).send('Error submitting day off request');
  }
});
// Route to get all day off requests (any status)
app.get('/dayoff-requests', async (req, res) => {
  try {
    const dayOffRequests = await DayOff.find({});  // No filter for status
    res.status(200).json(dayOffRequests);
  } catch (error) {
    console.error('Error fetching day off requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/requests/:id', async (req, res) => {
  const { id } = req.params;

  console.log('Received delete request for ID:', id); // Log the received ID

  try {
    let result;
    result = await DayOff.findByIdAndDelete(id) ||
             await SalaryIncrease.findByIdAndDelete(id) ||
             await Leave.findByIdAndDelete(id) ||
             await AdvancePayment.findByIdAndDelete(id) ||
             await Transfer.findByIdAndDelete(id) ||
             await SalaryReview.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});





// Route to update the status of a request
app.put('/requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, type } = req.body;

  try {
    let request;
    if (type === 'DAY OFF') {
      request = await DayOff.findByIdAndUpdate(id, { status }, { new: true });
    } else if (type === 'Salary Increase') {
      request = await SalaryIncrease.findByIdAndUpdate(id, { status }, { new: true });
    } else if (type === 'Leave') {
      request = await Leave.findByIdAndUpdate(id, { status }, { new: true });
    } else if (type === 'Advance Payment') {
      request = await AdvancePayment.findByIdAndUpdate(id, { status }, { new: true });
    } else if (type === 'Transfer DEP') {
      request = await Transfer.findByIdAndUpdate(id, { status }, { new: true });
    } else if (type === 'Salary Review') {
      request = await SalaryReview.findByIdAndUpdate(id, { status }, { new: true });
    }

    if (request) {
      res.status(200).json(request);
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Route to handle submission of salary increase requests
app.post('/submit-salary-increase', async (req, res) => {
    const { employeeName, employeeId, submitDate, expectedIncrease, reason } = req.body;

    try {
        const newRequest = new SalaryIncrease({ employeeName, employeeId, submitDate, expectedIncrease, reason });
        await newRequest.save(); // Save request to database
        res.status(201).json('Request submitted successfully!');
    } catch (error) {
        console.error('Error saving request:', error);
        res.status(500).json({ message: 'Server error, please try again.' });
    }
});

// Route to retrieve all salary increase requests (pending, accepted, declined)
app.get('/salary-increase-requests', async (req, res) => {
    try {
        const requests = await SalaryIncrease.find();
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error retrieving requests:', error);
        res.status(500).json({ message: 'Server error, please try again.' });
    }
});
// Route to handle submission of leave requests
// Route to handle submission of leave requests
app.post('/submit-leave', async (req, res) => {
  const { employeeName, employeeId, submitDate, startTime, endTime, reason } = req.body;

  try {
    const newLeave = new Leave({ employeeName, employeeId, submitDate, startTime, endTime, reason });
    await newLeave.save();
    res.status(201).json( 'Leave request submitted successfully!' );
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({ message: 'Server error, please try again.' });
  }
});

// Route to retrieve all leave requests
app.get('/leave-requests', async (req, res) => {
  try {
    const requests = await Leave.find();
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error retrieving leave requests:', error);
    res.status(500).json({ message: 'Server error, please try again.' });
  }
});

// Route to update the status of a leave request
app.put('/leave-requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const leaveRequest = await Leave.findByIdAndUpdate(id, { status }, { new: true });
    if (leaveRequest) {
      res.status(200).json(leaveRequest);
    } else {
      res.status(404).json({ message: 'Leave request not found' });
    }
  } catch (error) {
    console.error('Error updating leave request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to handle submission of advance payment requests
app.post('/submit-advance-payment', async (req, res) => {
  const { employeeName, employeeId, submitDate, amount, numberOfPayments, monthlyInstallment, reason } = req.body;

  try {
    const newAdvancePayment = new AdvancePayment({ employeeName, employeeId, submitDate, amount, numberOfPayments, monthlyInstallment, reason });
    await newAdvancePayment.save();
    res.status(201).json( 'Advance payment request submitted successfully!' );
  } catch (error) {
    console.error('Error submitting advance payment request:', error);
    res.status(500).json({ message: 'Server error, please try again.' });
  }
});

// Route to retrieve all advance payment requests
app.get('/advance-payment-requests', async (req, res) => {
  try {
    const requests = await AdvancePayment.find();
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error retrieving advance payment requests:', error);
    res.status(500).json({ message: 'Server error, please try again.' });
  }
});


// Route to handle submission of transfer requests
app.post('/submit-transfer', async (req, res) => {
  const { employeeName, employeeId, submitDate, currentDepartment, desiredDepartment, reason } = req.body;

  try {
    const newTransfer = new Transfer({ employeeName, employeeId, submitDate, currentDepartment, desiredDepartment, reason });
    await newTransfer.save();
    res.status(201).json( 'Transfer request submitted successfully!' );
  } catch (error) {
    console.error('Error submitting transfer request:', error);
    res.status(500).json({ message: 'Server error, please try again.' });
  }
});

// Route to retrieve all transfer requests
app.get('/transfer-requests', async (req, res) => {
  try {
    const requests = await Transfer.find();
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error retrieving transfer requests:', error);
    res.status(500).json({ message: 'Server error, please try again.' });
  }
});

// Route to update the status of a transfer request
app.put('/transfer-requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const transferRequest = await Transfer.findByIdAndUpdate(id, { status }, { new: true });
    if (transferRequest) {
      res.status(200).json(transferRequest);
    } else {
      res.status(404).json({ message: 'Transfer request not found' });
    }
  } catch (error) {
    console.error('Error updating transfer request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//
// Route to handle submission of salary review requests
app.post('/submit-salary-review', async (req, res) => {
  const { employeeName, employeeId, submitDate, reason } = req.body;

  try {
    const newSalaryReview = new SalaryReview({ employeeName, employeeId, submitDate, reason });
    await newSalaryReview.save();
    res.status(201).json( 'Salary review request submitted successfully!' );
  } catch (error) {
    console.error('Error submitting salary review request:', error);
    res.status(500).json({ message: 'Server error, please try again.' });
  }
});

// Route to retrieve all salary review requests
app.get('/salary-review-requests', async (req, res) => {
  try {
    const requests = await SalaryReview.find();
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error retrieving salary review requests:', error);
    res.status(500).json({ message: 'Server error, please try again.' });
  }
});

// Route to update the status of a salary review request
app.put('/salary-review-requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const salaryReviewRequest = await SalaryReview.findByIdAndUpdate(id, { status }, { new: true });
    if (salaryReviewRequest) {
      res.status(200).json(salaryReviewRequest);
    } else {
      res.status(404).json({ message: 'Salary review request not found' });
    }
  } catch (error) {
    console.error('Error updating salary review request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// rout GENERALIZATION
app.post('/generalizations', async (req, res) => {
  const { message } = req.body;

  try {
    // Delete the old generalization
    await Generalization.deleteMany({});

    // Save the new generalization
    const newGeneralization = new Generalization({ message });
    await newGeneralization.save();

    res.status(200).send({ message: 'Generalization updated successfully!' });
  } catch (error) {
    res.status(500).send({ error: 'Error updating generalization.' });
  }
});
//  to get the current generalization
app.get('/generalizations', async (req, res) => {
  try {
    const generalization = await Generalization.findOne().sort({ updatedAt: -1 }); // Get the latest
    res.status(200).send(generalization);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching generalization.' });
  }
});

// Endpoint to create a new order
app.post('/submit-order', async (req, res) => {
  try {
    const { product_id, machine_id, quantity, order_date, status } = req.body;
    const newOrder = new Order({
      product_id,
      machine_id,
      quantity,
      order_date,
      status,
      patch_num: Math.floor(Math.random() * 1000)
    });
    await newOrder.save();
    res.status(201).json({ message: 'Production order added successfully', newOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error adding production order', error });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const filters = req.query;
    const orders = await Order.find(filters); // Assuming a MongoDB collection named `Order`
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
});


// Endpoint to delete an order by patch number
app.delete('/delete-order-by-patch/:patch_num', async (req, res) => {
  const { patch_num } = req.params;
  try {
    const deletedOrder = await Order.findOneAndDelete({ patch_num: patch_num });
    if (deletedOrder) {
      res.status(200).json({ message: 'Order deleted successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error });
  }
});
// Endpoint to update an order
app.put('/update-order/:patch_num', async (req, res) => {
  const { patch_num } = req.params;
  const updateFields = req.body;

  try {
    const order = await Order.findOne({ patch_num: patch_num });
    if (order) {
      const updatedOrder = await Order.findByIdAndUpdate(order._id, updateFields, { new: true });
      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

app.get('/orders', async (req, res) => {
  const { patch_num } = req.query;
  try {
    const orders = await Order.find({ patch_num });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});




// Endpoint to handle submission of dpp1 (Daily Production Report)
app.post('/submit-dpp1', async (req, res) => {
  const { workerId, machineId, productId, orderNum, quantityProduced, machineSpeed, shift, numOfWorkers, productionDetails } = req.body;

  try {
    // Save the dpp1 record to the database
    const newDpp1 = new Dpp1({
      workerId,
      machineId,
      productId,
      orderNum,
      quantityProduced,
      machineSpeed,
      shift,
      numOfWorkers,
      productionDetails
    });
    await newDpp1.save();

    // Find the corresponding order and update it
    const order = await Order.findOne({ product_id: productId, machine_id: machineId });
    if (order) {
      order.quantity -= quantityProduced;
      if (order.quantity <= 0) {
        order.status = "Completed";
        order.quantity = 0; // Ensure it doesn't go negative
      }
      await order.save();
    }

    res.status(200).json({ message: 'DPP1 submitted and order updated successfully!' });
  } catch (error) {
    console.error('Error submitting DPP1:', error); // Log the error to the console
    res.status(500).json({ message: 'Server error, please try again.', error: error.message }); // Include the error message in the response
  }
});



app.post('/submit-dpp2', async (req, res) => {
  const { workerId, machineId, productId, orderNum, fromTime, toTime, description } = req.body;

  try {
    // Save the dpp2 record to the database
    const newDpp2 = new Dpp2({
      workerId,
      machineId,
      productId,
      orderNum,
      fromTime,
      toTime,
      description
    });
    await newDpp2.save();

    res.status(200).json({ message: 'DPP2 submitted successfully!' });
  } catch (error) {
    console.error('Error submitting DPP2:', error); // Log the error to the console
    res.status(500).json({ message: 'Server error, please try again.', error: error.message }); // Include the error message in the response
  }
});

// New endpoint to fetch DPP1 data
app.get('/fetch-dpp1', async (req, res) => {
  try {
    const dpp1Data = await Dpp1.find();
    res.status(200).json(dpp1Data);
  } catch (error) {
    console.error('Error fetching DPP1 data:', error);
    res.status(500).json({ message: 'Server error, please try again.', error: error.message });
  }
});

// New endpoint to fetch DPP2 data
app.get('/fetch-dpp2', async (req, res) => {
  try {
    const dpp2Data = await Dpp2.find();
    res.status(200).json(dpp2Data);
  } catch (error) {
    console.error('Error fetching DPP2 data:', error);
    res.status(500).json({ message: 'Server error, please try again.', error: error.message });
  }
});


//Endpoint to delete a Dpp1 record
app.delete('/dpp1-records', async (req, res) => {
  const { productId, orderNum, quantityProduced } = req.body;
  console.log('Delete request received:', { productId, orderNum, quantityProduced });

  try {
    const result = await Dpp1.deleteOne({ productId, orderNum, quantityProduced });
    if (result.deletedCount === 0) {
      return res.status(404).send('Record not found');
    }
    console.log('Record deleted successfully:', result);
    res.status(200).send('Record deleted successfully');
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).send('Error deleting record');
  }
});

// Define the delete endpoint for Dpp2 records
app.delete('/dpp2-records', async (req, res) => {
  const { orderNum, description } = req.body;
  console.log('Delete request received:', { orderNum, description });

  try {
    const result = await Dpp2.deleteOne({ orderNum, description });
    if (result.deletedCount === 0) {
      return res.status(404).send('Record not found');
    }
    console.log('Record deleted successfully:', result);
    res.status(200).send('Record deleted successfully');
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).send('Error deleting record');
  }
});


// Route to delete a worker by Worker ID
app.delete('/workers/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const result = await Worker.findOneAndDelete({ Worker_id: id });
      if (result) {
          res.status(200).json({ message: 'Worker deleted successfully' });
      } else {
          res.status(404).json({ message: 'Worker not found' });
      }
  } catch (err) {
      console.error('Error deleting worker:', err);
      res.status(500).json({ message: 'Server error', error: err });
  }
});


// Route to get all workers
app.get('/workers', async (req, res) => {
  try {
      const workers = await Worker.find();
      res.status(200).json(workers);
  } catch (err) {
      console.error('Error fetching workers:', err);
      res.status(500).json({ message: 'Server error' });
  }
});














// Route to handle submission of maintenance team request (dpp3)
app.post('/submit-dpp3', async (req, res) => {
  const { name, email } = req.body; // Assuming these are the fields from the form
  const workerId = req.body.name; // Worker ID
  const machineId = req.body.email; // Machine ID

  // Set session to show notification
  req.session.maintenanceRequest = `There is a maintenance request on the machine ${machineId}.`;

  res.status(200).send('<script>alert("Maintenance request submitted successfully!"); window.location.href = "/dpp3.html";</script>');
});

// Route to get maintenance request notification
app.get('/get-session-maintenance-request', (req, res) => {
  if (req.session && req.session.maintenanceRequest) {
      res.status(200).json({ message: req.session.maintenanceRequest });
  } else {
      res.status(404).json({ message: '' });
  }
});








app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
