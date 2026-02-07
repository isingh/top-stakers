(function () {
  function formatUSD(value) {
    if (value >= 1e9) return "$" + (value / 1e9).toFixed(1) + "B";
    if (value >= 1e6) return "$" + (value / 1e6).toFixed(1) + "M";
    if (value >= 1e3) return "$" + (value / 1e3).toFixed(1) + "K";
    return "$" + value.toFixed(0);
  }

  function formatNumber(value) {
    return value.toLocaleString("en-US");
  }

  function truncateWallet(address) {
    if (address.length <= 12) return address;
    return address.slice(0, 6) + "..." + address.slice(-4);
  }

  function getRatedUrl(staker) {
    var wallet = staker.wallet;
    var network = (staker.network || "").toLowerCase();
    if (network === "ethereum") {
      return "https://explorer.rated.network/o/" + encodeURIComponent(wallet) + "?network=mainnet&timeWindow=30d&idType=depositAddress";
    }
    if (network === "solana") {
      return "https://explorer.rated.network/authority/" + encodeURIComponent(wallet) + "?network=solana&timeWindow=30d";
    }
    return null;
  }

  function getInitials(staker) {
    if (staker.name) {
      return staker.name
        .split(/[\s.]+/)
        .map(function (w) { return w[0]; })
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return staker.wallet.slice(0, 2).toUpperCase();
  }

  function rankClass(rank) {
    if (rank <= 3) return "rank-" + rank;
    return "rank-default";
  }

  function formatDate(dateStr) {
    if (!dateStr) return "\u2014";
    var d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  }

  function renderStats(stakers) {
    var totalStaked = stakers.reduce(function (sum, s) { return sum + s.amountStaked; }, 0);
    var totalValidators = stakers.reduce(function (sum, s) { return sum + s.validators; }, 0);

    document.getElementById("total-staked").textContent = formatUSD(totalStaked);
    document.getElementById("staker-count").textContent = stakers.length;
    document.getElementById("total-validators").textContent = formatNumber(totalValidators);
  }

  function renderTable(stakers) {
    var tbody = document.getElementById("stakers-body");
    var html = "";

    stakers.forEach(function (staker, i) {
      var rank = i + 1;
      var displayName = staker.name || truncateWallet(staker.wallet);
      var subtitle = staker.name ? truncateWallet(staker.wallet) : staker.network;
      var ratedUrl = getRatedUrl(staker);
      var viewCell = ratedUrl
        ? '<td class="view-col"><a class="view-link" href="' + ratedUrl + '" target="_blank" rel="noopener noreferrer">VIEW <span class="chevron">&#8250;</span></a></td>'
        : '<td class="view-col"></td>';
      html +=
        '<tr>' +
          '<td class="rank-col"><span class="rank-badge ' + rankClass(rank) + '">' + rank + '</span></td>' +
          '<td class="name-col"><div class="staker-name">' +
            '<div class="staker-avatar">' + getInitials(staker) + '</div>' +
            '<div class="staker-info">' +
              '<span class="staker-label">' + displayName + '</span>' +
              '<span class="staker-network">' + subtitle + '</span>' +
            '</div>' +
          '</div></td>' +
          '<td class="stake-col">' + formatUSD(staker.amountStaked) + '</td>' +
          '<td class="since-col">' + formatDate(staker.stakedSince) + '</td>' +
          '<td class="validators-col">' + formatNumber(staker.validators) + '</td>' +
          viewCell +
        '</tr>';
    });

    tbody.innerHTML = html;
  }

  function render(stakers, source) {
    stakers.sort(function (a, b) {
      return b.amountStaked - a.amountStaked;
    });

    renderStats(stakers);
    renderTable(stakers);

    document.getElementById("last-updated").textContent = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    var sourceEl = document.getElementById("data-source");
    if (sourceEl) {
      sourceEl.textContent = source === "static"
        ? "Data is for illustration purposes only."
        : "Live data powered by " + source + ".";
    }
  }

  function init() {
    fetch("/api/stakers")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.stakers && data.stakers.length > 0) {
          render(data.stakers, data.source || "API");
        } else {
          render(TOP_STAKERS.slice(), "static");
        }
      })
      .catch(function () {
        render(TOP_STAKERS.slice(), "static");
      });
  }

  init();
})();
