const GAS_URL = "https://script.google.com/macros/s/AKfycbznzDDpmju3ZEGv0PzpQWeGY7Rnpxsc4cbUu0eohkD4gkGXVlw02hpHdoFpkRk7KxeLhg/exec";

const form = document.getElementById("entryForm");
const participantsSelect = document.getElementById("participants");
const participantFields = document.querySelectorAll(".participant-field");
const message = document.getElementById("message");
const seatStatus = document.getElementById("seatStatus");
const closeStatus = document.getElementById("closeStatus");
const formSection = document.getElementById("formSection");
const confirmSection = document.getElementById("confirmSection");
const confirmContent = document.getElementById("confirmContent");
const confirmBtn = document.getElementById("confirmBtn");
const backBtn = document.getElementById("backBtn");
const submitFinalBtn = document.getElementById("submitFinalBtn");
const statusBox = document.getElementById("statusBox");

function updateParticipantFields() {
  const count = Number(participantsSelect.value);
  const companionCount = count - 1;

  participantFields.forEach((field) => {
    const index = Number(field.dataset.index);
    const input = field.querySelector("input");

    if (index <= companionCount) {
      field.classList.remove("hidden");
      input.required = true;
    } else {
      field.classList.add("hidden");
      input.required = false;
      input.value = "";
    }
  });
}

participantsSelect.addEventListener("change", updateParticipantFields);
updateParticipantFields();

const formData = getFormData();

      function getFormData() {
        return {
          representativeName: document.getElementById("representativeName").value.trim(),
          phone: document.getElementById("phone").value.trim(),
          email: document.getElementById("email").value.trim(),
          address: document.getElementById("address").value.trim(),
          participants: document.getElementById("participants").value,
          participant1: document.getElementById("participant1").value.trim(),
          participant2: document.getElementById("participant2").value.trim(),
          participant3: document.getElementById("participant3").value.trim(),
        };
      }

      function renderConfirmContent(data) {
        const companions = [data.participant1, data.participant2, data.participant3]
        .filter(name => name !== "");

        const companionHtml = companions.length > 0
          ? companions.map((name, i) => `同伴者${i + 1}：${name}`).join("<br>")
          : "同伴者：なし";

        confirmContent.innerHTML = `
          代表者氏名：${data.representativeName}<br>
          電話番号：${data.phone}<br>
          メールアドレス：${data.email}<br>
          住所：${data.address || "未入力"}<br>
          参加人数：${data.participants}名<br>
          ${companionHtml}
        `;
      }

async function loadStatus() {
  try {
    const res = await fetch(`${GAS_URL}?mode=status`);
    const data = await res.json();

    if (!data.success) {
      seatStatus.textContent = "残席情報を取得できませんでした。";
      statusBox.className = "status-box status-error";
      return;
    }

    if (data.closed) {
      // 👇 満席の場合
        if (data.full) {
         seatStatus.innerHTML = "現在、定員に達したため受付を終了しております。<br>またのご参加をお待ちしております。";
         statusBox.className = "status-box status-normal";
      } else {
        // 👇 締切の場合
        seatStatus.textContent = "申し込み受付は終了しました。";
        statusBox.className = "status-box status-error";
      }

      seatStatus.classList.remove("hidden");
      closeStatus.classList.add("hidden");
      confirmSection.classList.add("hidden");

    } else {
      seatStatus.textContent = `現在の残り席：${data.remaining} / ${data.capacity}名`;

      if (data.remaining <= 5) {
        seatStatus.textContent = `残りわずか！ ${data.remaining} / ${data.capacity}名`;
        statusBox.className = "status-box status-error"; // 少ない＝注意
      } else {
       statusBox.className = "status-box status-normal";
      }

      closeStatus.classList.add("hidden");
      formSection.classList.remove("hidden");
      seatStatus.classList.remove("hidden");
    }
  } catch (error) {
    seatStatus.textContent = "残席情報を取得できませんでした。";
    statusBox.className = "status-box status-error";
  }
}

submitFinalBtn.addEventListener("click", async () => {
  message.textContent = "";
  submitFinalBtn.disabled = true;
  submitFinalBtn.innerHTML = "送信中… ⏳";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      message.innerHTML = "申し込みが完了しました。<br>確認メールを送信しました。";
      message.className = "status-box status-success";
      formSection.classList.add("hidden");
      updateParticipantFields();

      

      

      loadStatus();

    confirmBtn.addEventListener("click", () => {
      if (!form.reportValidity()) {
        return;
      }
      

      formSection.classList.add("hidden");
      confirmSection.classList.remove("hidden");

      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    backBtn.addEventListener("click", () => {
      confirmSection.classList.add("hidden");
      formSection.classList.remove("hidden");

      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    } else {
      message.textContent = data.message || "申し込みに失敗しました。";
      message.className = "status-box status-error";
    }
  } catch (error) {
    message.textContent = "⚠️送信エラーが発生しました。時間をおいて再度お試しください。";
    message.className = "status-box status-error";
  } finally {
    submitFinalBtn.disabled = false;
    submitFinalBtn.textContent = "この内容で申し込む";
  }
});

loadStatus();