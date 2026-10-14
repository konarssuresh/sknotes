/* global window, Brand, Router, Icons */
(function () {
  function validateEmail(value) {
    value = (value || "").trim();
    if (!value) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Enter a valid email address.";
    return "";
  }

  function validatePassword(value) {
    if (!value) return "Password is required.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    return "";
  }

  function bindPasswordToggle(root, inputId, btnId) {
    var input = root.querySelector("#" + inputId);
    var btn = root.querySelector("#" + btnId);
    if (!input || !btn) return;
    btn.addEventListener("click", function () {
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-pressed", show ? "true" : "false");
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      btn.textContent = show ? "Hide" : "Show";
    });
  }

  function authShell(content) {
    return (
      '<div class="auth-page">' +
      '<div class="brand-lockup brand-lockup--center">' +
      Brand.logoFull(40) +
      "</div>" +
      '<div class="auth-card">' +
      content +
      "</div></div>"
    );
  }

  function googleLogo(size) {
    size = size || 20;
    return (
      '<svg class="auth-google__logo" xmlns="http://www.w3.org/2000/svg" width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>' +
      '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>' +
      '<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>' +
      '<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>' +
      "</svg>"
    );
  }

  function googleButton(id, label) {
    return (
      '<button type="button" class="btn btn-google" id="' +
      id +
      '">' +
      googleLogo(20) +
      "<span>" +
      label +
      "</span></button>"
    );
  }

  function authDivider() {
    return '<div class="auth-divider" role="separator"><span>or continue with email</span></div>';
  }

  function showAuthSuccess(root, title, message) {
    var card = root.querySelector(".auth-card");
    card.innerHTML = successBlock(title, message, "Continue to app");
    root.querySelector("#auth-continue").addEventListener("click", function () {
      Router.navigate("/");
    });
  }

  function successBlock(title, message, continueLabel) {
    return (
      '<div class="auth-success">' +
      "<h1>" +
      title +
      "</h1>" +
      "<p>" +
      message +
      "</p>" +
      '<button type="button" class="btn btn--primary" style="width:100%" id="auth-continue">' +
      (continueLabel || "Continue to app") +
      "</button></div>"
    );
  }

  function renderLogin() {
    return authShell(
      "<h1>Log in</h1>" +
        '<div id="auth-form-wrap">' +
        '<div id="auth-errors" class="auth-errors" role="alert" aria-live="polite" hidden></div>' +
        googleButton("login-google", "Sign in with Google") +
        authDivider() +
        '<form id="auth-login-form" novalidate>' +
        '<div class="auth-field">' +
        '<label for="login-email">Email</label>' +
        '<input class="input" type="email" id="login-email" name="email" autocomplete="email" required />' +
        '<p class="field-error" id="login-email-error" hidden></p></div>' +
        '<div class="auth-field">' +
        '<label for="login-password">Password</label>' +
        '<div class="auth-field__row">' +
        '<input class="input" type="password" id="login-password" name="password" autocomplete="current-password" required />' +
        '<button type="button" class="auth-field__toggle" id="login-password-toggle" aria-pressed="false" aria-label="Show password">Show</button>' +
        "</div>" +
        '<p class="field-error" id="login-password-error" hidden></p></div>' +
        '<button type="submit" class="btn btn--primary" style="width:100%;margin-top:8px">Log in</button>' +
        "</form>" +
        '<div class="auth-links">' +
        '<a href="#/forgot-password">Forgot password?</a>' +
        '<a href="#/signup">Create an account</a>' +
        "</div></div>"
    );
  }

  function renderSignup() {
    return authShell(
      "<h1>Sign up</h1>" +
        '<div id="auth-form-wrap">' +
        '<div id="auth-errors" class="auth-errors" role="alert" aria-live="polite" hidden></div>' +
        googleButton("signup-google", "Sign up with Google") +
        authDivider() +
        '<form id="auth-signup-form" novalidate>' +
        '<div class="auth-field">' +
        '<label for="signup-email">Email</label>' +
        '<input class="input" type="email" id="signup-email" name="email" autocomplete="email" required />' +
        '<p class="field-error" id="signup-email-error" hidden></p></div>' +
        '<div class="auth-field">' +
        '<label for="signup-password">Password</label>' +
        '<div class="auth-field__row">' +
        '<input class="input" type="password" id="signup-password" name="password" autocomplete="new-password" required />' +
        '<button type="button" class="auth-field__toggle" id="signup-password-toggle" aria-pressed="false" aria-label="Show password">Show</button>' +
        "</div>" +
        '<p class="field-error" id="signup-password-error" hidden></p></div>' +
        '<div class="auth-field">' +
        '<label for="signup-password-confirm">Confirm password</label>' +
        '<div class="auth-field__row">' +
        '<input class="input" type="password" id="signup-password-confirm" name="password-confirm" autocomplete="new-password" required />' +
        '<button type="button" class="auth-field__toggle" id="signup-confirm-toggle" aria-pressed="false" aria-label="Show password">Show</button>' +
        "</div>" +
        '<p class="field-error" id="signup-confirm-error" hidden></p></div>' +
        '<button type="submit" class="btn btn--primary" style="width:100%;margin-top:8px">Sign up</button>' +
        "</form>" +
        '<p class="auth-footer">Already have an account? <a href="#/login">Log in</a></p></div>'
    );
  }

  function renderForgotPassword() {
    return authShell(
      '<button type="button" class="auth-back" id="auth-forgot-back">' +
        Icons.chevronLeft +
        " Back to log in</button>" +
        "<h1>Reset password</h1>" +
        '<div id="auth-form-wrap">' +
        '<div id="auth-errors" class="auth-errors" role="alert" aria-live="polite" hidden></div>' +
        '<form id="auth-forgot-form" novalidate>' +
        '<div class="auth-field">' +
        '<label for="forgot-email">Email</label>' +
        '<input class="input" type="email" id="forgot-email" name="email" autocomplete="email" required />' +
        '<p class="field-error" id="forgot-email-error" hidden></p></div>' +
        '<button type="submit" class="btn btn--primary" style="width:100%">Send reset link</button>' +
        "</form></div>"
    );
  }

  function showFieldError(el, msg) {
    if (!el) return;
    if (msg) {
      el.textContent = msg;
      el.hidden = false;
    } else {
      el.textContent = "";
      el.hidden = true;
    }
  }

  function bindGoogleButton(root, buttonId, successTitle, successMessage) {
    var btn = root.querySelector("#" + buttonId);
    if (!btn) return;
    btn.addEventListener("click", function () {
      showAuthSuccess(root, successTitle, successMessage);
    });
  }

  function bindLogin(root) {
    bindGoogleButton(
      root,
      "login-google",
      "You're signed in",
      "Google sign-in is a demo only—no OAuth request was made and no data was sent."
    );
    bindPasswordToggle(root, "login-password", "login-password-toggle");
    var form = root.querySelector("#auth-login-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = root.querySelector("#login-email").value;
      var password = root.querySelector("#login-password").value;
      var emailErr = validateEmail(email);
      var passErr = validatePassword(password);
      showFieldError(root.querySelector("#login-email-error"), emailErr);
      showFieldError(root.querySelector("#login-password-error"), passErr);
      var banner = root.querySelector("#auth-errors");
      if (emailErr || passErr) {
        banner.textContent = "Please fix the errors below.";
        banner.hidden = false;
        return;
      }
      banner.hidden = true;
      showAuthSuccess(
        root,
        "You're signed in",
        "This is a demo—no account was created and nothing was sent over the network."
      );
    });
  }

  function bindSignup(root) {
    bindGoogleButton(
      root,
      "signup-google",
      "Account created (demo)",
      "Google sign-up is a demo only—no OAuth request was made and no account was created."
    );
    bindPasswordToggle(root, "signup-password", "signup-password-toggle");
    bindPasswordToggle(
      root,
      "signup-password-confirm",
      "signup-confirm-toggle"
    );
    var form = root.querySelector("#auth-signup-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = root.querySelector("#signup-email").value;
      var password = root.querySelector("#signup-password").value;
      var confirm = root.querySelector("#signup-password-confirm").value;
      var emailErr = validateEmail(email);
      var passErr = validatePassword(password);
      var confirmErr = password !== confirm ? "Passwords do not match." : "";
      showFieldError(root.querySelector("#signup-email-error"), emailErr);
      showFieldError(root.querySelector("#signup-password-error"), passErr);
      showFieldError(root.querySelector("#signup-confirm-error"), confirmErr);
      var banner = root.querySelector("#auth-errors");
      if (emailErr || passErr || confirmErr) {
        banner.textContent = "Please fix the errors below.";
        banner.hidden = false;
        return;
      }
      banner.hidden = true;
      showAuthSuccess(
        root,
        "Account created (demo)",
        "This prototype does not store passwords or create real accounts."
      );
    });
  }

  function bindForgotPassword(root) {
    var back = root.querySelector("#auth-forgot-back");
    if (back) {
      back.addEventListener("click", function () {
        Router.navigate("/login");
      });
    }
    var form = root.querySelector("#auth-forgot-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = root.querySelector("#forgot-email").value;
      var emailErr = validateEmail(email);
      showFieldError(root.querySelector("#forgot-email-error"), emailErr);
      var banner = root.querySelector("#auth-errors");
      if (emailErr) {
        banner.textContent = "Please fix the errors below.";
        banner.hidden = false;
        return;
      }
      banner.hidden = true;
      var card = root.querySelector(".auth-card");
      card.innerHTML = successBlock(
        "Check your email (demo)",
        "If an account existed, we would email a reset link. No email was sent.",
        "Back to log in"
      );
      root
        .querySelector("#auth-continue")
        .addEventListener("click", function () {
          Router.navigate("/login");
        });
    });
  }

  window.Auth = {
    renderLogin: renderLogin,
    renderSignup: renderSignup,
    renderForgotPassword: renderForgotPassword,
    bindLogin: bindLogin,
    bindSignup: bindSignup,
    bindForgotPassword: bindForgotPassword,
  };
})();
