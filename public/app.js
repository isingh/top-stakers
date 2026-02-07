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

  function getInitials(name) {
    return name
      .split(/\s+/)
      .map(function (w) { return w[0]; })
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function rankClass(rank) {
    if (rank <= 3) return "rank-" + rank;
    return "rank-default";
  }

  function renderStats(partners) {
    var totalStaked = partners.reduce(function (sum, p) { return sum + p.totalStaked; }, 0);
    var avgApy = partners.reduce(function (sum, p) { return sum + p.apy; }, 0) / partners.length;

    document.getElementById("total-staked").textContent = formatUSD(totalStaked);
    document.getElementById("partner-count").textContent = partners.length;
    document.getElementById("avg-apy").textContent = avgApy.toFixed(1) + "%";
  }

  function renderTable(partners) {
    var tbody = document.getElementById("partners-body");
    var html = "";

    partners.forEach(function (partner, i) {
      var rank = i + 1;
      html +=
        '<tr>' +
          '<td class="rank-col"><span class="rank-badge ' + rankClass(rank) + '">' + rank + '</span></td>' +
          '<td class="name-col"><div class="partner-name">' +
            '<div class="partner-logo">' + getInitials(partner.name) + '</div>' +
            '<div class="partner-info">' +
              '<span class="partner-label">' + partner.name + '</span>' +
              '<span class="partner-network">' + partner.network + '</span>' +
            '</div>' +
          '</div></td>' +
          '<td class="stake-col">' + formatUSD(partner.totalStaked) + '</td>' +
          '<td class="apy-col"><span class="apy-value">' + partner.apy.toFixed(1) + '%</span></td>' +
          '<td class="delegators-col">' + formatNumber(partner.delegators) + '</td>' +
          '<td class="commission-col">' + partner.commission + '%</td>' +
        '</tr>';
    });

    tbody.innerHTML = html;
  }

  function init() {
    var partners = STAKING_PARTNERS.slice().sort(function (a, b) {
      return b.totalStaked - a.totalStaked;
    });

    renderStats(partners);
    renderTable(partners);

    document.getElementById("last-updated").textContent = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  init();
})();
