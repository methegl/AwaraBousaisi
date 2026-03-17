const GAS_URL = "https://script.google.com/macros/s/AKfycbznzDDpmju3ZEGv0PzpQWeGY7Rnpxsc4cbUu0eohkD4gkGXVlw02hpHdoFpkRk7KxeLhg/exec";

const form = document.getElementById("entryForm");
const participantsSelect = document.getElementById("participants");
const participantFields = document.querySelectorAll(".participant-field");
const message = document.getElementById("message");
const seatStatus = document.getElementById("seatStatus");
const closeStatus = document.getElementById("closeStatus");
const formSection = document.getElementById("formSection");
const submitBtn = document.getElementById("submitBtn");

function updateParticipantFields() {
  const count = Number(participantsSelect.value);

  participantFields.forEach((field) => {
    const index = Number(field.dataset.index);
    const input = field.querySelector("input");

    if (index <= count) {
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

async function loadStatus() {
  try {
    const res = await fetch(`${GAS_URL}?mode=status`);
    const data = await res.json();

    if (!data.success) {
      seatStatus.textContent = "残席情報を取得できませんでした。";
      return;
    }

    if (data.closed) {
      seatStatus.textContent = `現在の申込人数：${data.currentCount} / ${data.capacity}名`;
      closeStatus.classList.remove("hidden");
      formSection.classList.add("hidden");
    } else {
      seatStatus.textContent = `現在の残り席：${data.remaining} / ${data.capacity}名`;
      closeStatus.classList.add("hidden");
      formSection.classList.remove("hidden");
    }
  } catch (error) {
    seatStatus.textContent = "残席情報を取得できませんでした。";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "送信中...";

  const formData = {
    representativeName: document.getElementById("representativeName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    address: document.getElementById("address").value.trim(),
    participants: document.getElementById("participants").value,
    participant1: document.getElementById("participant1").value.trim(),
    participant2: document.getElementById("participant2").value.trim(),
    participant3: document.getElementById("participant3").value.trim(),
    participant4: document.getElementById("participant4").value.trim(),
  };

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
      message.textContent = "申し込みが完了しました。\n確認メールを送信しました。";
      form.reset();
      updateParticipantFields();
      loadStatus();
    } else {
      message.textContent = data.message || "申し込みに失敗しました。";
    }
  } catch (error) {
    message.textContent = "送信エラーが発生しました。時間をおいて再度お試しください。";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "申し込む";
  }
});

loadStatus();