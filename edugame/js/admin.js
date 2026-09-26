/* =========================================================================
   EduGame Hub — Admin (admin.js)
   Gerbang sederhana agar hanya ADMIN yang bisa mengelola materi.
   Catatan: ini gerbang lokal (PIN disimpan di perangkat), bukan keamanan
   tingkat server. PIN awal: "admin".
   ========================================================================= */
window.Admin = (function () {
  var PIN_KEY = "eduGameHub.adminPin.v1";
  var SESSION_KEY = "eduGameHub.adminUnlocked";
  var DEFAULT_PIN = "admin";

  // Hash ringan (djb2) -> hex. Bukan kriptografi, hanya agar PIN tak polos.
  function hash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h.toString(16);
  }

  function storedHash() {
    try { return localStorage.getItem(PIN_KEY) || hash(DEFAULT_PIN); }
    catch (e) { return hash(DEFAULT_PIN); }
  }
  function verify(pin) { return hash(String(pin)) === storedHash(); }
  function setPin(pin) { try { localStorage.setItem(PIN_KEY, hash(String(pin))); } catch (e) {} }

  function isUnlocked() {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) { return false; }
  }
  function unlock() { try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {} }
  function lock() { try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {} }

  function modal(inner) {
    var back = document.createElement("div");
    back.className = "modal-backdrop";
    back.innerHTML = '<div class="modal" style="max-width:460px">' + inner + '</div>';
    document.body.appendChild(back);
    back.close = function () { back.remove(); };
    back.addEventListener("click", function (e) { if (e.target === back) back.close(); });
    var x = back.querySelector(".modal-close");
    if (x) x.addEventListener("click", back.close);
    return back;
  }

  // Pastikan admin sudah login sebelum menjalankan aksi.
  function require(onOk) {
    if (isUnlocked()) { onOk(); return; }
    login(onOk);
  }

  function login(onOk) {
    var back = modal(
      '<div class="modal-head"><h2>🔐 Masuk Admin</h2><button class="modal-close">×</button></div>' +
      '<div class="modal-body">' +
        '<p class="page-sub" style="margin:0 0 14px">Pengelolaan materi hanya untuk admin. Masukkan PIN admin.</p>' +
        '<input class="fld" id="admPin" type="password" placeholder="PIN admin" autocomplete="off" style="margin-bottom:6px">' +
        '<div class="page-sub" id="admErr" style="font-size:14px;min-height:18px;color:var(--rose)"></div>' +
        '<div class="btn-row" style="justify-content:flex-end;margin-top:12px">' +
          '<button class="btn btn-ghost" id="admCancel">Batal</button>' +
          '<button class="btn btn-primary" id="admOk">Masuk</button>' +
        '</div>' +
      '</div>'
    );
    var input = back.querySelector("#admPin");
    setTimeout(function () { input.focus(); }, 50);
    function submit() {
      if (verify(input.value)) {
        unlock();
        try { sessionStorage.setItem("eduGameHub.adminKey", input.value); } catch (e) {}
        back.close(); UI.toast("Masuk sebagai admin 🔓", "good");
        if (onOk) onOk();
      } else {
        back.querySelector("#admErr").textContent = "PIN salah. Coba lagi.";
        input.value = ""; input.focus();
      }
    }
    back.querySelector("#admOk").addEventListener("click", submit);
    back.querySelector("#admCancel").addEventListener("click", back.close);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
  }

  function changePin(onDone) {
    var back = modal(
      '<div class="modal-head"><h2>🔑 Ganti PIN Admin</h2><button class="modal-close">×</button></div>' +
      '<div class="modal-body">' +
        '<label class="fld-lbl">PIN lama</label>' +
        '<input class="fld" id="pOld" type="password" autocomplete="off" style="margin-bottom:12px">' +
        '<label class="fld-lbl">PIN baru (min. 4 karakter)</label>' +
        '<input class="fld" id="pNew" type="password" autocomplete="off" style="margin-bottom:12px">' +
        '<label class="fld-lbl">Ulangi PIN baru</label>' +
        '<input class="fld" id="pNew2" type="password" autocomplete="off" style="margin-bottom:6px">' +
        '<div class="page-sub" id="pErr" style="font-size:14px;min-height:18px;color:var(--rose)"></div>' +
        '<div class="btn-row" style="justify-content:flex-end;margin-top:12px">' +
          '<button class="btn btn-ghost" id="pCancel">Batal</button>' +
          '<button class="btn btn-primary" id="pSave">Simpan</button>' +
        '</div>' +
      '</div>'
    );
    back.querySelector("#pSave").addEventListener("click", function () {
      var oldP = back.querySelector("#pOld").value;
      var n1 = back.querySelector("#pNew").value;
      var n2 = back.querySelector("#pNew2").value;
      var err = back.querySelector("#pErr");
      if (!verify(oldP)) { err.textContent = "PIN lama salah."; return; }
      if (n1.length < 4) { err.textContent = "PIN baru minimal 4 karakter."; return; }
      if (n1 !== n2) { err.textContent = "Ulangi PIN tidak cocok."; return; }
      setPin(n1); back.close(); UI.toast("PIN admin diperbarui 🔑", "good");
      if (onDone) onDone();
    });
    back.querySelector("#pCancel").addEventListener("click", back.close);
  }

  return {
    isUnlocked: isUnlocked, require: require, login: login,
    lock: lock, changePin: changePin
  };
})();
