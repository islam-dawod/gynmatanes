/* =========================================================
   EMX contact form -> Web3Forms (host-independent).
   Works on any static host (Hostinger now, Cloudflare later).
   Intercepts the Elementor form submit and sends via fetch.
   ========================================================= */
(function () {
  "use strict";

  var ACCESS_KEY = "c568a3df-a654-411b-9e77-72beaae56f74";
  var ENDPOINT = "https://api.web3forms.com/submit";

  function val(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? (el.value || "").trim() : "";
  }

  function msgBox(form) {
    var m = form.querySelector(".emx-form-msg");
    if (!m) {
      m = document.createElement("div");
      m.className = "emx-form-msg";
      m.setAttribute("role", "status");
      m.style.cssText = "margin-top:12px;font-weight:600;font-size:15px;line-height:1.5;";
      form.appendChild(m);
    }
    return m;
  }
  function say(form, text, color) {
    var m = msgBox(form);
    m.textContent = text;
    m.style.color = color;
  }

  function handle(e) {
    var form = e.target;
    if (!form || !form.classList || !form.classList.contains("elementor-form")) return;

    // stop Elementor's (broken on static) AJAX handler and the default POST
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    var name = val(form, "form_fields[name]");
    var email = val(form, "form_fields[email]");
    var phone = val(form, "form_fields[field_f7a3c16]");
    var reason = val(form, "form_fields[field_5eb2ef0]");

    if (!name || (!email && !phone)) {
      say(form, "נא למלא שם ולפחות דרך יצירת קשר אחת (טלפון או אימייל).", "#c62828");
      return;
    }

    var payload = {
      access_key: ACCESS_KEY,
      subject: 'פנייה חדשה מאתר ד"ר עמאד מטאנס',
      from_name: "אתר gynmatanes.com",
      name: name,
      email: email || "no-reply@gynmatanes.com",
      "טלפון": phone,
      "סיבת ייעוץ": reason,
      botcheck: ""
    };

    var btn = form.querySelector('button[type="submit"], .elementor-button');
    if (btn) btn.setAttribute("disabled", "disabled");
    say(form, "שולח…", "#555");

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.success) {
          say(form, "תודה! פנייתך נשלחה. ניצור איתך קשר בהקדם.", "#2e7d32");
          form.reset();
        } else {
          say(form, "אירעה שגיאה בשליחה. נסו שוב או צרו קשר טלפונית.", "#c62828");
        }
      })
      .catch(function () {
        say(form, "אירעה שגיאה בחיבור. נסו שוב מאוחר יותר.", "#c62828");
      })
      .then(function () { if (btn) btn.removeAttribute("disabled"); });
  }

  // capture phase so this runs before Elementor's delegated submit handler
  document.addEventListener("submit", handle, true);
})();
