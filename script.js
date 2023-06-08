// -- GLOBAL --
const MAXCHRS = 150;
const BASE_API_URL = "https://bytegrad.com/course-assets/js/1/api";
const textareaEl = document.querySelector(".form__textarea");
const counterEl = document.querySelector(".counter");
const formEl = document.querySelector(".form");
const feedbackListEl = document.querySelector(".feedbacks");
const submitBtnEl = document.querySelector(".submit-btn");
const spinnerEl = document.querySelector(".spinner");
const renderFeedbackItem = (feedbackItem) => {
  //new feedback item HTML called TEMPLATE LITERAL
  const feedbackItemHTML = `
  <li class="feedback">
    <button class="upvote">
        <i class="fa-solid fa-caret-up upvote__icon"></i>
        <span class="upvote__count">-${feedbackItem.upvoteCount}</span>
    </button>
    <section class="feedback__badge">
        <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
    </section>
    <div class="feedback__content">
        <p class="feedback__company">${feedbackItem.company}</p>
        <p class="feedback__text">${feedbackItem.text}</p>
    </div>
    <p class="feedback__date">${
      feedbackItem.daysAgo === 0 ? "NEW" : `${feedbackItem.daysAgo}d`
    }</p>
</li>
  `;

  //insert new feedback item in list
  feedbackListEl.insertAdjacentHTML("beforeend", feedbackItemHTML);
};

// -- COUNTER COMPONENT --
const inputHandler = () => {
  //specify the maximum number of characters allowed
  const maxNrChrs = MAXCHRS;
  //specify the number of characters typed
  const nrChrsTyped = textareaEl.value.length;
  //calculate number of characters left
  const chrsLeft = maxNrChrs - nrChrsTyped;
  //show number of characters left
  counterEl.textContent = chrsLeft;
};

textareaEl.addEventListener("input", inputHandler);

// -- FORM COMPONENT --
function showVisualIndicator(textCheck) {
  const indicator = textCheck === "valid" ? "form--valid" : "form--invalid";
  //show valid indicator
  formEl.classList.add(indicator);
  //remove visual indicator
  setTimeout(() => {
    formEl.classList.remove(indicator);
  }, 2000);
}

const submitHandler = (event) => {
  //Prevent defaul browser action (submitting form data to "action" - address and REFRESHING page)
  event.preventDefault();
  //get text from textarea
  const text = textareaEl.value;
  //validate text, check if # is present & that text is long enough
  if (text.includes("#") && text.length >= 5) {
    showVisualIndicator("valid");
  } else {
    showVisualIndicator("invalid");
    textareaEl.focus();
    //stop function execution
    return;
  }

  //we have text, now we can extract info from the text
  const hashtag = text.split(" ").find((word) => word.startsWith("#"));
  // console.log(hashtag);
  let company = hashtag.slice(1); //.substring(1) works too!

  //removing "." when the brand is the last word in a sentence.
  if (company.slice(-1) == ".") {
    company = company.slice(0, -1);
  }
  // The company is all UPPERCASE thanks to CSS

  const badgeLetter = company.at(0).toUpperCase(); //.substring(0,1) also works!
  // console.log(badgeLetter);

  const upvoteCount = 0;
  const daysAgo = 0;

  //create feedback item object & render feedback items in list

  const feedbackItem = {
    upvoteCount,
    badgeLetter,
    company,
    text,
    daysAgo,
  };
  renderFeedbackItem(feedbackItem);

  //send feedback item to server
  fetch(`${BASE_API_URL}/feedbacks`, {
    method: "POST",
    body: JSON.stringify(feedbackItem),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        console.log("Something went wrong");
        return;
      }
      console.log("Successfully submitted");
    })
    .catch((error) => console.log(error));

  //clear textarea
  textareaEl.value = "";

  //blur submit button
  submitBtnEl.blur();

  //reset counter
  counterEl.textContent = MAXCHRS;
};

formEl.addEventListener("submit", submitHandler);

//-- FEEDBACK LIST COMPONENT --
fetch(`${BASE_API_URL}/feedbacks`)
  .then((response) => response.json())
  .then((data) => {
    //remove spinner
    spinnerEl.style.display = "none"; //spinnerEl.remove(); **ALSO WORKS!**
    //iterate over each element in feedbacks array and render it in list
    data.feedbacks.forEach((feedbackItem) => renderFeedbackItem(feedbackItem));
  })
  .catch((error) => {
    feedbackListEl.textContent = `Failed to fetch feedback items: ${error.message}`;
  });
