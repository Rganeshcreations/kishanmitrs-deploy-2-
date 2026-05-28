const express = require("express");
const router = express.Router();
const db = require("../db");
const sendEmail = require("../mailer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==============================
// TEMP OTP STORAGE
// ==============================

const otpStore = {};

console.log("📦 User routes loaded");

// ======================================================
// USER REGISTRATION
// ======================================================

router.post("/register",(req,res)=>{

const {name,email,password,role}=req.body;

console.log("📝 Registration attempt:", email, role);

const allowedRoles=["farmer","expert","government","public","admin"];

if(!name || !email || !password || !role){
return res.status(400).json({message:"All fields required"});
}

if(!allowedRoles.includes(role)){
return res.status(400).json({message:"Invalid role"});
}

const sql="SELECT * FROM users WHERE email=? AND role=?";

db.query(sql,[email,role],(err,results)=>{

if(err){
console.log("❌ DB Error:",err);
return res.status(500).json({message:"Database error"});
}

if(results.length>0){
console.log("⚠ Account already exists:", email);
return res.status(400).json({message:"Account already exists"});
}

const insertSql="INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)";

db.query(insertSql,[name,email,password,role],(err)=>{

if(err){
console.log("❌ Registration failed:",err);
return res.status(500).json({message:"Registration failed"});
}

console.log("✅ User registered:",email,role);

res.json({message:"User registered successfully"});

});

});

});

// ======================================================
// PASSWORD LOGIN
// ======================================================

router.post("/login",(req,res)=>{

const {email,password,role}=req.body;

console.log("🔐 Login attempt:",email,role);

if(!email || !password || !role){
return res.status(400).json({message:"Missing login fields"});
}

const sql="SELECT * FROM users WHERE email=? AND password=? AND role=?";

db.query(sql,[email,password,role],(err,results)=>{

if(err){
console.log("❌ Login DB error:",err);
return res.status(500).json({message:"Login failed"});
}

if(results.length===0){
console.log("❌ Invalid login:",email);
return res.status(401).json({message:"Invalid credentials"});
}

console.log("✅ Login success:",email);

checkProfile(results[0],res);

});

});

// ======================================================
// SEND OTP
// ======================================================

router.post("/send-otp",async(req,res)=>{

const {email}=req.body;

console.log("📩 OTP request for:",email);

if(!email){
return res.status(400).json({message:"Email required"});
}

const otp=Math.floor(100000+Math.random()*900000);

otpStore[email]=otp;

try{

await sendEmail(
email,
"KisanMitra Login OTP",
`<h2>Your OTP is ${otp}</h2>`
);

console.log("✅ OTP sent:",otp,"to",email);

res.json({message:"OTP sent successfully"});

}catch(err){

console.log("❌ OTP mail error:",err);

res.status(500).json({message:"Failed to send OTP"});

}

});

// ======================================================
// VERIFY OTP LOGIN
// ======================================================

router.post("/verify-otp",(req,res)=>{

const {email,otp,role}=req.body;

console.log("🔢 OTP verification:",email);

if(!email || !otp || !role){
return res.status(400).json({message:"Missing fields"});
}

if(otpStore[email] != otp){
console.log("❌ Wrong OTP:",email);
return res.status(401).json({message:"Invalid OTP"});
}

const sql="SELECT * FROM users WHERE email=? AND role=?";

db.query(sql,[email,role],(err,results)=>{

if(err){
console.log("❌ OTP DB error:",err);
return res.status(500).json({message:"Database error"});
}

if(results.length===0){
return res.status(404).json({message:"User not found"});
}

delete otpStore[email];

console.log("✅ OTP login success:",email);

checkProfile(results[0],res);

});

});

// ======================================================
// CHECK PROFILE
// ======================================================

function checkProfile(user,res){

let sql=null;

if(user.role==="farmer"){
sql="SELECT * FROM farmer_profiles WHERE user_id=?";
}
else if(user.role==="expert"){
sql="SELECT * FROM expert_profiles WHERE user_id=?";
}
else if(user.role==="government"){
sql="SELECT * FROM government_profiles WHERE user_id=?";
}
else if(user.role==="public"){
sql="SELECT * FROM public_profiles WHERE user_id=?";
}

if(!sql){
return res.json({user,profileExists:true});
}

db.query(sql,[user.id],(err,result)=>{

if(err){
console.log("❌ Profile check error:",err);
return res.status(500).json({message:"Profile check failed"});
}

res.json({
user,
profileExists:result.length>0
});

});

}

// ======================================================
// FARMER PROFILE
// ======================================================

router.post("/farmer-profile",(req,res)=>{

const {user_id,crops,land_area,soil_type,location,irrigation_type}=req.body;

console.log("🌾 Saving farmer profile:",user_id);

const sql=`INSERT INTO farmer_profiles
(user_id,crops,land_area,soil_type,location,irrigation_type)
VALUES(?,?,?,?,?,?)`;

db.query(sql,[user_id,crops,land_area,soil_type,location,irrigation_type],(err)=>{

if(err){
console.log("❌ Farmer profile error:",err);
return res.status(500).json({message:"Failed to save farmer profile"});
}

console.log("✅ Farmer profile saved:",user_id);

res.json({message:"Farmer profile saved successfully"});

});

});
// =================================
// ADD CROP
// =================================

router.post("/add-crop",(req,res)=>{

const {user_id,crop_name,seeding_date,land_size} = req.body;

const sql = `
INSERT INTO crops
(user_id,crop_name,seeding_date,land_size)
VALUES (?,?,?,?)
`;

db.query(sql,[user_id,crop_name,seeding_date,land_size],(err,result)=>{

if(err){
console.log(err);
return res.status(500).json({message:"Failed to add crop"});
}

res.json({message:"Crop added successfully"});

});

});
// =================================
// GET SINGLE CROP (FINAL FIX)
// =================================
router.get("/get-crop/:crop_id",(req,res)=>{

const cropId = req.params.crop_id;

const sql = "SELECT * FROM crops WHERE id=?";

db.query(sql,[cropId],(err,result)=>{

if(err){
console.log("❌ DB error:",err);
return res.status(500).json({message:"Database error"});
}

if(result.length===0){
return res.status(404).json({message:"Crop not found"});
}

res.json(result[0]);

});

});




// =================================
// UPDATE PRODUCTION (CORRECT FIX)
// =================================
router.put("/update-production/:crop_id",(req,res)=>{

const cropId = req.params.crop_id;
const {quantity_produced,selling_price} = req.body;

const sql = `
UPDATE crops 
SET quantity_produced=?, selling_price=? 
WHERE id=?
`;

db.query(sql,[quantity_produced,selling_price,cropId],(err)=>{

if(err){
console.log("❌ Update error:", err);
return res.status(500).json({message:"Update failed"});
}

console.log("✅ Production updated:", cropId);

res.json({message:"Production updated successfully"});

});

});


// =================================
// ADD EXPENDITURE
// =================================
router.post("/add-expenditure",(req,res)=>{

const {crop_id,expense_category,description,total_amount,expense_date} = req.body;

const sql = `
INSERT INTO expenditures
(crop_id,expense_category,description,total_amount,expense_date)
VALUES (?,?,?,?,?)
`;

db.query(sql,[crop_id,expense_category,description,total_amount,expense_date],(err)=>{

if(err){
return res.status(500).json({message:"Failed to add expenditure"});
}

res.json({message:"Expenditure added successfully"});

});

});


// =================================
// GET EXPENDITURES BY CROP
// =================================
router.get("/get-expenditures/:crop_id",(req,res)=>{

const cropId = req.params.crop_id;

const sql = `
SELECT * FROM expenditures 
WHERE crop_id=? ORDER BY expense_date DESC
`;

db.query(sql,[cropId],(err,result)=>{

if(err){
return res.status(500).json({message:"Database error"});
}

res.json(result);

});

});


// =================================
// DASHBOARD SUMMARY (VERY IMPORTANT)
// =================================
router.get("/farmer-dashboard/:user_id",(req,res)=>{

const userId = req.params.user_id;

// 1. Get crops
const cropSql = "SELECT * FROM crops WHERE user_id=?";

db.query(cropSql,[userId],(err,crops)=>{

if(err){
return res.status(500).json({message:"Database error"});
}

if(crops.length===0){
return res.json({
totalCrops:0,
totalExpense:0,
totalRevenue:0,
profit:0
});
}

// Get crop IDs
const cropIds = crops.map(c=>c.id);

// 2. Get expenditures
const expSql = `
SELECT * FROM expenditures 
WHERE crop_id IN (?)
`;

db.query(expSql,[cropIds],(err,expenses)=>{

if(err){
return res.status(500).json({message:"Expense error"});
}

// CALCULATIONS

let totalExpense = 0;
expenses.forEach(e=>{
totalExpense += parseFloat(e.total_amount || 0);
});

let totalRevenue = 0;
crops.forEach(c=>{
totalRevenue += 
(c.quantity_produced || 0) * 
(c.selling_price || 0);
});

let profit = totalRevenue - totalExpense;

res.json({
totalCrops:crops.length,
totalExpense,
totalRevenue,
profit
});

});

});

});
// =================================
// GET FARMER PROFILE
// =================================

router.get("/farmer-profile/:user_id",(req,res)=>{

const userId = req.params.user_id;

const sql = `
SELECT * FROM farmer_profiles
WHERE user_id=?
`;

db.query(sql,[userId],(err,result)=>{

if(err){
console.log(err);
return res.status(500).json({message:"Database error"});
}

if(result.length===0){
return res.json({exists:false});
}

res.json({
exists:true,
crops:result[0].crops,
land_area:result[0].land_area,
soil_type:result[0].soil_type,
location:result[0].location
});

});

});
// =================================
// GET CROPS FOR FARMER
// =================================

router.get("/get-crops/:user_id",(req,res)=>{

const userId = req.params.user_id;

const sql = `
SELECT * FROM crops
WHERE user_id=?
ORDER BY id DESC
`;

db.query(sql,[userId],(err,result)=>{

if(err){
console.log(err);
return res.status(500).json({message:"Database error"});
}

res.json(result);

});

});
// ======================================================
// public PROFILE
router.post("/public-profile", (req, res) => {

  const { user_id, phone, location, interests } = req.body;

  console.log("Incoming Data:", user_id, phone, location, interests);

  if (!user_id || !phone || !location || !interests) {
    return res.status(400).json({ message: "All fields required" });
  }

  const sql = `
    INSERT INTO public_profiles (user_id, phone, location, interests)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [user_id, phone, location, interests], (err, result) => {

    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    console.log("✅ Profile inserted, ID:", result.insertId);

    res.json({ message: "Profile saved successfully" });

  });

});
// ======================================================
// get public PROFILE
// ======================================================
router.get("/public-profile/:id", (req, res) => {

  const userId = req.params.id;

  const sql = "SELECT * FROM public_profiles WHERE user_id = ?";

  db.query(sql, [userId], (err, result) => {

    if (err) return res.status(500).json({ message: "DB error" });

    if (result.length === 0)
      return res.status(404).json({ message: "Profile not found" });

    res.json(result[0]);

  });

});

// ======================================================
// SAVE EXPERT PROFILE
// ======================================================

router.post("/expert-profile",(req,res)=>{

const {user_id,specialization,experience,qualification,location,phone} = req.body;

console.log("👨‍🌾 Saving expert profile:",user_id);

const sql = `INSERT INTO expert_profiles
(user_id,specialization,experience,qualification,location,phone)
VALUES (?,?,?,?,?,?)`;

db.query(sql,[user_id,specialization,experience,qualification,location,phone],(err)=>{

if(err){
console.log("❌ Expert profile error:",err);
return res.status(500).json({message:"Failed to save expert profile"});
}

console.log("✅ Expert profile saved:",user_id);

res.json({message:"Expert profile saved successfully"});

});

});
// ======================================================
//  EXPERT PROFILE view
// ======================================================

router.get("/expert-profile/:user_id", (req, res) => {

const user_id = req.params.user_id;

console.log("📥 Fetching expert profile:", user_id);

db.query(
"SELECT * FROM expert_profiles WHERE user_id = ?",
[user_id],
(err, rows) => {

if(err){
console.log("❌ DB ERROR:", err);
return res.status(500).json({ error: "Database error" });
}

if(rows.length === 0){
console.log("⚠ No profile found");
return res.json({ exists: false });
}

console.log("✅ Profile found");

res.json({
exists: true,
...rows[0]
});

}
);

});




router.post("/government-profile",(req,res)=>{

const {user_id,department,district,phone,address}=req.body;

const sql=`INSERT INTO government_profiles
(user_id,department,district,phone,address)
VALUES (?,?,?,?,?)`;

db.query(sql,[user_id,department,district,phone,address],(err)=>{

if(err){
return res.status(500).json({message:"Failed to save profile"});
}

res.json({message:"Government profile saved successfully"});

});

});

// ADD GOVERNMENT SCHEME
// =================================

router.post("/add-scheme",(req,res)=>{

const {title,description,eligibility,official_link} = req.body;

const sql = `
INSERT INTO government_schemes
(title,description,eligibility,official_link,created_at)
VALUES (?,?,?,?,NOW())
`;

db.query(sql,[title,description,eligibility,official_link],(err,result)=>{

if(err){
console.log(err);
return res.status(500).json({message:"Failed to add scheme"});
}

res.json({message:"Scheme added successfully"});

});

});
// =================================
// APPLY FOR SCHEME
// =================================

router.post("/apply-scheme",(req,res)=>{

const {farmer_id,scheme_id} = req.body;

const sql = `
INSERT INTO scheme_applications
(farmer_id,scheme_id,status,applied_at)
VALUES (?,?, 'pending', NOW())
`;

db.query(sql,[farmer_id,scheme_id],(err)=>{

if(err){
console.log(err);
return res.status(500).json({message:"Application failed"});
}

res.json({message:"Application submitted successfully"});

});

});
// =================================
// ADD GOVERNMENT SCHEME
// =================================

router.post("/government/add-scheme",(req,res)=>{

const {title,description,eligibility,official_link} = req.body;

const sql=`
INSERT INTO government_schemes
(title,description,eligibility,official_link,created_at)
VALUES (?,?,?,?,NOW())
`;

db.query(sql,[title,description,eligibility,official_link],(err)=>{

if(err){
console.log(err);
return res.status(500).json({message:"Failed to add scheme"});
}

res.json({message:"Scheme added successfully"});

});

});


// =================================
// GET ALL GOVERNMENT SCHEMES
// =================================

router.get("/government/schemes",(req,res)=>{

const sql=`SELECT * FROM government_schemes ORDER BY created_at DESC`;

db.query(sql,(err,result)=>{

if(err){
console.log(err);
return res.status(500).json({message:"Database error"});
}

res.json(result);

});

});


// =================================
// FARMER APPLY FOR SCHEME
// =================================

router.post("/farmer/apply-scheme",(req,res)=>{

const {farmer_id,scheme_id}=req.body;

const sql=`
INSERT INTO scheme_applications
(farmer_id,scheme_id,status,applied_at)
VALUES(?,?, 'pending', NOW())
`;

db.query(sql,[farmer_id,scheme_id],(err)=>{

if(err){
console.log(err);
return res.status(500).json({message:"Application failed"});
}

res.json({message:"Application submitted successfully"});

});

});

// ======================================================
// GET ALL EXPERTS
// ======================================================

router.get("/experts",(req,res)=>{

console.log("📋 Loading expert list");

const sql=`SELECT 
users.id,
users.name,
expert_profiles.specialization,
expert_profiles.experience,
expert_profiles.qualification,
expert_profiles.location
FROM users
JOIN expert_profiles 
ON users.id = expert_profiles.user_id
WHERE users.role='expert'`;

db.query(sql,(err,result)=>{

if(err){
console.log("❌ Expert list error:",err);
return res.status(500).json({message:"Database error"});
}

res.json(result);

});

});

// ======================================================
// FARMER ASK QUESTION
// ======================================================

router.post("/ask-question",(req,res)=>{

const {farmer_id,expert_id,question}=req.body;

console.log("🌾 Farmer",farmer_id,"asked expert",expert_id);
console.log("❓ Question:",question);

const sql=`INSERT INTO questions (farmer_id,expert_id,question,status)
VALUES (?,?,?,'pending')`;

db.query(sql,[farmer_id,expert_id,question],(err,result)=>{

if(err){
console.log("❌ Question insert error:",err);
return res.status(500).json({message:"Failed to submit question"});
}

res.json({
message:"Question submitted successfully",
question_id:result.insertId
});

});

});

// ======================================================
// FARMER VIEW QUESTIONS
// ======================================================

router.get("/farmer-questions/:farmer_id",(req,res)=>{

const farmerId = req.params.farmer_id;

console.log("📩 Loading farmer questions:",farmerId);

const sql = `SELECT 
questions.id,
questions.question,
questions.status,
answers.answer,
users.name AS expert_name
FROM questions
LEFT JOIN answers ON questions.id = answers.question_id
LEFT JOIN users ON questions.expert_id = users.id
WHERE questions.farmer_id = ?
ORDER BY questions.id DESC`;

db.query(sql,[farmerId],(err,result)=>{

if(err){
console.log("❌ Farmer question error:",err);
return res.status(500).json({message:"Database error"});
}

res.json(result);

});

});

// ======================================================
// EXPERT VIEW QUESTIONS
// ======================================================

router.get("/expert-questions/:expert_id",(req,res)=>{

const expertId = req.params.expert_id;

console.log("📨 Expert",expertId,"loading questions");

const sql = `SELECT 
questions.id,
questions.question,
questions.status,
users.name AS farmer_name,
answers.answer
FROM questions
JOIN users ON questions.farmer_id = users.id
LEFT JOIN answers ON questions.id = answers.question_id
WHERE questions.expert_id = ?
ORDER BY questions.id DESC`;

db.query(sql,[expertId],(err,result)=>{

if(err){
console.log("❌ Expert question error:",err);
return res.status(500).json({message:"Database error"});
}

res.json(result);

});

});

// ======================================================
// EXPERT ANSWER QUESTION
// ======================================================

router.post("/answer-question",(req,res)=>{

const {question_id,expert_id,answer}=req.body;

console.log("👨‍🌾 Expert",expert_id,"answered question",question_id);
console.log("💬 Answer:",answer);

const sql="INSERT INTO answers (question_id,expert_id,answer) VALUES (?,?,?)";

db.query(sql,[question_id,expert_id,answer],(err)=>{

if(err){
console.log("❌ Answer save error:",err);
return res.status(500).json({message:"Failed to save answer"});
}

db.query("UPDATE questions SET status='answered' WHERE id=?",[question_id]);

res.json({message:"Answer submitted successfully"});

});

});

// ======================================================
// AI FARMING CHAT
// ======================================================

router.post("/ai-chat", async (req,res)=>{

const { message } = req.body;

console.log("🤖 AI question:",message);

if(!message){
return res.status(400).json({ message:"Message required" });
}

try{

const model = genAI.getGenerativeModel({
model: "gemini-2.0-flash"
});

const result = await model.generateContent(
`You are an agriculture expert helping farmers.

Give simple practical advice about soil problems, fertilizers, irrigation, pests and crop diseases.

Farmer question: ${message}`
);

const reply = result.response.text();

console.log("🤖 AI reply generated");

res.json({ reply });

}
catch(error){

console.log("❌ Gemini Error:",error);

res.status(500).json({
reply:"AI service error"
});

}

});

module.exports = router;


