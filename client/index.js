import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";
    if(element.textContent === "....") {
      element.textContent = "";
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

function generateUniqueId() {
  const timeStamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timeStamp}-${hexadecimalString}`;
}

function chatStripe(isAI, value, uniqueID) {
  return (
    `
    <div class="wrapper ${isAI && "ai"}">
      <div class="chat">
        <div class="profile">
          <img 
            src="${isAI ? bot : user}"
            alt="${isAI ? "bot" : "user"}"
          />
        </div>
        <div class="message" id=${uniqueID}>${value}</div>
      </div>
    </div>
    `
  )
}

async function handleSubmit(e) {
  e.preventDefault();

  const data = new FormData(form);

  // user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  // bot's chat stripe
  const uniqueID = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, "", uniqueID);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueID);

  loader(messageDiv);

  // fetch data from server -> bot's response

  const response = await fetch("https://codex-9qgs.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: data.get("prompt")
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {

    const error = await response.text();
    messageDiv.innerHTML = "Something went wrong";

    alert(error);

  }
}

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
   if(e.key === "Enter") {
    handleSubmit(e)
   }
})

