module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");

  var apiKey = process.env.RATED_API_KEY;
  if (!apiKey) {
    return res
      .status(200)
      .json({ stakers: null, error: "RATED_API_KEY not configured" });
  }

  try {
    var [priceRes, ratedRes] = await Promise.all([
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      ),
      fetch(
        "https://api.rated.network/v0/eth/operators?window=30d&idType=depositAddress&size=15",
        {
          headers: {
            Authorization: "Bearer " + apiKey,
            Accept: "application/json",
          },
        }
      ),
    ]);

    if (!ratedRes.ok) {
      throw new Error("Rated API returned status " + ratedRes.status);
    }

    var priceData = await priceRes.json();
    var ethPrice = priceData.ethereum.usd;
    var ratedData = await ratedRes.json();

    var stakers = ratedData.data.map(function (op) {
      return {
        wallet: op.id,
        name:
          op.displayName && op.displayName !== op.id
            ? op.displayName
            : null,
        network: "Ethereum",
        amountStaked: Math.round(op.validatorCount * 32 * ethPrice),
        stakedSince: null,
        validators: op.validatorCount,
      };
    });

    return res.status(200).json({
      stakers: stakers,
      ethPrice: ethPrice,
      lastUpdated: new Date().toISOString(),
      source: "rated.network",
    });
  } catch (err) {
    console.error("Error fetching staking data:", err);
    return res
      .status(500)
      .json({ stakers: null, error: err.message });
  }
};
