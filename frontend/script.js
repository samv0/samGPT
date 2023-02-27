import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
    element.textContent += '.'
    if (element.textContent === '....')
      element.textContent = ''
  }, 300)
}

function typeText(element, text) {
  let index = 0

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

function generateUID() {
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexString = randomNumber.toString(16)

  return `id-${timestamp}-${hexString}`
}

function chatStripe(isAI, value, UID) {
  return (
    `
      <div class='wrapper ${isAI && 'ai'}'>
        <div class='chat'>
          <div class='profile'>
            <img 
              src='${isAI ? bot : user}'
              alt='${isAI ? 'bot' : 'user'}'
            />
          </div>
          <div class='message' id=${UID}>${value}</div>
        </div>
      </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault() //prevent default browser reload

  const data = new FormData(form)

  //user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  form.reset() //clear text prompt

  //bot's chat stripe
  const UID = generateUID()

  chatContainer.innerHTML += chatStripe(true, ' ', UID)

  chatContainer.scrollTop = chatContainer.scrollHeight

  const messageDiv = document.getElementById(UID)

  loader(messageDiv)

  const response = await fetch('https://samgpt.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval)
  messageDiv.innerHTML = ''

  if (response.ok) {
    const data = await response.json()
    const parsedData = data.bot.trim()

    typeText(messageDiv, parsedData)
  } else {
    const err = await response.text()

    messageDiv.innerHTML = 'Something went wrong'

    alert(err)
  }

}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})