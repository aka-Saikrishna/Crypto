const dialog = document.querySelector(".dialog-box");
const input = document.querySelector("#search");
const ul = document.createElement("ul");
const xmark = document.querySelector("#xmark");
const searchIcon = document.querySelector(".fa-magnifying-glass");
const coinImage = document.querySelector("#coin-image");
const coinName = document.querySelector("#coin-name");
const aboutCoin = document.querySelector(".about-coin");
const coinRank = document.querySelector(".coin-rank");
const coinPrice = document.querySelector(".coin-price");
const coinMarket = document.querySelector(".coin-market");


let data;

const urlParams = new URLSearchParams(window.location.search);
const coinId = urlParams.get("id");
// console.log(coinId);

const initialize = async () => {
  const data = await fetchDataCoin();
  displayCoinData(data);
  fetchSearchResults();
    // fetchChartData(90);
};

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
      // console.log(selectedCoins.id);
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

document.addEventListener("DOMContentLoaded", () => {
  initialize();
});
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


// rendering the page

const fetchDataCoin = async () => {
    url = `https://api.coingecko.com/api/v3/coins/${coinId}`;
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
        const data = await response.json();
        // console.log(data);
        return data;
    } catch (err) {
    alert(`Error: ${err.message}`);
    window.history.back();
  } finally {
    hideLoader();
    }
};


function displayCoinData(data) {
    coinImage.setAttribute("src", `${data.image.large}`);
    coinName.textContent = `${data.name}`
    aboutCoin.textContent = `${data.description.en.split(".")[0]+"."}`
    coinRank.textContent = `${data.market_cap_rank}`;
    coinPrice.textContent = `$${data.market_data.current_price.usd.toLocaleString()}`;
  coinMarket.textContent = `$${data.market_data.market_cap.usd.toLocaleString()}`;
  // console.log(coinId);  
}


async function fetchChartData(days) {
    url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    try {
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
        const data = await response.json();
        // console.log(data.prices)
        updateChart(data.prices);
    } catch (err) {
        console.log("Error: ", err.message);
    }
}

// fetchChartData(90);

const ctx = document.querySelector("#coin-chart").getContext("2d");
let coinChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Price(USD)",
        data: [],
        borderColor: "black",
        fill: true,
      },
    ],
  },
  option: {
    responsive: true,
    scales: {
      x: {
        display: true,
        beginAtZero: true,
      },
      y: {
        display: true,
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `$${value}`;
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `$${context.parder.y}`;
          },
        },
      },
    },
  },
});


function updateChart(prices){
  const labels = prices.map((price) => {
    let date = new Date(price[0]);
    return date.toLocaleDateString();
  });
  const data = prices.map((price) => price[1]);
  coinChart.data.labels = labels;
  coinChart.data.datasets[0].data = data;
  coinChart.update();
};

const btns = document.querySelectorAll(".timeline button");

btns.forEach(btn => {
    btn.addEventListener("click", (event) => {
        btns.forEach(btn => btn.classList.remove("active"));
        event.target.classList.add("active");
        const days = event.target.id === "24h" ? 1 : (event.target.id === "30d" ? 30 : 90);
        fetchChartData(days);
    })
});

document.getElementById("24h").click();


favbtn = document.querySelector("#fav-btn");

function getFavorite() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function setFavorite(favorites) {
  return localStorage.setItem("favorites", JSON.stringify(favorites));
}

function toggleFavorite(coinId) {
  let favorites = getFavorite();
  if (favorites.includes(coinId)) {
    favorites = favorites.filter((id) => id !== coinId);
  } else {
    favorites.push(coinId);
  }
  return favorites;
}

function handleFavClick(coinId) {
  const favorites = toggleFavorite(coinId);
  setFavorite(favorites);
  console.log(favorites);
  favbtn.textContent = favorites.includes(coinId)
    ? "Remove From Favorites"
    : "Add To Favorite";
}

favbtn.addEventListener("click", () => {
  handleFavClick(coinId);
});

const favorites = localStorage.getItem("favorites");
  favbtn.textContent = favorites.includes(coinId)
    ? "Remove From Favorites"
  : "Add To Favorite";

// Reload event

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(() => {
    window.location.reload();
  }, 500);
});

// loader

function Showloader() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  loadingOverlay.classList.remove("hidden");
}

function hideLoader() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  loadingOverlay.classList.add("hidden");
}


