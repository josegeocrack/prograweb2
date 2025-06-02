document.addEventListener("DOMContentLoaded", () => {
  const authForm = document.getElementById("auth-form")
  const authTitle = document.getElementById("auth-title")
  const authSubmit = document.getElementById("auth-submit")
  const authSwitchText = document.getElementById("auth-switch-text")
  const authSwitchLink = document.getElementById("auth-switch-link")
  const authMessage = document.getElementById("auth-message")
  const nameGroup = document.getElementById("name-group")
  const phoneGroup = document.getElementById("phone-group")

  let isLoginMode = true

  // Check if user is already logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null")
  if (currentUser) {
    window.location.href = "dashboard.html"
    return
  }

  // Switch between login and register
  authSwitchLink.addEventListener("click", (e) => {
    e.preventDefault()
    isLoginMode = !isLoginMode

    if (isLoginMode) {
      authTitle.textContent = "Login to Your Account"
      authSubmit.textContent = "Login"
      authSwitchText.innerHTML = 'Don\'t have an account? <a href="#" id="auth-switch-link">Register here</a>'
      nameGroup.style.display = "none"
      phoneGroup.style.display = "none"
      document.getElementById("name").required = false
      document.getElementById("phone").required = false
    } else {
      authTitle.textContent = "Create New Account"
      authSubmit.textContent = "Register"
      authSwitchText.innerHTML = 'Already have an account? <a href="#" id="auth-switch-link">Login here</a>'
      nameGroup.style.display = "block"
      phoneGroup.style.display = "block"
      document.getElementById("name").required = true
    }

    // Re-attach event listener to new switch link
    document.getElementById("auth-switch-link").addEventListener("click", arguments.callee)
    authMessage.textContent = ""
    authForm.reset()
  })

  // Handle form submission
  authForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const name = document.getElementById("name").value
    const phone = document.getElementById("phone").value

    if (isLoginMode) {
      handleLogin(email, password)
    } else {
      handleRegister(email, password, name, phone)
    }
  })

  function handleLogin(email, password) {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u) => u.email === email && u.password === password)

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user))
      showMessage("Login successful! Redirecting...", "success")
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1000)
    } else {
      showMessage("Invalid email or password", "error")
    }
  }

  function handleRegister(email, password, name, phone) {
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Check if user already exists
    if (users.some((u) => u.email === email)) {
      showMessage("User with this email already exists", "error")
      return
    }

    // Create new user
    const newUser = {
      id: "user-" + Date.now(),
      name: name,
      email: email,
      password: password,
      phone: phone,
      role: "user",
      joinDate: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))
    localStorage.setItem("currentUser", JSON.stringify(newUser))

    showMessage("Registration successful! Redirecting...", "success")
    setTimeout(() => {
      window.location.href = "dashboard.html"
    }, 1000)
  }

  function showMessage(message, type) {
    authMessage.textContent = message
    authMessage.className = `auth-message ${type}`
  }
  // --- Cognito Hosted UI Login ---
  const cognitoDomain = "midominioclub.auth.us-east-1.amazoncognito.com";
  const clientId = "1n55rbomsfm6jar79eelg96j8d";
  const redirectUri = "https://ioi4h3txa2.execute-api.us-east-1.amazonaws.com/redirectBucket";
  const responseType = "code";
  const scopes = "openid+profile+email";

  function getCognitoLoginUrl() {
    return `https://${cognitoDomain}/login?client_id=${clientId}&response_type=${responseType}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }
  const cognitoBtn = document.getElementById("cognito-login-btn");
  if (cognitoBtn) {
    cognitoBtn.onclick = function() {
      window.location.href = getCognitoLoginUrl();
    };
  }
});

