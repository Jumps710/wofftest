// script.js
let displayName = "";
let userId = "";
let base64Image = "";

document.addEventListener("DOMContentLoaded", function () {
  const reporterInput = document.getElementById("reporter");

  // WOFF初期化
  woff
    .init({ woffId: "8Fo2NCnUsmTkXxVSzJ5CNQ" })
    .then(() => {
      console.log("✅ WOFF初期化成功");

      if (!woff.isInClient()) {
        alert("このアプリはLINE WORKSアプリ内でのみ使用できます。");
        return;
      }

      return woff.getProfile();
    })
    .then((profile) => {
      if (profile) {
        console.log("👤 ユーザー情報取得:", profile);
        displayName = profile.displayName;
        userId = profile.userId;
        if (reporterInput) reporterInput.value = displayName;
      } else {
        console.warn("⚠ プロフィール取得に失敗");
      }
    })
    .catch((err) => {
      console.error("❌ WOFF初期化エラー:", err.code, err.message);
      alert("WOFFの初期化に失敗しました。");
    });
});


const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");
photoInput.addEventListener("change", () => {
  photoPreview.innerHTML = "";
  const file = photoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      base64Image = e.target.result.split(",")[1];
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.maxWidth = "100px";
      photoPreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});

// モーダル表示
const form = document.getElementById("accidentForm");
const modal = document.getElementById("modal");
const modalSummary = document.getElementById("modalSummary");
const closeModal = document.querySelector(".close");
const confirmBtn = document.getElementById("confirmSubmit");

const processingMessage = document.createElement("p");
processingMessage.innerText = "お待ちください・・・";
processingMessage.style.display = "none";
processingMessage.style.color = "red";
confirmBtn.parentNode.insertBefore(processingMessage, confirmBtn.nextSibling);

form.addEventListener("submit", e => {
  e.preventDefault();
  const date = form.date.value;
  const time = form.time.value;
  const details = form.details.value;
  const summary = `
    <p><strong>報告者:</strong> ${displayName}</p>
    <p><strong>発生日:</strong> ${date}</p>
    <p><strong>発生時刻:</strong> ${time}</p>
    <p><strong>詳細:</strong><br>${details}</p>
    <p><strong>写真:</strong><br>${base64Image ? '<img src="data:image/jpeg;base64,' + base64Image + '" style="max-width:100px;">' : 'なし'}</p>
  `;
  modalSummary.innerHTML = summary;
  modal.style.display = "block";
});

closeModal.onclick = () => (modal.style.display = "none");
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

confirmBtn.onclick = () => {
  confirmBtn.disabled = true;
  processingMessage.style.display = "block";

  const params = new URLSearchParams();
  params.append("title", "事故報告");
  params.append("reporter", displayName);
  params.append("userId", userId);
  params.append("date", form.date.value);
  params.append("time", form.time.value);
  params.append("details", form.details.value);
  if (base64Image) params.append("photo", base64Image);

  fetch("https://script.google.com/macros/s/AKfycbw2JTesE0pHAn0vx-wpOGVhvOUZxkfyegFfN1HtavDwY19sDAdtzu9lzGwFoSJWACzeeQ/exec", {
    method: "POST",
    body: params
  })
  .then(res => res.json())
  .then(json => {
    confirmBtn.disabled = false;
    processingMessage.style.display = "none";
    if (json.status === "success") {
      window.location.href = "result.html";
    } else {
      alert("送信に失敗しました。");
    }
  })
  .catch(err => {
    confirmBtn.disabled = false;
    processingMessage.style.display = "none";
    alert("送信中にエラーが発生しました。");
    console.error(err);
  });
