const dialog = document.querySelector(".dialog-box");
const input = document.querySelector("#search");
const ul = document.createElement("ul");
const xmark = document.querySelector("#xmark");
const searchIcon = document.querySelector(".fa-magnifying-glass");
const priceDownArr = document.querySelector("#price-down");
const priceUpArr = document.querySelector("#price-up");
const volumeDownArr = document.querySelector("#vol-down");
const volumeUpArr = document.querySelector("#vol-up");
const marketDownArr = document.querySelector("#market-down");
const marketUpArr = document.querySelector("#market-up");

let data;

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

function dialogBox(data) {
  dialog.style.display = "block";
  ul.innerHTML = "";
  ul.style.textAlign = "left";
  const inputText = input.value.trim().toLowerCase();
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
  renderCoins(requiredCoins);
}

function renderCoins(requiredCoins) {
  requiredCoins.forEach((selectedCoins) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <img src="${selectedCoins.thumb}" alt="${selectedCoins.name}" class="img"> ${selectedCoins.name}
            `;
    li.addEventListener("click", (event) => {
      event.stopPropagation();
      console.log(selectedCoins.id);
      const coinId = selectedCoins.id;
      window.location.href = `coin_Interface.html?id=${coinId}`;
    });
    ul.appendChild(li);
  });
  dialog.appendChild(ul);
}

dialog.addEventListener("click", (event) => {
  event.stopPropagation();
});

document.addEventListener("DOMContentLoaded", fetchSearchResults);

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


function fieldSort(field, order) {
  coins.sort((a, b) =>
    order == "asc" ? a[field] - b[field] : b[field] - a[field]
  );
  renderFavorites(coins);
}

priceDownArr.addEventListener("click", () => fieldSort("current_price", ""));
priceUpArr.addEventListener("click", () => fieldSort("current_price", "asc"));
volumeDownArr.addEventListener("click", () => fieldSort("total_volume", ""));
volumeUpArr.addEventListener("click", () => fieldSort("total_volume", "asc"));
marketDownArr.addEventListener("click", () => fieldSort("market_cap", ""));
marketUpArr.addEventListener("click", () => fieldSort("total_volume", "asc"));


// Rendering table

let page = 1;
let coins = [];

async function fetchFavoriteCoins(ids) {
  url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(
    ","
  )}`;
  try {
    Showloader();
    const response = await fetch(url, {
      method: "get",
      headers: {
        accept: "application/json",
        "x-cg-demo-api-key": "CG-mDVVqLm5xBDjvcVq523LnAmB",
      },
    });
    if (!response.ok) {
      throw new Error("Data can't be fetched");
    }
    coins = await response.json();
  } catch (err) {
    alert(`Error: ${err.message}`);
    // window.history.back();
  } finally {
    hideLoader();
  }
}

const getFavorite = () => {
  return JSON.parse(localStorage.getItem("favorites")) || [];
};

function renderFavorites(coins) {
  const tbody = document.getElementById("tbody");
  const noFav = document.getElementById("no-fav");
  tbody.innerHTML = "";
  if (coins.length === 0) {
    noFav.style.display = "block";
    return;
  } else {
    noFav.style.display = "none";
  }

  coins.forEach((coin, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${index + 1}</td>
    <td><img src="${coin.image}" alt="${coin.name}" id="img"></td>
   <td>${coin.name}</td>
   <td>$${coin.current_price.toLocaleString()}</td>
   <td>$${coin.total_volume.toLocaleString()}</td>
   <td>$${coin.market_cap.toLocaleString()}</td>
   <td><button type="button" class="remove" id="${coin.id}">Remove</button></td>
    `

    tr.addEventListener("click", (event) => {
      if (!event.target.classList.contains("remove")) {
        window.location.href = `coin_Interface.html?id=${coin.id}`
      }
    });

    tr.querySelector(".remove").addEventListener("click", (event) => {
      event.stopPropagation();
      handlingButton(coin);
    })
    tbody.appendChild(tr);
  });
}


document.addEventListener("DOMContentLoaded", async () => {
  const favorites = getFavorite();
  console.log(favorites);
  if (favorites.length === 0) {
    renderFavorites([]);
  } else {
    await fetchFavoriteCoins(favorites);
    renderFavorites(coins);
  }
});

async function handlingButton(coin) {
  let favorites = getFavorite();
  favorites = favorites.filter(id => id !== coin.id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  console.log(favorites);
  if (favorites.length !== 0) {
    await fetchFavoriteCoins(favorites);
    renderFavorites(coins);
  } else {
    renderFavorites([]);
  }
  // window.location.reload();
}


function Showloader() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  loadingOverlay.classList.remove("hidden");
}

function hideLoader() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  loadingOverlay.classList.add("hidden");
}