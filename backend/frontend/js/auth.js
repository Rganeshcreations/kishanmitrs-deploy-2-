// =======================
// VALIDATION FUNCTIONS
// =======================

// Name Validation
function validateName() {
  const name = document.getElementById("name")?.value;
  const error = document.getElementById("nameError");

  if (!error) return;

  if (name.trim().length < 3) {
    error.innerText = "Name must be at least 3 characters";
  } else {
    error.innerText = "";
  }
}

// Email Validation
function validateEmail() {
  const email = document.getElementById("email")?.value;
  const error = document.getElementById("emailError");

  if (!error) return;

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(email)) {
    error.innerText = "Enter valid email like example@gmail.com";
  } else {
    error.innerText = "";
  }
}

// Password Validation
function validatePassword() {
  const password = document.getElementById("password")?.value;
  const error = document.getElementById("passwordError");

  if (!error) return;

  if (password.length < 6) {
    error.innerText = "Password must be at least 6 characters";
  } else {
    error.innerText = "";
  }
}

// Confirm Password
function checkConfirmPassword() {
  const password = document.getElementById("password")?.value;
  const confirm = document.getElementById("confirmPassword")?.value;
  const error = document.getElementById("confirmPasswordError");

  if (!error) return;

  if (password !== confirm) {
    error.innerText = "Passwords do not match";
  } else {
    error.innerText = "";
  }
}

// =======================
// REGISTER FUNCTION
// =======================
function registerUser() {

  const name = document.getElementById("name")?.value;
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;
  const confirm = document.getElementById("confirmPassword")?.value;
  const role = document.getElementById("role")?.value;

  const messageBox = document.getElementById("message");

  if (!name || !email || !password || !confirm || !role) {
    messageBox.innerText = "Please fill all fields";
    messageBox.style.color = "red";
    return;
  }

  if (password !== confirm) {
    messageBox.innerText = "Passwords do not match";
    messageBox.style.color = "red";
    return;
  }

  fetch("https://kishanmitrs-deploy-2-production.up.railway.app/api/users/register", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      name,
      email,
      password,
      role
    })

  })
  .then(res => res.json())
  .then(data => {

    messageBox.innerText = data.message;

    messageBox.style.color =
      data.message.includes("success") ? "green" : "red";

  })
  .catch(() => {

    messageBox.innerText = "Registration failed";
    messageBox.style.color = "red";

  });

}


// =======================
// LOGIN WITH PASSWORD
// =======================
function loginUser() {

  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;
  const messageBox = document.getElementById("message");

  if (!email || !password) {
    messageBox.innerText = "Please enter email and password";
    messageBox.style.color = "red";
    return;
  }

  fetch("https://kishanmitrs-deploy-2-production.up.railway.app/api/users/login", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      email,
      password
    })

  })
  .then(res => res.json())
  .then(data => handleLoginResponse(data))
  .catch(() => {

    messageBox.innerText = "Login failed";
    messageBox.style.color = "red";

  });

}


// =======================
// SEND OTP
// =======================
function sendOtp() {

  const email = document.getElementById("otpEmail")?.value;
  const messageBox = document.getElementById("message");

  if (!email) {
    messageBox.innerText = "Please enter email";
    messageBox.style.color = "red";
    return;
  }

  fetch("https://kishanmitrs-deploy-2-production.up.railway.app/api/users/send-otp", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({ email })

  })
  .then(res => res.json())
  .then(data => {

    messageBox.innerText = data.message;

    messageBox.style.color =
      data.message.includes("OTP sent") ? "green" : "red";

  })
  .catch(() => {

    messageBox.innerText = "Failed to send OTP";
    messageBox.style.color = "red";

  });

}


// =======================
// VERIFY OTP
// =======================
function verifyOtp() {

  const email = document.getElementById("otpEmail")?.value;
  const otp = document.getElementById("otp")?.value;
  const messageBox = document.getElementById("message");

  if (!email || !otp) {
    messageBox.innerText = "Enter email and OTP";
    messageBox.style.color = "red";
    return;
  }

  fetch("https://kishanmitrs-deploy-2-production.up.railway.app/api/users/verify-otp", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      email,
      otp
    })

  })
  .then(res => res.json())
  .then(data => handleLoginResponse(data))
  .catch(() => {

    messageBox.innerText = "OTP verification failed";
    messageBox.style.color = "red";

  });

}


// =======================
// HANDLE LOGIN REDIRECT
// =======================
function handleLoginResponse(data) {

  const messageBox = document.getElementById("message");

  if (!data.user) {
    messageBox.innerText = data.message;
    messageBox.style.color = "red";
    return;
  }

  localStorage.setItem("user", JSON.stringify(data.user));

  const user = data.user;

  // ===================
  // ADMIN
  // ===================
  if (user.role === "admin") {

    window.location.href = "admin";

  }

  // ===================
  // FARMER FLOW
  // ===================
  else if (user.role === "Farmer") {

    if (data.profileExists) {
      window.location.href = "farmer";
    } else {
      window.location.href = "farmer-profile";
    }

  }

  // ===================
  // EXPERT FLOW
  // ===================
  else if (user.role === "Expert") {

    if (data.profileExists) {
      window.location.href = "expert";
    } else {
      window.location.href = "expert-profile";
    }

  }

  // ===================
  // GOVERNMENT
  // ===================
  else if (user.role === "government") {

    window.location.href = "government";

  }

  // ===================
  // PUBLIC
  // ===================
  else {

    window.location.href = "public";

  }

}


// =======================
// SAVE FARMER PROFILE
// =======================
function saveFarmerProfile() {

  const crops = document.getElementById("crops")?.value.trim();
  const land_area = document.getElementById("land_area")?.value.trim();
  const soil_type = document.getElementById("soil_type")?.value.trim();
  const location = document.getElementById("location")?.value.trim();
  const irrigation_type = document.getElementById("irrigation_type")?.value.trim();

  const messageBox = document.getElementById("message");

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    messageBox.innerText = "User not logged in";
    messageBox.style.color = "red";
    return;
  }

  if (!crops || !land_area || !soil_type || !location) {
    messageBox.innerText = "Please fill all required fields";
    messageBox.style.color = "red";
    return;
  }

  fetch("https://kishanmitrs-deploy-2-production.up.railway.app/api/users/farmer-profile", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      user_id: user.id,
      crops,
      land_area,
      soil_type,
      location,
      irrigation_type
    })

  })
  .then(res => res.json())
  .then(data => {

    messageBox.innerText = data.message;

    messageBox.style.color =
      data.message.includes("success") ? "green" : "red";

    if (data.message.includes("success")) {

      setTimeout(() => {
        window.location.href = "farmer";
      }, 1200);

    }

  })
  .catch(() => {

    messageBox.innerText = "Error saving profile";
    messageBox.style.color = "red";

  });

}