const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

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
      res.status(404).json({ message: 'Worker not found' });
    }
  } catch (err) {
    console.error('Error fetching worker:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to add a new worker
app.post('/workers', async (req, res) => {
  const { Worker_id, Worker_first_name, Worker_last_name, National_ID, DEP, email, password } = req.body;

  try {
    const existingWorker = await Worker.findOne({ Worker_id });
    if (existingWorker) {
      res.status(400).json({ message: 'Worker ID already exists in the database.' });
    } else {
      const newWorker = new Worker({ Worker_id, Worker_first_name, Worker_last_name, National_ID, DEP, email, password });
      await newWorker.save();
      res.status(201).json({ message: 'Worker added successfully, please return to Home!' });
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
      res.status(400).json({ message: 'Manager ID already exists in the database.' });
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
      return res.status(200).json({ message: 'Password updated successfully for worker' });
    }

    employee = await Manager.findOne({ Manager_id: employee_id });
    if (employee) {
      employee.password = new_password;
      await employee.save();
      return res.status(200).json({ message: 'Password updated successfully for manager, please go to HOME!' });
    }

    res.status(404).json({ message: 'Employee not found' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to handle login
app.post('/login', async (req, res) => {
  const { employee_id, password } = req.body;

  try {
    // Check if the employee is a worker
    let employee = await Worker.findOne({ Worker_id: employee_id });
    if (employee && employee.password === password) {
      req.session.workerId = employee.Worker_id; // Set worker ID in session
      return res.json({ redirect: '/workergate.html' }); // Send JSON response
    }

    // Check if the employee is a manager
    employee = await Manager.findOne({ Manager_id: employee_id });
    if (employee && employee.password === password) {
      req.session.workerId = employee.Manager_id; // Set manager ID in session
      return res.json({ redirect: '/managergate.html' }); // Send JSON response
    }

    // If the employee ID or password is invalid
    res.status(400).json({ message: 'Invalid employee ID or password' });
  } catch (err) {
    console.error('Error during login:', err);
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
        res.status(201).json({ message: 'Request submitted successfully!' });
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
    res.status(201).json({ message: 'Leave request submitted successfully!' });
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
    res.status(201).json({ message: 'Advance payment request submitted successfully!' });
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
    res.status(201).json({ message: 'Transfer request submitted successfully!' });
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
    res.status(201).json({ message: 'Salary review request submitted successfully!' });
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
    const patch_num = Math.floor(Math.random() * 1000); // Generate a random patch number
    const newOrder = { 
      id: Date.now().toString(), 
      product_id, 
      machine_id, 
      quantity, 
      order_date, 
      status, 
      patch_num 
    };
    orders.push(newOrder); // Assuming `orders` is an in-memory array or database insert
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



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
