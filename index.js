const tbody = document.getElementById("tbody");
const nextbtn = document.querySelector("#next-button");
const prevbtn = document.querySelector("#prev-button");
const priceDownArr = document.querySelector("#price-down");
const priceUpArr = document.querySelector("#price-up");
const volumeDownArr = document.querySelector("#vol-down");
const volumeUpArr = document.querySelector("#vol-up");
const marketDownArr = document.querySelector("#market-down");
const marketUpArr = document.querySelector("#market-up");
const dialog = document.querySelector(".dialog-box");
const input = document.querySelector("#search");
const xmark = document.querySelector("#xmark");
const ul = document.createElement("ul");
const searchIcon = document.querySelector(".fa-magnifying-glass");

let coins = [];
let priceList = [];
let page = 1;
let data;

function renderCoins(data, page, itemsPerPage = 25) {
  const start = (page - 1) * itemsPerPage + 1;
  tbody.innerHTML = "";

  data.forEach((coin, index) => {
    const row = renderCoinRow(start, coin, index);
    attachRowEvent(row,coin.id);
    tbody.appendChild(row);
  });
}

function renderCoinRow(start, coin, index) {
  const row = document.createElement("tr");
  row.innerHTML = `
   <td>${start + index}</td>
   <td><img src="${coin.image}" alt="${coin.name}" id="img"></td>
   <td>${coin.name}</td>
   <td>$${coin.current_price.toLocaleString()}</td>
   <td>$${coin.total_volume.toLocaleString()}</td>
   <td>$${coin.market_cap.toLocaleString()}</td>
   <td class="favorite-icon"><i class="fa-regular fa-star favorite-icon"></i></td>
   `;
  return row;
}

function attachRowEvent(row, coinId) {
  // console.log(row, coinId);
  row.addEventListener("click", (event) => {
    if (!event.target.classList.contains("favorite-icon")) {
      // console.log(event.target);
      window.location.href = `coin_Interface.html?id=${coinId}`;
    }
  });

  row.querySelector(".favorite-icon").addEventListener("click", (event) => {
    event.stopPropagation();
    // handleFavoriteClick(coinId);
  })
}

function updatePaginationControls() {
  document.querySelector("#next-button").disabled = coins.length < 25;
  document.querySelector("#prev-button").disabled = page === 1;
}

async function tableBody(page = 1) {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=${page}`;

  try {
    const fetchData = await fetch(url, {
      method: "get",
      headers: {
        accept: "application/json",
        "x-cg-demo-api-key": "CG-mDVVqLm5xBDjvcVq523LnAmB",
      },
    });

    if (!fetchData.ok) {
      throw new Error("Data cannot be fetched");
    }
    coins = await fetchData.json();
    // console.log(coins);
  } catch (err) {
    console.log("Error:", err.message);
  }
}

const initialize = async () => {
  await tableBody(page);
  renderCoins(coins, page);
  updatePaginationControls();
  fetchSearchResults();
};

async function handlePrevButton() {
  if (page > 1) {
    page--;
  }
  await tableBody(page);
  renderCoins(coins, page);
  updatePaginationControls();
}

async function handleNextButton() {
  page++;
  await tableBody(page);
  renderCoins(coins, page);
  updatePaginationControls();
}

function fieldSort(field, order) {
  coins.sort((a, b) =>
    order == "asc" ? a[field] - b[field] : b[field] - a[field]
  );
  renderCoins(coins, page);
}

function debounce(func, delay) {
  let timer;
  return function (...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

function fetchSearchResults() {
  const xml = new XMLHttpRequest();
  try {
    xml.open("get", "https://api.coingecko.com/api/v3/search?query=bit", true);
    xml.send();
    xml.onload = function () {
      data = JSON.parse(xml.responseText).coins;
      // console.log(data);
    };
    xml.onerror = function () {
      throw new Error("Data can't be fetch");
    };
  } catch (err) {
    console.log(err);
  }
}

function dialogBox(data) {
  dialog.style.display = "block";
  ul.innerHTML = "";
  ul.style.textAlign = "left";
  const inputText = input.value.trim().toLowerCase();
  dialog.appendChild(displayCoins(inputText, data));
}

function displayCoins(inputText, data) {
  
  let requiredCoins = data.filter((coin) =>
    coin.name.trim().toLowerCase().includes(inputText)
  );
  if (inputText == "") {
    ul.innerHTML = `Type to search`;
    ul.style.textAlign = "center";
    requiredCoins = [];
  } else if (requiredCoins.length < 1) {
    ul.style.textAlign = "center";
    ul.innerHTML = `Can't Find The Coin Your Looking For`;
  }
  requiredCoins.forEach((selectedCoins) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <img src="${selectedCoins.thumb}" alt="${selectedCoins.name}" class="img"> ${selectedCoins.name}
            `;
    li.addEventListener("click", (event) => {
      event.stopPropagation();
      // console.log(selectedCoins.id);
      const coinId = selectedCoins.id;
      window.location.href = `coin_Interface.html?id=${coinId}`;
    });
    ul.appendChild(li);
  });
  return ul;
}

dialog.addEventListener("click", (event) => {
  event.stopPropagation();
});
document.addEventListener("DOMContentLoaded", initialize);
prevbtn.addEventListener("click", handlePrevButton);
nextbtn.addEventListener("click", handleNextButton);
priceDownArr.addEventListener("click", () => fieldSort("current_price", ""));
priceUpArr.addEventListener("click", () => fieldSort("current_price", "asc"));
volumeDownArr.addEventListener("click", () => fieldSort("total_volume", ""));
volumeUpArr.addEventListener("click", () => fieldSort("total_volume", "asc"));
marketDownArr.addEventListener("click", () => fieldSort("market_cap", ""));
marketUpArr.addEventListener("click", () => fieldSort("total_volume", "asc"));
input.addEventListener(
  "input",
  debounce((event) => {
    event.stopPropagation();
    dialogBox(data);
  }, 300)
);
xmark.addEventListener("click", () => {
  dialog.style.display = "none";
  input.value = "";
});
document.addEventListener("click", () => {
  dialog.style.display = "none";
});
// console.log(searchIcon);
searchIcon.addEventListener(
  "click",
  debounce(() => {
    dialogBox(data);
    input.focus();
  }, 300)
);