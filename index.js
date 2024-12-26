const tbody = document.getElementById("tbody");
let coins = [];
let page = 1;
let nextbtn = document.querySelector("#next-button");
let prevbtn = document.querySelector("#prev-button");

function renderCoins(data, page, itemsPerPage=25) {
    const start = (page - 1) * itemsPerPage + 1;
  tbody.innerHTML = "";

  data.forEach((coin, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
                        <td>${start + index}</td>
                        <td><img src="${coin.image}" alt="${
      coin.name
    }" id="img"></td>
                        <td>${coin.name}</td>
                        <td>$${coin.current_price.toLocaleString()}</td>
                        <td>$${coin.total_volume.toLocaleString()}</td>
                        <td>$${coin.market_cap.toLocaleString()}</td>
                        <td><i class="fa-regular fa-star"></i></td>
                    `;

    tbody.appendChild(row);
  });
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
    console.log(coins);
  } catch (err) {
    console.log("Error:", err.message);
  }
}

const initialize = async ()=>{
    await tableBody(page);
    renderCoins(coins, page);
    updatePaginationControls();
}

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

document.addEventListener("DOMContentLoaded", initialize);
prevbtn.addEventListener("click", handlePrevButton);
nextbtn.addEventListener("click", handleNextButton);



