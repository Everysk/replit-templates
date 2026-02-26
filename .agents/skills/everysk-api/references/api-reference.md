





# API

Everysk API is organized around the open standard protocol REST.
Our API has predictable, resource-oriented URLs, and uses HTTP response codes to indicate API errors. We use built-in HTTP features, like HTTP authentication and HTTP verbs, which are understood by off-the-shelf HTTP clients.
All API responses are returned in JSON, including errors.

> API Base URL:

```
https://api.everysk.com
```

We also have some specific language examples to make integration easier. You can switch the programming language of the examples with the tabs in the top right.
You can request a Trial API Key at Contact Us.

## Versioning

---

Every time a backwards-incompatible change is made to the Everysk API, a new version is released. Each provided API has a separate version. (listed below).

| Version | Status |
| --- | --- |
| v2 | Current |
| v1 | Deprecated |

> You can pass a specific API version such as:

```
https://api.everysk.com/v2
```

Everysk API current version is v2.

## Authentication

---

The API uses exclusive POST HTTP method to access resources URI. In the POST, you represent the arguments of methods in JSON encoded dictionary in the request body.

The maximum JSON encoded payload size is 1MB.
Be sure to encode the Content-Type header for your requests as "application/json".

Authenticate your account when using the API by including your secret API key in the request. Authentication to the API is performed via HTTP Basic Authentication. In short, you will use your Everysk API Account SID as the username and your Auth Token as the password for HTTP Basic authentication. API requests without authentication will fail. You can manage your API keys in the API Settings. Be sure to keep your Account SID and Auth Token secret.

The API tokens have two types of permission: enterprise and sub-user. When a sub-user token is performing a request to the API, it must inform the workspace by parameter. For more information about Governance and Permissions click here.

The API is served over HTTPS. Calls made over plain HTTP will fail.

> A request example with arguments:

**Curl:**



```
curl https://api.everysk.com/v2/health_check \
-H "Authorization: Bearer YOUR_ACCOUNT_SID:YOUR_ACCOUNT_SID" \
-G
```

```
import requests
import json

url = 'https://api.everysk.com/v2/health_check'
headers = {
'Content-Type': 'application/json',
'Authorization': 'Bearer YOUR_ACCOUNT_SID:YOUR_ACCOUNT_SID'
}

response = requests.get(url=url, headers=headers)

print(json.dumps(response.json(), indent=2))
```

> The above call returns a JSON structure like this:

```
{
"api_status": "OK",
"version": "v2",
"name": "Everysk API"
}
```

Make sure to replace **YOUR_ACCOUNT_SID** and **YOUR_AUTH_TOKEN** with your Account SID and your Auth Token.

## Errors

---

> An error response example:

```
{
"code": 400,
"message": "Bad Request - Please visit https://www.everysk.com/api/docs for more information."
}
```

The API uses conventional HTTP response codes to indicate the success or failure of an API request. In general, codes in the 2xx range indicate success, codes in the 4xx range indicate an error that failed given the information provided (e.g., a required parameter was omitted, etc.), and codes in the 5xx range indicate an error with Everysk's servers.

HTTP Status Code Summary:

| Code | Message | Description |
| --- | --- | --- |
| 200 | OK | Everything worked as expected. |
| 400 | Bad Request | The request was unacceptable. This could be due to a missing required field, an invalid parameter or another issue. |
| 401 | Unauthorized | No valid credentials provided. |
| 403 | Forbidden | The credentials provided do not have permission to access the requested resource. |
| 404 | Not Found | The requested resource doesn't exist. |
| 429 | Too Many Requests | Too many requests hit the API too quickly. We recommend an exponential backoff of your requests. |
| 5XX | Server Errors | Something went wrong with Everysk Servers. |

## Rate limiting

---

> Example on how to check the remaining requests in the current window:

```
curl -i https://api.everysk.com/v2/health_check \
-G
```

> Example of HTTP header response:

```
HTTP/2 200
content-type: application/json; charset=utf-8
x-everysk-request-id: ed888caa18904ca5b5f05e305ab11551
x-everysk-request-duration: 81.3500881195
x-everysk-rate-limit-allowed: 60
x-everysk-rate-limit-remaining: 49
x-everysk-rate-limit-reset: 10
```

> Example rate limit error response:

```
{
"code": 429,
"message": "Too Many Requests - You've exceeded the rate limit for your api account SID. Please try again using truncated exponential backoff."
}
```

Everysk API is rate-limited to 60 requests per minute as default. This safety limit is set by Everysk to protect the integrity of our system.
If you exceed the limit established in your plan, any request you send will return a 429 error: "Too Many Requests". If you require a higher limit, please contact us.

The API will respond to every request with five HTTP headers (three headers being related to rate limit and two being related to request id and duration),providing additional information about the status of the request:

| Header | Description |
| --- | --- |
| X-Everysk-Rate-Limit-Allowed | This header provides the number of requests you are allowed per 1 minute window. |
| X-Everysk-Rate-Limit-Remaining | This header provides the number of requests you can make before hitting the limit. |
| X-Everysk-Rate-Limit-Reset | This header provides the remaining window before the rate limit resets, in seconds. |

## Request IDs

---

Each API request has an associated request identifier. You can find this value in the response headers, under X-Everysk-Request-Id. If you need to contact us about a specific request, providing the request identifier will ensure the fastest possible resolution.

| Header | Description |
| --- | --- |
| X-Everysk-Request-Id | This header provides a unique identifier for your request. If you need to contact us about a specific request, providing the request identifier will ensure the fastest possible resolution. |
| X-Everysk-Request-Duration | This header specifies the amount of time that Everysk servers spent processing this request, in milliseconds. |

## Pagination

---

All top-level API resources have support for bulk fetches via "list" API methods. These list API methods share a common structure, taking at least these two parameters: page_size and page_token.

Everysk utilizes cursor-based pagination via the page_token. The page_token parameter returns objects listed after the named object in reverse chronological order.

| Parameter | Description |
| --- | --- |
| page_size integer | A limit on the number of objects to be returned, between 1 and 100. |
| page_token string | Returns the previous page token. |

## Auto-Pagination

---

> Auto-Pagination example

```
# The auto-pagination feature is specific to Everysk's
# libraries and cannot be used directly with curl.
```

```
import everysk

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

for portfolio in everysk.Portfolio.auto_paging_iter(page_size=3):
#Do something with portfolio
```

Our libraries support auto-pagination. This feature easily handles fetching large lists of resources without having to manually paginate results and perform subsequent requests.

## Calculation

---

> Endpoints

```
POST    /calculations/risk_attribution
POST    /calculations/stress_test
POST    /calculations/exposure
POST    /calculations/properties
POST    /calculations/sensitivity
POST    /calculations/marginal_tracking_error
POST    /calculations/parametric_risk_attribution
```

The Calculation API provides endpoints to perform portfolio stress tests, risk attribution, exposure and sensitivity calculations. Monte Carlo with full revaluation as well as parametric end points are provided.

If you want, you can pass a portfolio id for a calculation instead of parameters.

### Monte Carlo Risk Attribution

---

The goal of Monte Carlo Risk Attribution is to calculate the contribution to the overall portfolio risk from each security. We use a measure called Marginal Contribution to Total Risk (MCTR) for Monte Carlo Risk Attribution.

To MCTR for a portfolio, make an HTTP POST to your calculation resource URI:

HTTP Request

POST /calculations/risk_attribution

HTTP Parameters

| Parameter | Description |
| --- | --- |
| portfolio_id string | optional It is the ID of and existing portfolio. When passing a portfolio's ID as parameter the calculation will be performed using the given portfolio's securities, date, base currency and nlv. The securities parameter is no longer required. |
| securities array | REQUIRED * It is an array of objects to describe the securities in the portfolio. Each object represents a security with a unique id, symbol, quantity and label. For more details click here. * Not required if portfolio_id is being provided. |
| date string date | optional, default is null (today) Portfolio date in the format: YYYYMMDD. The Portfolio Date is important because it instructs the API to use the market conditions and security prices prevailing on that date. Therefore, historical portfolios will be calculated without looking ahead. In order to run the portfolio using the market conditions prevailing today, use null. |
| base_currency string | optional, default is USD 3-letter ISO 4217 code for currency. Portfolios can have their base currency changed via the API call. By changing the base currency, a new set of currency risks is automatically taken into account. To see all supported currencies click here. |
| nlv float | optional, default is null (calculated) The net liquidating value of the portfolio (also called NAV). When not supplied by user, the API will calculate the net liquidating value of all the cash securities. Securities traded on margin are assumed to have NLV zero. Supplying a NLV effectively reconciles the margin. |
| horizon integer | optional, default is 5 Simulates the behavior of each security via their underlying risk factors. It accepts: 1, 5, 20 or 60. For more information click here. |
| sampling integer | optional, default is 1 Sampling represents the frequency that historical prices and rates (spreads) are collected in order to compute the invariant risk factors. In order to sample daily, use 1. In order to sample weekly (non-overlapping), pass 5. It accepts: 1 or 5. For various combinations between horizon and sampling click here. |
| aggregation string | optional, default is position Aggregation computes individual security MCTR's and aggregates them according to the supported criteria:custom, position, country, sector, gics_sector, market_capitalization, liquidity, implied_rating, duration, security_type, security_type_refined, dividend_yield, exposure, currency, fixed_income, total_esg. For more information click here. |
| projection array | optional, default is ["IND:SPX"] User supplied array of securities to be used as a top-down factor model. Maximum number of elements in the projection array is 15. |
| volatility_half_life integer | optional, default is 2 Half life of volatility information in months: 0 (no decay), 2, 6, 12, 24 or 48. |
| correlation_half_life integer | optional, default is 6 Half life of correlation information in months: 0 (no decay), 2, 6, 12, 24 or 48. |
| risk_measure string | optional, default is vol Specifies the forward looking portfolio risk property being measured by MCTR, such as: vol, var or cvar. vol: forward looking annualized volatility of the P&L distribution for the portfolio. var: Value-at-Risk of the P&L distribution for the portfolio. cvar: Conditional Value-at-Risk of the P&L distribution for the portfolio. |
| filter string | optional, default is null (use the whole portfolio) Filter Expression: When present it runs a pre-processing calculation to select identifiers that satisfy certain criteria. It can be used to highlight the properties of a subset of the portfolio, for example: only fixed income securities. Calculations are performed for the whole portfolio and only displayed for the securities that satisfy the filter. For more details click here. |

> To calculate the MCTR, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/calculations/risk_attribution \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-d '{
"securities": [
{
"id": "id1",
"symbol": "AAPL",
"quantity": 1000.0
},
{
"id": "id2",
"symbol": "SIE:XETR",
"quantity": 750.0
}
],
"date": "20210622"
}' \
-X POST
```

```
import everysk
import json

everysk.api_sid = <YOUR_ACCOUNT_SID>
everysk.api_token = <YOUR_ACCOUNT_TOKEN>

response = everysk.Calculation.riskAttribution(
securities = [
{
"id": "id1",
"symbol": "AAPL",
"quantity": 1000.0
},
{
"id": "id2",
"symbol": "SIE:XETR",
"quantity": 750.0
}
],
date = '20210622'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"risk_attribution": {
"unmapped_tickers": [],
"results": [
{
"id": "id1",
"mctr": [
{
"projection": "IND:SPX",
"value": 0.0731895836099715
},
{
"projection": "residual",
"value": 0.048455690761258066
}
]
},
{
"id": "id2",
"mctr": [
{
"projection": "IND:SPX",
"value": 0.043270012765204605
},
{
"projection": "residual",
"value": 0.024765489616676867
}
]
}
]
}
}
```

### Stress Test

---

Stress Test calculates the expected behavior of the portfolio under different scenarios, including extreme events. Everysk API calculates the probabilities of extreme events happening and factors those probabilities into the calculations. For example: it takes into account that correlations and volatility tend to increase in periods of market distress, resulting in large price oscillations for securities.

This API call returns 3 main measures for the specific scenario requested, namely:

- Conditional value at risk at the left tail of the distribution (CVaR-): The average of the worst (1-confidence) percentile outcomes from the forward looking P&L distribution of the portfolio.
- Expected profit and loss (EV): The average of the full forward looking P&L distribution of the portfolio.
- Conditional value at risk at the right tail of the distribution (CVaR+): The average of the best (1-confidence) percentile outcomes from the forward looking P&L distribution of the portfolio.

To compute CVaR-, EV, CVaR+ for a portfolio, make an HTTP POST to your calculation resource URI:

HTTP Request

POST /calculations/stress_test

HTTP Parameters

| Parameter | Description |
| --- | --- |
| portfolio_id string | optional It is the ID of an existing portfolio. When passing a portfolio's ID as parameter the calculation will be performed using the given portfolio's securities, date, base currency and nlv. The securities parameter is no longer required. |
| securities array | REQUIRED * An array of objects to describe the securities in the portfolio. Each object represents a security with a unique id, symbol, quantity and label. For more details click here.  * Not required if portfolio_id is provided. |
| date string date | optional, default is null (today) Portfolio date in the format: YYYYMMDD. The Portfolio Date instructs the API to use the market conditions and security prices prevailing on that date. Historical portfolios will be calculated without look ahead. To run using today’s conditions, use null. |
| base_currency string | optional, default is USD 3-letter ISO 4217 code for currency. Changing the base currency introduces new currency risks automatically. See all supported currencies here. |
| nlv file | optional, default is null (calculated) The net liquidating value (NAV). If not supplied, the API calculates it from all cash securities. Margin-traded securities are assumed to have NLV zero. Supplying an NLV reconciles the margin. |
| horizon integer | optional, default is 5 Simulation horizon. Accepts: 1, 5, 20 or 60. Passing null instructs the engine to extend horizons until the shock magnitude is observable. More info here. |
| sampling integer | optional, default is 1 Sampling frequency of historical data. 1 = daily, 5 = weekly (non-overlapping). See combinations. |
| aggregation string | optional, default is position (no aggregation) Aggregates individual security MCTR’s by criteria such as: custom, position, country, sector, gics_sector, market_capitalization, liquidity, implied_rating, duration, security_type, security_type_refined, dividend_yield, exposure, currency, fixed_income, total_esg. See Risk Aggregations. |
| projection array | optional, default is ["IND:SPX"] Array of securities to be used as a top-down factor model. Max: 15. |
| volatility_half_life integer | optional, default is 2 Volatility half life in months: 0, 2, 6, 12, 24, or 48. |
| correlation_half_life integer | optional, default is 6 Correlation half life in months: 0, 2, 6, 12, 24, or 48. |
| shock string | optional, default is "IND:SPX" The security used for the stress test. |
| magnitude file | REQUIRED The magnitude of the shock. See more here. |
| confidence string | optional, default is "95%" Confidence level for CVaR calculation. Accepts: 1sigma, 2sigma, 3sigma, 85%, 90%, 95%, 97%, 99%. Details here. |
| filter string | optional, default is null (use the whole portfolio) Filter expression to pre-select identifiers (e.g., only fixed income). Calculations are run on the whole portfolio but only displayed for the filtered subset. See filters. |

> To calculate the CVaR-, EV, CVaR+, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/calculations/stress_test \
-H "Content-Type: application/json" \
-u YOUR_API_SID:YOUR_API_TOKEN \
-d '{
"securities": [
{
"id": "id1",
"symbol": "AAPL",
"quantity": 1000.0
},
{
"id": "id2",
"symbol": "SIE:XETR",
"quantity": 750.0
}
],
"date": "20210622",
"projection": ["SPY"],
"shock": "IND:SPX",
"magnitude": -0.1
}' \
-X POST
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Calculation.stressTest(
securities = [
{
"id": "id1",
"symbol": "AAPL",
"quantity": 1000.0
},
{
"id": "id2",
"symbol": "SIE:XETR",
"quantity": 750.0
}
],
date = '20210622',
projection = ["SPY"],
shock = 'IND:SPX',
magnitude = -0.1
)

print(json.dumps(response, indent = 2))
```

> The above call returns the following JSON object:

```
{
"stress_test": {
"extrapolated": false,
"out_of_range": false,
"implied_magnitudes": [-0.1],
"results": [
{
"ev": [
{
"projection": "SPY",
"value": -0.05381884985690465
},
{
"projection": "residual",
"value": -0.00029460954393996727
}
],
"cvar_neg": [
{
"projection": "SPY",
"value": -0.09483311872511944
},
{
"projection": "residual",
"value": -0.024535867284700787
}
],
"cvar_pos": [
{
"projection": "SPY",
"value": -0.009455158729183554
},
{
"projection": "residual",
"value": 0.029583437854230045
}
],
"id": "id2"
},
{
"ev": [
{
"projection": "SPY",
"value": -0.08655629290002333
},
{
"projection": "residual",
"value": -0.0001557620360950901
}
],
"cvar_neg": [
{
"projection": "SPY",
"value": -0.15251911222218337
},
{
"projection": "residual",
"value": -0.0412765118097164
}
],
"cvar_pos": [
{
"projection": "SPY",
"value": -0.015206632816483687
},
{
"projection": "residual",
"value": 0.061881587296071544
}
],
"id": "id1"
}
],
"dynamic_range": [-0.11251559173161693, 0.12721726088932167],
"unmapped_tickers": [],
"implied_horizon": 90
}
}
```

### Exposure

---

Calculates the delta-adjusted notional exposure of each security, converted to the base currency of the portfolio.

To compute the exposures for a portfolio, make an HTTP POST to your calculation resource URI:

HTTP Request

POST /calculations/exposure

HTTP Parameters

| Parameter | Description |
| --- | --- |
| portfolio_id string | optional The ID of an existing portfolio. When provided, the calculation will use the portfolio's securities, date, base currency, and NLV. The securities parameter is no longer required. |
| securities array | REQUIRED * An array of objects describing the securities in the portfolio. Each object includes a unique id, symbol, quantity, and label. For more details click here.  * Not required if portfolio_id is provided. |
| date string date | optional, default is null (today) Portfolio date in the format: YYYYMMDD. This instructs the API to use the market conditions and security prices prevailing on that date. Historical portfolios will be calculated without look ahead. To run the portfolio using today’s conditions, use null. |
| base_currency string | optional, default is USD 3-letter ISO 4217 currency code. Portfolios can have their base currency changed via the API. Changing the base currency automatically incorporates currency risks. See supported currencies here. |
| nlv file | optional, default is null (calculated) The net liquidating value (NAV) of the portfolio. If not supplied, the API calculates it from all cash securities. Securities traded on margin are assumed to have NLV zero. Providing an NLV reconciles the margin. |
| sampling integer | optional, default is 1 Frequency of historical data sampling. Use 1 for daily, 5 for weekly (non-overlapping). Accepts: 1 or 5. |
| aggregation string | optional, default is position (no aggregation) Aggregates security MCTR’s according to criteria: custom, position, country, sector, gics_sector, market_capitalization, liquidity, implied_rating, duration, security_type, security_type_refined, dividend_yield, exposure, currency, fixed_income, total_esg. More info here. |
| filter string | optional, default is null (use the whole portfolio) Filter expression to select identifiers that meet criteria. For example: only fixed income securities. Calculations are performed on the whole portfolio but results are displayed only for the filtered subset. More details here. |

> To calculate the exposure, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/calculations/exposure \
-H "Content-Type: application/json" \
-u YOUR_API_SID:YOUR_API_TOKEN \
-d '{
"securities": [
{
"id": "id1",
"symbol": "AAPL",
"quantity": 1000.0
},
{
"id": "id2",
"symbol": "SIE:XETR",
"quantity": 750.0
}
]
}' \
-X POST
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Calculation.exposure(
securities = [
{
"id": "id1",
"symbol": "AAPL",
"quantity": 1000.0
},
{
"id": "id2",
"symbol": "SIE:XETR",
"quantity": 750.0
}
]
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"exposure": {
"unmapped_tickers": [],
"results": [
{
"notional": 133980.0,
"beta_notional": [
{
"projection": "IND:SPX",
"value": 144201.42194706676
},
{
"projection": "residual",
"value": -10221.42194706676
}
],
"id": "id1",
"notional_gross": 133980.0
},
{
"notional": 122421.00149999997,
"beta_notional": [
{
"projection": "IND:SPX",
"value": 127031.28308587175
},
{
"projection": "residual",
"value": -4610.28158587178
}
],
"id": "id2",
"notional_gross": 122421.00149999997
}
],
"nlv": 256401.00149999995
}
}
```

### Properties

---

Calculates the overall portfolio properties with a single API call. Sensitivities, exposures and risk are aggregated from individual securities to a portfolio level:

HTTP Request

POST /calculations/properties

HTTP Parameters

| Parameter | Description |
| --- | --- |
| portfolio_id string | optional The ID of an existing portfolio. When provided, the calculation will use the portfolio's securities, date, base currency, and NLV. The securities parameter is no longer required. |
| securities array | REQUIRED * An array of objects describing the securities in the portfolio. Each object includes a unique id, symbol, quantity, and label. For more details click here.  * Not required if portfolio_id is provided. |
| date string date | optional, default is null (today) Portfolio date in the format: YYYYMMDD. This instructs the API to use the market conditions and security prices prevailing on that date. Historical portfolios are calculated without look ahead. To use today’s conditions, pass null. |
| base_currency string | optional, default is USD 3-letter ISO 4217 currency code. Changing the base currency automatically introduces new currency risks. See supported currencies here. |
| nlv file | optional, default is null (calculated) The net liquidating value (NAV) of the portfolio. If not supplied, the API calculates it from all cash securities. Securities traded on margin are assumed to have NLV zero. Providing an NLV reconciles the margin. |
| horizon integer | optional, default is 5 Simulation horizon for risk factor shocks. Accepts: 1, 5, 20, or 60. More info here. |
| sampling integer | optional, default is 1 Frequency of historical data sampling. Use 1 for daily, 5 for weekly (non-overlapping). See combinations. |
| aggregation string | optional, default is position (no aggregation) Aggregates security MCTR’s by criteria: custom, position, country, sector, gics_sector, market_capitalization, liquidity, implied_rating, duration, security_type, security_type_refined, dividend_yield, exposure, currency, fixed_income, total_esg. More info here. |
| projection array | optional, default is ["IND:SPX"] Array of securities to be used as a top-down factor model. Maximum: 10 elements. |
| volatility_half_life integer | optional, default is 2 Volatility half life in months: 0 (no decay), 2, 6, 12, 24, or 48. |
| correlation_half_life integer | optional, default is 6 Correlation half life in months: 0 (no decay), 2, 6, 12, 24, or 48. |
| confidence string | optional, default is 95% Confidence level for CVaR calculation. Accepts: 1sigma, 2sigma, 3sigma, 85%, 90%, 95%, 97%, or 99%. More info here. |

> To calculate the properties, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/calculations/properties \
-H "Content-Type: application/json" \
-u YOUR_API_SID:YOUR_API_TOKEN \
-d '{
"securities": [
{
"id": "id1",
"symbol": "AAPL",
"quantity": 1000.0
},
{
"id": "id2",
"symbol": "SIE:XETR",
"quantity": 750.0
}
],
"date": "20210622"
}' \
-X POST
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Calculation.properties(
securities = [
{
"id": "id1",
"symbol": "AAPL",
"quantity": 1000.0
},
{
"id": "id2",
"symbol": "SIE:XETR",
"quantity": 750.0
}
],
date = '20210622'
)

print(json.dumps(response, indent = 2))
```

> The above call returns the following JSON object:

```
{
"properties": {
"unmapped_tickers": [],
"results": [
{
"value": 0.04480515690789044,
"measure": "expected_return"
},
{
"value": 0.18968077675311104,
"measure": "expected_volatility"
},
{
"value": -0.042711478991844576,
"measure": "var"
},
{
"value": -0.0528583774329209,
"measure": "cvar"
},
{
"value": 1.0,
"measure": "net_exposure"
},
{
"value": 1.0,
"measure": "gross_exposure"
},
{
"value": 0.0013916717517594335,
"measure": "liquidity"
},
{
"value": 256401.00149999995,
"measure": "nlv"
},
{
"value": 0.0,
"measure": "delta"
},
{
"value": 0.0,
"measure": "gamma"
},
{
"value": 0.0,
"measure": "theta"
},
{
"value": 0.0,
"measure": "vega"
},
{
"value": 0.0,
"measure": "duration"
},
{
"value": 0.0,
"measure": "effective_duration"
},
{
"value": 0.0,
"measure": "macaulay_duration"
},
{
"value": 0.0,
"measure": "modified_duration"
},
{
"value": 0.0,
"measure": "cs01"
},
{
"value": 0.0,
"measure": "dv01"
},
...
]
}
}
```

### Sensitivity

---

Calculates greeks for options and various fixed income sensitivities for fixed income securities. Values can be unitized when “compute_notional” is False, or weighted by the notional exposure of the security when “compute_notional” is True.

HTTP Request

POST /calculations/sensitivity

HTTP Parameters

| Parameter | Description |
| --- | --- |
| portfolio_id string | optional The ID of an existing portfolio. When provided, the calculation will use the portfolio's securities, date, base currency, and NLV. The securities parameter is no longer required. |
| securities array | REQUIRED * An array of objects describing the securities in the portfolio. Each object includes a unique id, symbol, quantity, and label. For more details click here.  * Not required if portfolio_id is provided. |
| date string date | optional, default is null (today) Portfolio date in the format: YYYYMMDD. This instructs the API to use the market conditions and security prices prevailing on that date. Historical portfolios are calculated without look ahead. To use today’s conditions, pass null. |
| base_currency string | optional, default is USD 3-letter ISO 4217 currency code. Portfolios can have their base currency changed via the API call. Changing the base currency automatically introduces new currency risks. See supported currencies here. |
| sensitivity_type string | optional, default is delta The type of sensitivity. Accepts: delta, gamma, theta, vega, duration, effective_duration, macaulay_duration, modified_duration, cs01, dv01, average_life, rolled_average_life, or volatility. |
| compute_notional boolean | optional, default is False Determines whether sensitivities should be weighted by notional exposure or unitized.  True: Weight sensitivities by notional exposure.  False: Unitize sensitivities. |

> To calculate the sensitivity, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/calculations/sensitivity \
-H "Content-Type: application/json" \
-u YOUR_API_SID:YOUR_API_TOKEN \
-d '{
"securities": [
{
"id": "id1",
"symbol": "AAPL 20210629 P120 0.905",
"quantity": 1000.0
},
{
"id": "id2",
"symbol": "TWTR 20230120 C100.000 4.3",
"quantity": 750.0
}
],
"date": "20210622"
}' \
-X POST
```

```
import everysk
import json

everysk.api_sid = <YOUR_ACCOUNT_SID>
everysk.api_token = <YOUR_ACCOUNT_TOKEN>

response = everysk.Calculation.sensitivity(
securities = [
{
"id": "id1",
"symbol": "AAPL 20210629 P120 0.905",
"quantity": 1000.0
},
{
"id": "id2",
"symbol": "TWTR 20230120 C100.000 4.3",
"quantity": 750.0
}
],
date = '20210622'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"sensitivity": {
"unmapped_tickers": [],
"sensitivity_type": "delta",
"results": {
"id2": 0.2714842229039089,
"id1": -0.12767219639181443
}
}
}
```

### Tracking Errors

---

Tracking error is the divergence between the price behavior of a position or a portfolio and the price behavior of a benchmark. This is often in the context of a hedge fund, mutual fund, or exchange-traded fund (ETF) that did not work as effectively as intended, creating an unexpected profit or loss.

HTTP Request

POST /calculations/marginal_tracking_error

HTTP Parameters

| Parameter | Description |
| --- | --- |
| portfolio1 string | REQUIRED The portfolio to be analyzed. |
| portfolio2 string | REQUIRED The portfolio used as a benchmark to calculate deviations or differences. |
| weekly boolean | optional, default is True If True, the Calculation API uses weekly returns to calculate the tracking error. |
| EWMA boolean | optional, default is False If True, the exponentially weighted moving average will be applied to volatilities. |
| exponential_decay float | optional, default is 0.94 Weighting factor that determines the rate at which older data enters the EWMA calculation. Accepts float values from 0 to 1. Only used when EWMA is True. |
| nDays integer | optional, default is 252 Number of historical business days used in the calculation when weekly is False. |
| nWeeks integer | optional, default is 200 Number of historical weeks used in the calculation when weekly is True. |

> To calculate the tracking errors, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/calculations/marginal_tracking_error \
-H "Content-Type: application/json" \
-u YOUR_API_SID:YOUR_API_TOKEN \
-d '{
"portfolio_id1": "port_tOeqCAgM02AdfNfoLaKynRvVw",
"portfolio_id2": "port_Ij8wTCniFM9sZKDB0HbigYidc",
"aggregation": 'position',
"weekly": false,
}' \
-X POST
```

```
import everysk
import json

everysk.api_sid = <YOUR_ACCOUNT_SID>
everysk.api_token = <YOUR_ACCOUNT_TOKEN>

response = everysk.Calculation.marginalTrackingError(
portfolio_id1='port_xSfACHDE90AvzylJWDDriiniS',
portfolio_id2='port_cDUtA9h0rLalPsFxu8FyPOyp7',
weekly=False
)

print(json.dumps(response, indent = 2))
```

> The above call returns the following JSON object:

```
{
"marginal_tracking_error": {
"unmapped_tickers": [],
"results": {
"mcte": {
"ksav3g08": 0.011946318320363839
},
"te": 0.01731762913056002
}
}
}
```

### Parametric Risk Attribution

---

Calculates the magnitude of a security's reaction to changes in underlying factors, most often in terms of its price response to other factors.

HTTP Request

POST /calculations/parametric_risk_attribution

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED A string used to identify the portfolio. |
| projection array | REQUIRED User-supplied array of securities to be used as a top-down factor model. Maximum number of elements is 15. |
| portfolio_id string | optional The ID of an existing portfolio. When provided, the calculation uses the portfolio's securities, date, base currency, and NLV. The securities parameter is no longer required. |
| securities array | REQUIRED * An array of objects describing the securities in the portfolio. Each object includes a unique id, symbol, quantity, and label. For more details click here.  * Not required if portfolio_id is provided. |
| use_cashflow boolean | optional, default is True For fixed income securities:  • True: maps each cashflow event (interest, principal amortization) to key points in the respective interest rate curve.  • False: uses Macaulay duration to map bond price to neighboring key points in the respective curve. |
| sampling integer | optional, default is 1 Frequency of historical data sampling. Use 1 for daily, 5 for weekly (non-overlapping). Accepts: 1 or 5. |
| confidence string | optional, default is 95% Confidence level for calculating VaR and CVaR. Accepts: 1sigma, 2sigma, 3sigma, 85%, 90%, 95%, 97%, or 99%. More details here. |
| historical_days integer | optional, default is 252 Number of business days used to calculate the covariance for the primitive risk factors. |
| exponential_decay float | optional, default is 0.94 Factor used in the exponentially weighted moving average (EWMA). Accepts float values from 0 to 1. |

> To calculate the parametric risk, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/calculations/parametric_risk_attribution \
-H "Content-Type: application/json" \
-u YOUR_API_SID:YOUR_API_TOKEN \
-d '{
"projection": ["IND:BVSP"],
"securities": [
{
"id": "id1",
"symbol": "PETR4:BVMF",
"quantity": 150.0
}
],
"base_currency": "BRL",
"date": "20210711"
}' \
-X POST
```

```
import everysk
import json

everysk.api_sid = <YOUR_ACCOUNT_SID>
everysk.api_token = <YOUR_ACCOUNT_TOKEN>

response = everysk.Calculation.parametricRiskAttribution(
projection = ["IND:BVSP"],
securities = [
{
"id": "id1",
"symbol": "PETR4:BVMF",
"quantity": 150.0
}
],
base_currency = 'BRL',
date = '20210711'
)

print(json.dumps(response, indent = 2))
```

> The above call returns the following JSON object:

```
{
"parametric_risk_attribution": {
"unmapped_tickers": [],
"results": {
"port_parametric_var": -705.5372072762883,
"sec_factor_exposure_dixpre": {
"id1": 0.0
},
"factor_parametric_correlations": [
[
1.0
]
],
"sec_parametric_standalone_vol": {
"id1": 428.93616533156944
},
"port_parametric_vol": 428.93616533156944,
"sec_parametric_no_sens_factor_exposure": {
"id1": [
6881.489986196383
]
}
...
}
}
}
```

## Workspace

---

> Endpoints

```
GET       /workspaces
GET       /workspaces/:id
POST      /workspaces/:id
DELETE    /workspaces/:id
```

A workspace is a grouping of all entities used inside the Everysk platform. Inside a workspace you have access to portfolios, datastores, reports, custom indexes, files, workflows and report templates.

### The workspace object

> What a workspace object looks like?

```
{
"updated": 1625775417,
"version": "v1",
"description": "This is my first workspace",
"name": "sandbox",
"created": 1625775417
}
```

| Property | Description |
| --- | --- |
| name string | A unique identifier (UID) for the workspace. |
| created timestamp | Time at which the workspace was created. Measured in seconds since the Unix epoch. |
| updated timestamp | Time at which the workspace was updated. Measured in seconds since the Unix epoch. |
| description string | An arbitrary string attached to the report. Often useful for finding detailed information about the report or for filtering a search based on the present hashtags. |
| version string | Indicates the workspace's current version. |

### Creating a workspace

> To create a new workspace, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/workspaces \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-d '{
"name": "sandbox",
"description": "This is my first workspace"
}' \
-X POST
```

```
import everysk
import json

everysk.api_sid=<YOUR_API_SID>
everysk.api_token=<YOUR_API_TOKEN>

response = everysk.Workspace.create(
name='sandbox',
description='This is my first workspace'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"updated": 1625775417,
"version": "v1",
"description": "This is my first workspace",
"name": "sandbox",
"created": 1625775417
}
```

Creates and then returns the new workspace.

HTTP Request

POST /workspaces

HTTP Parameters

| Parameter | Description |
| --- | --- |
| name string | REQUIRED A unique identifier (UID) for the workspace. Every workspace name must have no spaces between the words. |
| description string | optional, default is null Provides detailed information about your workspace. You may add hashtags to create tags allowing you to search for them later. |

### List all workspaces

> To list all workspaces, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/workspaces \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Workspaces.list(query='sandbox')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
[
{
"updated": 1625775417,
"version": "v1",
"description": "This is my first workspace",
"name": "sandbox",
"created": 1625775417
}
]
```

Returns a list of workspaces you’ve previously created. The workspaces are returned in sorted order, with the most recent workspace appearing first.

HTTP Request

GET /workspaces

HTTP Parameters

| Parameter | Description |
| --- | --- |
| query string | optional, default is null Request a list of workspaces filtering it by name. |
| page_size integer | optional, default is 10 Set the number of objects that will be listed per page. |
| page_token integer | optional, default is null The token defines which page will be returned to the user. For further information, please check out our pagination guide. |

### Retrieve a workspace

> To retrieve a workspace, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/workspaces/sandbox \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Workspace.retrieve('sandbox')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"updated": 1625775417,
"version": "v1",
"description": "This is my first workspace",
"name": "sandbox",
"created": 1625775417
}
```

Retrieves the details of an existing workspace by supplying the workspace's id.

HTTP Request

GET /workspaces/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| name string | REQUIRED A unique identifier for the workspace. Every workspace name must have no spaces between the words. |

### Update a workspace

> To update a workspace, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/workspaces/sandbox \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-d '{
"name": "sandbox",
"description": "My new workspace description",
}' \
-X PUT
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Workspace.modify(
'sandbox',
name='sandbox',
description='My new workspace description'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"updated": 1625775417,
"version": "v1",
"description": "This is my new workspace description",
"name": "new_workspace_name",
"created": 1625775417
}
```

Updates a workspace and then returns the updated workspace.

HTTP Request

PUT /workspaces/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| name string | REQUIRED A unique identifier (UID) for the workspace. Every workspace name must have no spaces between the words. The workspace name can't be changed. |
| description string | optional, default is null Use this field to provide detailed information about your workspace. |
|  |  |

### Delete a workspace

> To delete a workspace, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/workspaces/sandbox \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-X DELETE
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Workspace.remove('sandbox')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"deleted": true,
"name": "sandbox"
}
```

Permanently deletes a workspace. It cannot be undone. Returns an object with the workpaces's id and an attribute specifying whether the workspace was successfully deleted or not.

Warning: Deleting a workspace does not delete it's objects!

HTTP Request

DELETE /workspaces/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| name string | REQUIRED A unique identifier (UID) for the workspace. |

## Portfolio

---

> Endpoints

```
POST      /portfolios
GET       /portfolios
GET       /portfolios/:id
PUT       /portfolios/:id
DELETE    /portfolios/:id
```

A portfolio is a collection of financial investments like stocks, bonds, derivatives, commodities, cash, and cash equivalents. Each security can be traded in a specific local currency. The portfolio has a base currency that is required to reflect each FX risk.

### The portfolio object

> What a portfolio object looks like?

```
{
"status": "OK",
"updated": 1625680032,
"description": "This is my first portfolio",
"created": 1625680032,
"tags": [
"first",
"portfolio",
"20210622"
],
"securities": [
{
"status": "OK",
"cost_price": null,
"fx_rate": null,
"unrealized_pl_in_base": null,
"exchange": "XNAS",
"symbol": "AAPL",
"multiplier": null,
"label": null,
"currency": "USD",
"market_price": null,
"unrealized_pl": null,
"isin": null,
"extra_data": null,
"id": "id1",
"quantity": 1000.0,
"name": "Apple Inc"
},
...
],
"date": "20210622",
"version": "v1",
"workspace": "main",
"nlv": null,
"base_currency": "USD",
"id": "port_V7xU8dwCMnJIuyUPHJPx2ynuz",
"name": "My First Portfolio"
}
```

| Property | Description |
| --- | --- |
| id string | Unique identifier (UID) for the portfolio. |
| created timestamp | Time at which the object was created. Measured in seconds since the Unix epoch. |
| updated timestamp | Time at which the object was updated. Measured in seconds since the Unix epoch. |
| name string | The portfolio's name. |
| description string | An arbitrary string attached to the portfolio. Often useful for finding detailed information about the portfolio or for filtering a search based on the present hashtags. |
| tags array | Sequence of hashtags used to find the related portfolio. The more hashtags that are used, the more elements that are filtered out from the search. Labels, dates and any other hashtag can be used. |
| date string date | Portfolio date in the format: YYYYMMDD. The Portfolio Date is important because it instructs the API to use the market conditions and security prices prevailing on that date. In order to run the portfolio using the market conditions prevailing today, use null. |
| base_currency string | 3-letter ISO 4217 code for currency. Portfolios can have their base currency changed via the API call. To see all supported currencies click here. |
| nlv file | The net liquidating value of the portfolio (also called NAV). When not supplied by user, the API will calculate the net liquidating value of all the cash securities. Securities traded on margin are assumed to have NLV zero. Supplying a NLV effectively reconciles the margin. |
| securities array | It is an array of objects to describe the securities in the portfolio. Each object represents a security with a unique id, symbol, quantity and label. For more details click here. |
| workspace string | The workspace where the portfolio was generated. |

### Create a portfolio

> To create a new portfolio, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/portfolios \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-d '{
"name": "My First Portfolio",
"tags": [
"first",
"portfolio",
"20210622"
],
"securities": [
{
"id": "id1",
"symbol": "AAPL",
"quantity": 1000.0
},
{
"id": "id2",
"symbol": "SIE:XETR",
"quantity": 750.0
}
],
"workspace": "main"
}' \
-X POST
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Portfolio.create(
name = 'My First Portfolio',
tags = [
"first",
"portfolio",
"20210622"
],
securities = [
{
"id": "id1",
"symbol": "AAPL",
"quantity": 1000.0
},
{
"id": "id2",
"symbol": "SIE:XETR",
"quantity": 750.0
}
],
workspace='main',
date = '20210622'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"status": "OK",
"updated": 1625680032,
"description": "",
"created": 1625680032,
"tags": [
"first",
"portfolio",
"20210622"
],
"securities": [
{
"status": "OK",
"cost_price": null,
"fx_rate": null,
"unrealized_pl_in_base": null,
"exchange": "XNAS",
"symbol": "AAPL",
"multiplier": null,
"label": null,
"currency": "USD",
"market_price": null,
"unrealized_pl": null,
"isin": null,
"extra_data": null,
"id": "id1",
"quantity": 1000.0,
"name": "Apple Inc"
},
...
],
"date": "20210622",
"version": "v1",
"workspace": "main",
"nlv": null,
"base_currency": "USD",
"id": "port_V7xU8dwCMnJIuyUPHJPx2ynuz",
"name": "My First Portfolio"
}
```

Creates and then returns the new portfolio.

HTTP Request

POST /portfolios

HTTP Parameters

| Parameter | Description |
| --- | --- |
| name string | REQUIRED A mnemonic string to identify a portfolio, besides the portfolio's unique id. |
| description string | optional, default is null Provides detailed information about your portfolio. You may add hashtags to create tags allowing you to search for them later. |
| date string date | optional, default is null (today) Portfolio date in the format: YYYYMMDD. The Portfolio Date is important because it instructs the API to use the market conditions and security prices prevailing on that date. Therefore, historical portfolios will be calculated without look ahead. In order to run the portfolio using market conditions prevailing today, use null. |
| base_currency string | optional, default is USD 3-letter ISO 4217 code for currency. Portfolios can have their base currency changed via the API call. To see all supported currencies click herehere. |
| nlv file | optional, default is null (calculated) The net liquidating value of the portfolio (also called NAV). When not supplied by user, the API will calculate the net liquidating value of all the cash securities. Securities traded on margin are assumed to have NLV zero. Supplying a NLV effectively reconciles the margin. |
| securities array | REQUIRED It is an array of objects to describe the securities in the portfolio. Each object represents a security, which requires a unique id, symbol, quantity. For more details click here. |
| with_securities boolean | optional, default is True When True, the the securities inside the generated portfolio will be returned in the api response. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### List all portfolios

> To list all portfolios, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/portfolios?query=#20210622&workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Portfolio.list(query='#20210622', workspace='main')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
[
{
"status": "OK",
"updated": 1625064158,
"description": "",
"created": 1625064158,
"tags": [
"first",
"portfolio",
"20210622"
],
"date": "20210622",
"version": "v1",
"workspace": "main",
"nlv": null,
"base_currency": "USD",
"id": "port_EUCUUH8M3GNeopdFvrZ47qGx3",
"name": "My First Portfolio"
},
...
]
```

Returns a list of portfolios you’ve previously created. The portfolios are returned in sorted order, with the most recent portfolio appearing first.

HTTP Request

GET /portfolios

HTTP Parameters

| Parameter | Description |
| --- | --- |
| query string | optional, default is null Request a list of portfolios filtering it by name or tag. When using a tag to perform a query, each term must include a hashtag prefix. (e.g: query="#april #sample") |
| workspace string | optional, default is main Determines on which workspace the request will be made. |
| page_size integer | optional, default is 10 Set the number of objects that will be listed per page. |
| page_token integer | optional, default is null The token defines which page will be returned to the user. For further information, please check out our pagination guide. |

### Retrieve a portfolio

> To retrieve a portfolio, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/portfolios/port_V7xU8dwCMnJIuyUPHJPx2ynuz?workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```



**Python:**



```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Portfolio.retrieve(
'port_V7xU8dwCMnJIuyUPHJPx2ynuz',
workspace='main'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"status": "OK",
"updated": 1625680032,
"description": "",
"created": 1625680032,
"tags": [
"first",
"portfolio",
"20210622"
],
"securities": [
{
"status": "OK",
"cost_price": null,
"fx_rate": null,
"unrealized_pl_in_base": null,
"exchange": "XNAS",
"symbol": "AAPL",
"multiplier": null,
"label": null,
"currency": "USD",
"market_price": null,
"unrealized_pl": null,
"isin": null,
"extra_data": null,
"id": "id1",
"quantity": 1000.0,
"name": "Apple Inc"
},
...
],
"date": "20210622",
"version": "v1",
"workspace": "main",
"nlv": null,
"base_currency": "USD",
"id": "port_V7xU8dwCMnJIuyUPHJPx2ynuz",
"name": "My First Portfolio"
}
```

Retrieves the details of an existing portfolio by supplying the portfolio's id.

HTTP Request

GET /portfolios/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED A unique identifier (UID) for a portfolio. A portfolio's id will always look like this: port_V7xU8dwCMnJIuyUPHJPx2ynuz |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### Update a portfolio

> To update a portfolio, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/portfolios/port_V7xU8dwCMnJIuyUPHJPx2ynuz \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-d '{
"name": "New Portfolio`s Name",
"description": "New Portfolio`s Description",
"securities": [
{
"id": "id3",
"symbol": "NFLX",
"quantity": 500.0
}
],
"workspace": "main"
}' \
-X PUT
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Portfolio.modify(
'port_V7xU8dwCMnJIuyUPHJPx2ynuz',
name = 'New Portfolio Name',
description = 'New Portfolio Description',
securities = [
{
"id": "id3",
"symbol": "NFLX",
"quantity": 500.0
}
],
workspace='main'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"status": "OK",
"updated": 1625680366,
"description": "New Portfolio's Description",
"created": 1625680032,
"tags": [
"first",
"portfolio",
"20210622"
],
"securities": [
{
"status": "OK",
"cost_price": null,
"fx_rate": null,
"unrealized_pl_in_base": null,
"exchange": "XNAS",
"symbol": "NFLX",
"multiplier": null,
"label": null,
"currency": "USD",
"market_price": null,
"unrealized_pl": null,
"isin": null,
"extra_data": null,
"id": "id3",
"quantity": 500.0,
"name": "NetFlix Inc"
}
],
"date": "20210707",
"version": "v1",
"workspace": "main",
"nlv": null,
"base_currency": "USD",
"id": "port_V7xU8dwCMnJIuyUPHJPx2ynuz",
"name": "New Portfolio's Name"
}
```

Updates a portfolio and then returns the updated portfolio.

HTTP Request

PUT /portfolios/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED A unique identifier (UID) for a portfolio. |
| name string | optional, default is null A string to identify a portfolio besides the portfolio's id. Feel free to use a meaningful name for your portfolio. |
| description string | optional, default is null Use this field to provide detailed information about your portfolio. You also can add hashtags to create groups or categories allowing you to search for them later. |
| base_currency string | optional, default is null 3-letter ISO 4217 code for currency. Entering a currency here changes the base currency of the portfolio. To see all supported currencies click here. |
| securities array | It is an array of objects to describe the securities in the portfolio. Each object represents a security with a unique id, symbol, quantity and label. For more details click here. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### Delete a portfolio

> To delete a portfolio, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/portfolios/port_V7xU8dwCMnJIuyUPHJPx2ynuz?workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-X DELETE
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Portfolio.remove('port_V7xU8dwCMnJIuyUPHJPx2ynuz', workspace='main')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"deleted": true,
"id": "port_V7xU8dwCMnJIuyUPHJPx2ynuz",
"name": "My First Portfolio"
}
```

Permanently deletes a portfolio. It cannot be undone. Returns an object with the portfolio's id and an attribute specifying whether the portfolio was successfully deleted or not.

HTTP Request

DELETE /portfolios/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED The portfolio's unique indetifier. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

## Datastore

---

> Endpoints

```
POST      /datastores
GET       /datastores
GET       /datastores/:id
PUT       /datastores/:id
DELETE    /datastores/:id
```

Datastores are fully integrated repositories to manage and persist data. They can record data calculated by Everysk’s servers, proprietary data from the client or both. The most common usage is the storage of securities as rows and related properties as columns, but there are no constraints on the usage. They enable powerful data explorations and trend analysis to be performed.

### The datastore object

> What a datastore object looks like?

```
{
"updated": 1625688283,
"name": "My First Datastore",
"tags": [
"first",
"datastore",
"20210622"
],
"created": 1625688283,
"version": "v1",
"workspace": "main",
"date": "20210622 12:00:00",
"data": [
[
"MIC",
"SYMBOL",
"LATEST SECURITY DATE",
"LATEST SECURITY VALUE"
],
[
"XKRX",
"003550:XKRX",
"20210429",
126500.0
]
],
"id": "dats_52KiJy2yFvosTtWM5aUJcOs1R",
"description": "This is my first datastore"
}
```

| Property | Description |
| --- | --- |
| id string | Unique identifier (UID) for the datastore. |
| created timestamp | Time at which the object was created. Measured in seconds since the Unix epoch. |
| updated timestamp | Time at which the object was updated. Measured in seconds since the Unix epoch. |
| name string | The datastore's name. |
| description string | An arbitrary string attached to the datastore. Often useful for finding detailed information about the datastore or for filtering a search based on the present hashtags. |
| tags array | Sequence of hashtags used to find the related DataStore. The more hashtags that are used, the more elements that are filtered out from the search. Labels, dates and any other hashtag can be used. |
| version string | Indicates the datastore's current version. |
| date string | Datastore date in the format: YYYYMMDD. The Datastore Date is important because it instructs the API to use the market conditions and security prices prevailing on that date. In order to run the datastore using the market conditions prevailing today, use null. |
| data array | The content that will be stored inside the Datastore. |
| workspace string | The workspace where the datastore was generated. |

### Create a datastore

> To create a new datastore, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/datastores \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-d '{
"name": "My First Datastore",
"tags": [
"first",
"datastore",
"20210622"
],
"description": "This is my second datastore",
"date": "20210622",
"data": [
[
"MIC",
"SYMBOL",
"LATEST SECURITY DATE",
"LATEST SECURITY VALUE"
],
[
"XKRX",
"003550:XKRX",
"20210429",
126500.0
],
],
"workspace": "main"
}' \
-X POST
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Datastore.create(
name='My First Datastore',
tags=[
"first",
"datastore",
"20210622"
],
description='This is my second datastore',
date='20210622',
data=[
[
"MIC",
"SYMBOL",
"LATEST SECURITY DATE",
"LATEST SECURITY VALUE"
],
[
"XKRX",
"003550:XKRX",
"20210429",
126500.0
],
],
workspace="main"
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"updated": 1625688283,
"name": "My First Datastore",
"tags": [
"first",
"datastore",
"20210622"
],
"created": 1625688283,
"version": "v1",
"workspace": "main",
"date": "20210622 12:00:00",
"data": [
[
"MIC",
"SYMBOL",
"LATEST SECURITY DATE",
"LATEST SECURITY VALUE"
],
[
"XKRX",
"003550:XKRX",
"20210429",
126500.0
]
],
"id": "dats_52KiJy2yFvosTtWM5aUJcOs1R",
"description": "This is my first datastore"
}
```

Creates and then returns the new datastore.

HTTP Request

POST /datastores

HTTP Parameters

| Parameter | Description |
| --- | --- |
| name string | REQUIRED A string to identify a datastore besides the datastore's id. Feel free to use a meaningful name for your datastore. |
| description string | optional, default is null Provides detailed information about your datastore. You may add hashtags to create tags allowing you to search for them later. |
| tags string | optional, default is null Filters the list of datastores through the tags added in the description. Do not use hashtags when passing a value to this parameter. |
| date string | optional, default is null (today) Datastore date in the format: YYYYMMDD. The Datastore Date is important because it instructs the API to use the market conditions and security prices prevailing on that date. Therefore, historical datastores will be calculated without look ahead. In order to run the datastore using market conditions prevailing today, use null. |
| data array | REQUIRED The content that will be stored inside the Datastore. |
| with_data boolean | optional, default is True When True, the the data inside the generated datastore will be returned in the api response. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### List all datastores

> To list all datastores, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/datastores?query=#20210622&workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Datastore.list(query='#20210622', workspace='main')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
[
{
"updated": 1625507085,
"name": "My First Datastore",
"tags": [
"first",
"datastore",
"20210622"
],
"created": 1625507085,
"version": "v1",
"workspace": "main",
"date": "20210622 12:00:00",
"id": "dats_xSYqUnLuQue8WwE9nEfgg0TVL",
"description": "This is my first datastore"
},
...
]
```

Returns a list of datastores you’ve previously created. The datastores are returned in sorted order, with the most recent datastore appearing first.

HTTP Request

GET /datastores

HTTP Parameters

| Parameter | Description |
| --- | --- |
| query string | optional, default is null Request a list of datastores filtering it by name or tag. When using a tag to perform a query, each term must include a hashtag prefix. (e.g: query="#april #sample") |
| workspace string | optional, default is main Determines on which workspace the request will be made. |
| page_size integer | optional, default is 10 Set the number of objects that will be listed per page. |
| page_token integer | optional, default is null The token defines which page will be returned to the user. For further information, please check out our pagination guide. |

### Retrieve a datastore

> To retrieve a datastore, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/datastores/dats_52KiJy2yFvosTtWM5aUJcOs1R?workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Datastore.retrieve(
'dats_52KiJy2yFvosTtWM5aUJcOs1R',
workspace='main'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"updated": 1625688283,
"name": "My First Datastore",
"tags": [
"first",
"datastore",
"20210622"
],
"created": 1625688283,
"version": "v1",
"workspace": "main",
"date": "20210622 12:00:00",
"data": [
[
"MIC",
"SYMBOL",
"LATEST SECURITY DATE",
"LATEST SECURITY VALUE"
],
[
"XKRX",
"003550:XKRX",
"20210429",
126500.0
]
],
"id": "dats_52KiJy2yFvosTtWM5aUJcOs1R",
"description": "This is my first datastore"
}
```

Retrieves the details of an existing datastore by supplying the datastore's id.

HTTP Request

GET /datastores/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED A unique identifier (UID) for a datastore. A datastore's id will always look like this: dats_52KiJy2yFvosTtWM5aUJcOs1R. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### Update a datastore

> To update a datastore, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/datastores/dats_52KiJy2yFvosTtWM5aUJcOs1R \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-d '{
"name": "My New Datastore Name",
"description": "My new datastore description",
"data": [
[
"MIC",
"SYMBOL",
"LATEST SECURITY DATE",
"LATEST SECURITY VALUE"
],
[
"XLIF",
"CAM:XLIF",
"20190211",
17.504
],
],
"workspace": "main"
}' \
-X PUT
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Datastore.modify(
'dats_52KiJy2yFvosTtWM5aUJcOs1R',
name = 'My New Datastore Name',
description = 'My new datastore description',
data = [
[
"MIC",
"SYMBOL",
"LATEST SECURITY DATE",
"LATEST SECURITY VALUE"
],
[
"XLIF",
"CAM:XLIF",
"20190211",
17.504
],
],
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"updated": 1625690528,
"name": "My New Datastore Name",
"tags": [
"first",
"datastore",
"20210622"
],
"created": 1625688283,
"version": "v1",
"workspace": "main",
"date": "20210707 20:42:08",
"data": [
[
"MIC",
"SYMBOL",
"LATEST SECURITY DATE",
"LATEST SECURITY VALUE"
],
[
"XLIF",
"CAM:XLIF",
"20190211",
17.504
]
],
"id": "dats_52KiJy2yFvosTtWM5aUJcOs1R",
"description": "My new datastore description"
}
```

Updates a datastore and then returns the updated datastore.

HTTP Request

PUT /datastores/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED A unique identifier (UID) for a datastore. |
| name string | optional, default is null A string to identify a datastore besides the datastore's id. Feel free to use a meaningful name for your datastore. |
| description string | optional, default is null Use this field to provide detailed information about your datastore. You also can add hashtags to create groups or categories allowing you to search for them later. |
| tags string | optional, default is null Filters the list of datastores through the tags added in the description. Do not use hashtags when passing a value to this parameter. |
| data array | The content that will be stored inside the Datastore. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### Delete a datastore

> To delete a datastore, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/datastores/dats_52KiJy2yFvosTtWM5aUJcOs1R?workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-X DELETE
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Datastore.remove('dats_52KiJy2yFvosTtWM5aUJcOs1R', workspace='main')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"deleted": true,
"id": "dats_52KiJy2yFvosTtWM5aUJcOs1R",
"name": "My First Datastore"
}
```

Permanently deletes a datastore. It cannot be undone. Returns an object with the datastore's id and an attribute specifying whether the datastore was successfully deleted or not.

HTTP Request

DELETE /datastores/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED The datastore's unique indetifier. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

## Report

---

> Endpoints

```
GET       /reports
GET       /reports/:id
POST      /reports/:id/share
DELETE    /reports/:id
```

Interactive dashboards that present portfolio analytics information in an intuitive and explorable way. Reports represent a specific portfolio and date so that they can be referenced in the future.

### The report object

> What a report object looks like?

```
{
"updated": 1624633602,
"name": "My First Report",
"relative_url": "/report/f46906305657494f9e6bd25e0dcae769",
"tags": [
"first",
"report",
"20210622"
],
"url": "https://app.everysk.com/report/f46906304787494f9e6bd25e0dcae769",
"absolute_url": "https://app.everysk.com/report/f46906304787494f9e6bd25e0dcae769",
"created": 1624633585,
"version": "v1",
"workspace": "preview",
"id": "repo_KqbStPc7x2m5GW1GWKZCVlzPM",
"authorization": "PRIVATE",
"description": "This is my first report."
}
```

| Property | Description |
| --- | --- |
| id string | Unique identifier (UID) for the report. |
| created timestamp | Time at which the object was created, measured in seconds since the Unix epoch. |
| updated timestamp | Time at which the object was last updated, measured in seconds since the Unix epoch. |
| name string | The report's name. |
| description string | An arbitrary string attached to the report. Useful for adding details or enabling searches based on hashtags. |
| tags array | Sequence of hashtags associated with the report. Multiple hashtags improve filtering (labels, dates, or other terms can be used). |
| version string | Indicates the report's current version. |
| date string | Report date in the format YYYYMMDD. The Report Date instructs the API to use the market conditions and security prices prevailing on that date. To run the report using today’s conditions, use null. |
| data array | The content stored inside the report. |
| authorization string | Indicates whether the report is public or private. |
| url string | The web address where the report can be accessed. |
| absolute_url string | The absolute web address where the report can be accessed. |
| relative_url string | The relative endpoint where the report can be accessed. |
| workspace string | The workspace in which the report was generated. |

### List all reports

> To list all reports, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/reports?query=#20210622&workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Report.list(query='#20210622', workspace='main')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
[
{
"updated": 1624633522,
"name": "My Second Report",
"relative_url": "/report/6870426745114f7cb17595be77bea64c",
"tags": [
"second",
"report",
"20210622"
],
"url": "https://app.everysk.com/report/6870426745114f7cb17595be77bea64c",
"absolute_url": "https://app.everysk.com/report/6870426745114f7cb17595be77bea64c",
"created": 1624633522,
"version": "v1",
"workspace": "main",
"id": "repo_N2wZOHGo5pbmhVwQT3UX2ifk4",
"authorization": "PRIVATE",
"description": ""
},
{
"updated": 1624633602,
"name": "My First Report",
"relative_url": "/report/f46906305657494f9e6bd25e0dcae769",
"tags": [
"first",
"report",
"20210622"
],
"url": "https://app.everysk.com/report/f46906304787494f9e6bd25e0dcae769",
"absolute_url": "https://app.everysk.com/report/f46906304787494f9e6bd25e0dcae769",
"created": 1624633585,
"version": "v1",
"workspace": "main",
"id": "repo_KqbStPc7x2m5GW1GWKZCVlzPM",
"authorization": "PRIVATE",
"description": ""
}
]
```

Returns a list of reports you’ve previously generated. The reports are returned in sorted order, with the most recent report appearing first.

HTTP Request

GET /reports

HTTP Parameters

| Parameter | Description |
| --- | --- |
| query string | optional, default is null Request a list of reports filtering it by name or tag. When using a tag to perform a query, each term must include a hashtag prefix. (e.g: query="#april #sample") |
| workspace string | optional, default is main Determines on which workspace the request will be made. |
| page_size int | optional, default is 10 Set the number of objects that will be listed per page. |
| page_token int | optional, default is null The token defines which page will be returned to the user. For further information, please check out our pagination guide. |

### Retrieve a report

> To retrieve a report, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/reports/repo_N2wZOHGo5pbmhVwQT3UX2ifk4?workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Report.retrieve(
'repo_N2wZOHGo5pbmhVwQT3UX2ifk4',
workspace='main'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"updated": 1624633522,
"name": "My First Report",
"relative_url": "/report/6870426745114f7cb17595be77bea64c",
"tags": [
"first",
"report",
"20210622"
],
"url": "https://app.everysk.com/report/6870426745114f7cb17595be77bea64c",
"absolute_url": "https://app.everysk.com/report/6870426745114f7cb17595be77bea64c",
"created": 1624633522,
"version": "v1",
"workspace": "main",
"widgets": [
{
"absolute_url": "https://app.everysk.com/widget/5a4b6fc49767400c9f1cdddd4cc31050",
"id": "5a4b6fc49767400c9f1cdddd4cc31050",
"relative_url": "/widget/5a4b6fc49767400c9f1cdddd4cc31050",
"name": "Portfolio Property"
}
],
"id": "repo_N2wZOHGo5pbmhVwQT3UX2ifk4",
"authorization": "PRIVATE",
"description": "This is my first report!"
}
```

Retrieves the details of an existing report by supplying the report's id.

HTTP Request

GET /reports/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED A unique identifier (UID) for a report. A report's id will always look like this: repo_N2wZOHGo5pbmhVwQT3UX2ifk4. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### Share a report

> To share a report, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/reports/repo_N2wZOHGo5pbmhVwQT3UX2ifk4/share \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-X POST
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Report.retrieve('repo_N2wZOHGo5pbmhVwQT3UX2ifk4', workspace='main').share()

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"authorization": "private",
"created": 1574790153,
"description": "This is my first report",
"edited": false,
"id": "repo_NZes7ptmIwJNitfJJwtvXI8RV",
"name": "My First Report",
"shared_url": "https://app.everysk.com/report/shared_TVRSaVltTXhZMkptTVRBeE5ETTNPV0V6TWpKbE1qaGpOVFEzTnpFMk9HRTZiV0U2LjE1NzQ4NjM2NjYuMDAwMDAwMzYwMC4yQnlFWFFsQUlnbjZmcTU0bjBRcUZWS2NxallDM3FnM3NXTTdOWmtNc2dz/light",
"tags": [
"first",
"report",
"20210622"
],
"url": "https://app.everysk.com/report/14bbc1cbf1014379a322e28c5477168a"
}
```

Generates a url address where the report can be accessed.

HTTP Request

POST /reports/:id/share

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED A unique identifier (UID) for a report. |
| expires_after string | optional, default is 1 hour Remaning time for the url address to expire. |
| skin_theme string | optional, default is Light Sets the report's color theme. It accepts: Dark or Light. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### Delete a report

> To delete a report, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/reports/repo_N2wZOHGo5pbmhVwQT3UX2ifk4?workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-X DELETE
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Report.remove('repo_N2wZOHGo5pbmhVwQT3UX2ifk4', workspace='main')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"deleted": true,
"id": "repo_N2wZOHGo5pbmhVwQT3UX2ifk4"
}
```

Permanently deletes a report. It cannot be undone. Returns an object with the report's id and an attribute specifying whether the report was successfully deleted or not.

HTTP Request

DELETE /reports/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED A unique identifier (UID) for a report. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

## Custom Index

---

> Endpoints

```
POST      /custom_indexes
GET       /custom_indexes
GET       /custom_indexes/:id
PUT       /custom_indexes/:id
DELETE    /custom_indexes/:id
```

A custom index is a proprietary vector of date-value tuples. It can represent a proprietary benchmark, a risk factor, a proxy or any other measure. Even when persisted to your account, it is only available to the account. Custom Indexes are not bind to a workspace. All custom indexes must be created as the following pattern: "CUSTOM:[A-Z_][A-Z0-9_]"

### The Custom Index Object

> What a custom index object looks like?

```
{
"updated": 1625598288,
"description": "This is my first custom index",
"data_type": "PRICE",
"created": 1625598288,
"symbol": "CUSTOM:AAPLBRL",
"tags": [
"first",
"custom_index",
"20210622"
],
"name": "AAPL in BRL",
"currency": "BRL",
"version": "v1",
"data": [
["20201209", 554.69],
["20190814", 985.45],
["20171012", 885.07]
],
"periodicity": "D",
"base_price": 1.0
}
```

| Property | Description |
| --- | --- |
| symbol string | Unique identifier for the custom index. |
| created timestamp | Time at which the object was created. Measured in seconds since the Unix epoch. |
| updated timestamp | Time at which the object was updated. Measured in seconds since the Unix epoch. |
| name string | The name of the custom index. |
| description string | An arbitrary string attached to the custom index. Often useful for finding detailed information about the custom index or for filtering a search based on the present hashtags. |
| tags array | Sequence of hashtags used to find the related Custom Index. The more hashtags that are used, the more elements that are filtered out from the search. Labels, dates and any other hashtag can be used. |
| data_type string | The type of data sent through the data parameter. It can be: PRICE, RETURN(Decimal) or RETURN_100(Percentual). |
| currency string | 3-letter ISO 4217 code for currency. To see all supported currencies click here. |
| version string | Indicates the custom index's current version. |
| periodicity string | The periodicity of the data changes. It can be: D (Daily) or M (Monthly). |
| base_price float | The base price when data_type is set to RETURN or RETURN_100 . |
| data array | The content that will be stored inside the Custom Index. |

### Create a custom index

Creates and then returns the new custom index.

> To create a new custom index, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/custom_indexes \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-d '{
"symbol": "CUSTOM:AAPLBRL",
"name": "AAPL-BRL",
"tags": [
"first",
"custom_index",
"20210622"
],
"description": "This is my first custom index",
"currency": "BRL",
"date": "20210622",
"data": [
["20201209", 554.69],
["20190814", 985.45],
["20171012", 885.07]
]
}' \
-X POST
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.CustomIndex.create(
symbol='CUSTOM:AAPLBRL',
name='AAPL-BRL',
tags=[
"first",
"custom_index",
"20210622"
],
description='This is my first custom index',
currency='BRL',
date='20210622',
data=[
["20201209", 554.69],
["20190814", 985.45],
["20171012", 885.07]
]
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"updated": 1625598288,
"description": "This is my first custom index",
"data_type": "PRICE",
"created": 1625598288,
"symbol": "CUSTOM:AAPLBRL",
"tags": [
"first",
"custom_index",
"20210622"
],
"name": "AAPL in BRL",
"currency": "BRL",
"version": "v1",
"data": [
["20201209", 554.69],
["20190814", 985.45],
["20171012", 885.07]
],
"periodicity": "D",
"base_price": 1.0
}
```

HTTP Request

POST /custom_indexes

HTTP Parameters

| Parameter | Description |
| --- | --- |
| symbol string | REQUIRED A unique identifier (UID) for a custom index. Every custom index symbol must begins with CUSTOM and have no spaces between words. |
| name string | REQUIRED A string to identify a custom index besides the custom index's id. Feel free to use a meaningful name for your custom index. |
| description string | optional, default is null Use this field to provide detailed information about your custom index. You also can add hashtags to create groups or categories allowing you to search for them later. |
| tags string | optional, default is null Filters the list of custom indexes through the tags added in the description. Do not use hashtags when passing a value to this parameter. |
| data_type string | optional, default is PRICE The type of data sent through the data parameter. It can be: PRICE, RETURN(Decimal) or RETURN_100(Percentual). |
| periodicity string | optional, default is D The periodicity of the data changes. It can be: D (Daily) or M (Monthly). |
| currency string | optional, default is USD 3-letter ISO 4217 code for currency. To see all supported currencies click here. |
| base_price float | optional, default is 1.0 The base price when data_type is set to RETURN or RETURN_100. |
| data array | REQUIRED The content that will be stored inside the Custom Index. |

### List all custom indexes

> To list all custom indexes, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/custom_indexes?query=#20210622 \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.CustomIndex.list(query='#20210622')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
[
{
"updated": 1625598288,
"description": "This is my first custom index",
"data_type": "PRICE",
"created": 1625598288,
"symbol": "CUSTOM:APPLBRL",
"tags": [
"first",
"custom_index",
"20210622"
],
"name": "AAPL in BRL",
"currency": "USD",
"version": "v1",
"periodicity": "D",
"base_price": 1.0
},
...
]
```

Returns a list of custom indexes you’ve previously created. The custom indexes are returned in sorted order, with the most recent custom index appearing first.

HTTP Request

GET /custom_indexes

HTTP Parameters

| Parameter | Description |
| --- | --- |
| query string | optional, default is null Request a list of custom indexes filtering it by name or tag. When using a tag to perform a query, each term must include a hashtag prefix. (e.g: query="#april #sample") |
| page_size integer | optional, default is 10 Set the number of objects that will be listed per page. |
| page_token integer | optional, default is null The token defines which page will be returned to the user. For further information, please check out our pagination guide. |

### Retrieve a Custom Index

> To retrieve a custom index, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/custom_indexes/CUSTOM:APPLBRL \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.CustomIndexes.retrieve('CUSTOM:APPLBRL')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"updated": 1625598288,
"description": "This is my first custom index",
"data_type": "PRICE",
"created": 1625598288,
"symbol": "CUSTOM:AAPLBRL",
"tags": [
"first",
"custom_index",
"20210622"
],
"name": "AAPL in BRL",
"currency": "BRL",
"version": "v1",
"data": [
["20201209", 554.69],
["20190814", 985.45],
["20171012", 885.07]
],
"periodicity": "D",
"base_price": 1.0
}
```

Retrieves the details of an existing custom index by supplying the custom index's symbol.

HTTP Request

GET /custom_indexes/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| symbol string | REQUIRED A unique identifier (UID) for a custom index. A custom index symbol will always look like this: CUSTOM:APPLBRL. |

### Update a custom index

Updates a custom index and then returns the updated custom index.

> To update a custom index, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/custom_indexes/CUSTOM:AAPLBRL \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-d '{
"data": [
["20200622", 952.12],
["20200522", 953.06],
["20200421", 953.25],
],
"description": "My new custom index description",
"data_type": "PRICE",
"periodicity": "M"
}' \
-X PUT
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.CustomIndex.modify(
'CUSTOM:AAPLBRL',
data=[
["20200622", 952.12],
["20200522", 953.06],
["20200421", 953.25],
],
description='My new custom index description',
data_type='PRICE',
periodicity='M'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"updated": 1625668154,
"description": "My new custom index description",
"data_type": "PRICE",
"created": 1625598288,
"symbol": "CUSTOM:AAPLBRL",
"tags": [
"first",
"custom_index",
"20210622"
],
"name": "My New Custom Index",
"currency": "BRL",
"version": "v1",
"data": [
["20200622", 952.12],
["20200522", 953.06],
["20200421", 953.25]
],
"periodicity": "M",
"base_price": 1.0
}
```

HTTP Request

PUT /custom_indexes/:symbol

HTTP Parameters

| Parameter | Description |
| --- | --- |
| name string | REQUIRED A string to identify a custom index besides the custom index's id. Feel free to use a meaningful name for your custom index. |
| description string | optional, default is null Use this field to provide detailed information about your custom index. You also can add hashtags to create groups or categories allowing you to search for them later. |
| tags string | optional, default is null Filters the list of custom indexes through the tags added in the description. Do not use hashtags when passing a value to this parameter. |
| data_type string | optional, default is PRICE The type of data sent through the data parameter. It can be: PRICE, RETURN(Decimal) or RETURN_100(Percentual). |
| periodicity string | optional, default is D The periodicity of the data changes. It can be: D (Daily) or M (Monthly). |
| currency string | optional, default is USD 3-letter ISO 4217 code for currency. To see all supported currencies click here. |
| base_price float | optional, default is 1.0 The base price when data_type is set to RETURN or RETURN_100. |
| data array | REQUIRED The content that will be stored inside the Custom Index. |

### Delete a custom index

> To delete a custom index, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/custom_indexes/CUSTOM:AAPLBRL \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-X DELETE
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.CustomIndex.remove('CUSTOM:AAPLBRL')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"deleted": true,
"symbol": "CUSTOM:AAPLBRL",
"name": "AAPL in BRL"
}
```

Permanently deletes a custom index. It cannot be undone. Returns an object with the custom index's id and an attribute specifying whether the custom index was successfully deleted or not.

HTTP Request

DELETE /custom_indexes/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| symbol string | REQUIRED A unique identifier (UID) for a custom index. Every custom index symbol must begins with CUSTOM and have no spaces between words. |

## File

---

> Endpoints

```
POST      /files
GET       /files
GET       /files/:id
PUT       /files/:id
DELETE    /files/:id
```

A file is a collection of data stored in one unit, identified by a filename. It can be a document, picture, data library, application, or other collection of data.

### The file object

> What a file object looks like?

```
{
"content_type": "text/csv",
"url": "/file/40218fbb3b2c49d7b78c5bfc40f66b56",
"tags": [
"first",
"file",
"20210622"
],
"created": 1628774405,
"updated": 1628774405,
"version": "v1",
"id": "file_F6jkfLDarpyTQAJBjGwx9r2cl",
"workspace": "main",
"data": "aGVsbG8gd29ybGQ=",
"name": "MyFirstFile.csv",
"description": "This is my first file"
}
```

| Property | Description |
| --- | --- |
| id string | Unique identifier (UID) for the file. |
| content_type string | A string to identify the file's format. |
| created timestamp | Time at which the object was created. Measured in seconds since the Unix epoch. |
| updated timestamp | Time at which the object was updated. Measured in seconds since the Unix epoch. |
| name string | The file's name. |
| description string | An arbitrary string attached to the report. Often useful for finding detailed information about the file or for filtering a search based on the present hashtags. |
| tags array | Sequence of hashtags used to find the related file. The more hashtags that are used, the more elements that are filtered out from the search. Labels, dates and any other hashtag can be used. |
| version string | Indicates the file's current version. |
| date string | File date in the format: YYYYMMDD. |
| data string | The content that will be stored inside the file. It must be in Base64 format. |
| workspace string | The workspace where the file was generated. |

### Create a file

> To create a new file, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/files \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-d '{
"name": "MyFirstFile.csv",
"tags": [
"first",
"file",
"20210622"
],
"description": "This is my first stored file",
"data": "aGVsbG8gd29ybGQ=",
"content-type": "text/csv",
"workspace": "main"
}' \
-X POST
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.File.create(
name='My First File',
tags=[
"first",
"file",
"20210622"
],
description='This is my first stored file',
data="aGVsbG8gd29ybGQ=",
content_type='text/csv',
workspace='main'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"status": "OK",
"data": {
"content_type": "text/csv",
"workspace": "main",
"data": "aGVsbG8gd29ybGQ=",
"name": "MyFirstFile.csv",
"tags": [
"first",
"file",
"20210622"
],
"description": "My first stored file"
}
}
```

Creates and then returns the new file.

HTTP Request

POST /files

HTTP Parameters

| Parameter | Description |
| --- | --- |
| name string | REQUIRED A string to identify a file besides the file's id. Feel free to use a meaningful name for your file. |
| description string | REQUIRED Provides detailed information about your file. You may add hashtags to create tags allowing you to search for them later. |
| tags string | optional, default is null Filters the list of files through the tags added in the description. Do not use hashtags when passing a value to this parameter. |
| data string | REQUIRED The content that will be stored inside the file. It must be in Base64 format. |
| with_data boolean | optional, default is True When True, the the data inside the generated file will be returned in the api response. |
| content_type string | REQUIRED A string to identify the file's format. It accepts image/svg+xml, image/bmp, image/jpeg, image/png, image/gif, application/xml, text/xml, application/javascript, application/json, text/plain, text/csv, application/csv, text/x-comma-separated-values, text/comma-separated-values, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/pdf, application/zip, 'application/x-zip-compressed', application/octet-stream. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### List all files

> To list all files, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/files?query=#20210622&workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.File.list(query='#20210622', workspace='main')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
[
{
"content_type": "text/csv",
"name": "MyFirstFile.csv",
"url": "/file/cd83dc4a00ca489fb4c5b37bee26c86e",
"workspace": "main",
"data": "aGVsbG8gd29ybGQ=",
"version": "v1",
"description": "My first stored file",
"created": 1628791473,
"id": "file_TIi0Fsjab3bbJoyg4cezSGEiY",
"updated": 1628791473,
"tags": [
"first",
"file",
"20210622"
],
},
...
]
```

Returns a list of files you’ve previously created. The files are returned in sorted order, with the most recent file appearing first.

HTTP Request

GET /files

HTTP Parameters

| Parameter | Description |
| --- | --- |
| query string | optional, default is null Request a list of files filtering it by name or tag. When using a tag to perform a query, each term must include a hashtag prefix. (e.g: query="#april #sample") |
| workspace string | optional, default is main Determines on which workspace the request will be made. |
| page_size integer | optional, default is 10 Set the number of objects that will be listed per page. |
| page_token integer | optional, default is null The token defines which page will be returned to the user. For further information, please check out our pagination guide. |

### Retrieve a file

> To retrieve a file, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/files/file_F6jkfLDarpyTQAJBjGwx9r2cl?workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.File.retrieve(
'file_F6jkfLDarpyTQAJBjGwx9r2cl',
workspace='main'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"status": "OK",
"data": {
"file": {
"content_type": "text/csv",
"url": "/file/40218fbb3b2c49d7b78c5bfc40f66b56",
"created": 1628774405,
"tags": [
"first",
"file",
"20210622"
],
"updated": 1628774405,
"version": "v1",
"id": "file_F6jkfLDarpyTQAJBjGwx9r2cl",
"workspace": "main",
"data": "aGVsbG8gd29ybGQ=",
"name": "MyFirstFile.csv",
"description": "This is my first stored file"
}
}
}
```

Retrieves the details of an existing file by supplying the file's id.

HTTP Request

GET /files/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED A unique identifier (UID) for a file. A file's id will always look like this: file_F6jkfLDarpyTQAJBjGwx9r2cl. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### Update a file

> To update a file, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/files/file_F6jkfLDarpyTQAJBjGwx9r2cl \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-d '{
"name": "UpdatedFile.csv",
"description": "My first file was updated",
"data": "aGVsbG8geW91IGFsbA==",
"content_type": "text/csv"
}' \
-X PUT
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.File.modify(
'file_F6jkfLDarpyTQAJBjGwx9r2cl',
name='UpdatedFile.csv',
description='My first file was updated',
data="aGVsbG8geW91IGFsbA==",
content_type='text/csv',
workspace='main'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"status": "OK",
"data": {
"file": {
"data": "aGVsbG8geW91IGFsbA==",
"content_type": "text/csv",
"name": "UpdatedFile.csv",
"url": "/file/8c5bdaf066bc4208a06e9808426afdda",
"workspace": "main",
"version": "v1",
"description": "My first file was updated",
"created": 1628774405,
"id": "file_F6jkfLDarpyTQAJBjGwx9r2cl",
"updated": 1628792475,
"tags": [
"first",
"file",
"20210622"
],
}
}
}
```

Updates a file and then returns the updated file.

HTTP Request

PUT /files/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| name string | REQUIRED A string to identify a file besides the file's id. Feel free to use a meaningful name for your file. |
| description string | REQUIRED Provides detailed information about your file. You may add hashtags to create tags allowing you to search for them later. |
| tags string | optional, default is null Filters the list of files through the tags added in the description. Do not use hashtags when passing a value to this parameter. |
| data string | REQUIRED The content that will be stored inside the file. It must be in Base64 format. |
| content_type string | REQUIRED A string to identify the file's format. It accepts image/svg+xml, image/bmp, image/jpeg, image/png, image/gif, application/xml, application/javascript, application/json, application/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/pdf, application/octet-stream, application/zip, text/xml, text/plain, text/csv, text/comma-separated-values, text/x-comma-separated-values. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### Delete a file

> To delete a file, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/files/dats_52KiJy2yFvosTtWM5aUJcOs1R?workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-X DELETE
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Datastore.remove('file_F6jkfLDarpyTQAJBjGwx9r2cl')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"id": "file_F6jkfLDarpyTQAJBjGwx9r2cl",
"name": "MyFirstFile.csv",
"deleted": true
}
```

Permanently deletes a file. It cannot be undone. Returns an object with the file's id and an attribute specifying whether the file was successfully deleted or not.

HTTP Request

DELETE /files/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED The file's unique indetifier. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

## Workflow

---

> Endpoints

```
GET       /workflows
GET       /workflows/:id
POST      /workflows/:id
DELETE    /workflows/:id
```

A workflow is a collection of digital workers linked together to perform tasks in an automated fashion. Workflows can incorporate portfolios, datastores, report templates, API, and email distributions, as well as standard and custom digital workers.

### The workflow object

> What a workflow object looks like?

```
{
"status": "OK",
"updated": 1624633670,
"description": "This is my first workflow. #first #new #workflow",
"tags": [
"first",
"new",
"workflow"
],
"trigger_enabled": true,
"gui": {
"offset_x": 0,
"zoom": 75,
"offset_y": 0
},
"created": 1624633670,
"starter_worker_id": "wrkr_aVFPQTerHF2JaO0hILbp959v7",
"version": "v1",
"workspace": "main",
"trigger_type": "MANUAL",
"trigger_config": {},
"id": "wrkf_8fRueOt4JlXV9k5o9HZDMWfw7",
"name": "My First Workflow"
}
```

| Property | Description |
| --- | --- |
| id string | Unique identifier (UID) for the workflow. |
| created timestamp | Time at which the object was created. Measured in seconds since the Unix epoch. |
| updated timestamp | Time at which the object was updated. Measured in seconds since the Unix epoch. |
| name string | The workflow's name. |
| description string | An arbitrary string attached to the workflow. Often useful for finding detailed information about the workflow or for filtering a search based on the present hashtags. |
| tags array | Sequence of hashtags used to find the related workflow. The more hashtags that are used, the more elements that are filtered out from the search. Labels, dates and any other hashtag can be used. |
| version string | Indicates the workflow's current version. |
| trigger_type string | The type of the workflow's trigger. It can be Manual, API, Time-Based or Integration File Received. |
| trigger_config object | Parameters used to activate the workflow's trigger. |
| workspace string | The workspace where the workflow was generated. |

### List all workflows

> To list all workflows, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/workflows?query=#20210622&workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Workflow.list(query='#first', workspace='main')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
[
{
"status": "OK",
"updated": 1624633670,
"description": "This is my first workflow. #first #new #workflow",
"tags": [
"first",
"new",
"workflow"
],
"trigger_enabled": true,
"gui": {
"offset_x": 0,
"zoom": 75,
"offset_y": 0
},
"created": 1624633670,
"starter_worker_id": "wrkr_aVFPQTerHF2JaO0hILbp959v7",
"version": "v1",
"workspace": "main",
"trigger_type": "MANUAL",
"trigger_config": {},
"id": "wrkf_8fRueOt4JlXV9k5o9HZDMWfw7",
"name": "My First Workflow"
},
...
]
```

Returns a list of workflows you’ve previously created. The workflows are returned in sorted order, with the most recent workflow appearing first.

HTTP Request

GET /workflows

HTTP Parameters

| Parameter | Description |
| --- | --- |
| query string | optional, default is null Request a list of workflows filtering it by name or tag. When using a tag to perform a query, each term must include a hashtag prefix. (e.g: query="#april #sample") |
| workspace string | optional, default is main Determines on which workspace the request will be made. |
| page_size integer | optional, default is 10 Set the number of objects that will be listed per page. |
| page_token integer | optional, default is null The token defines which page will be returned to the user. For further information, please check out our pagination guide. |

### Retrieve a workflow

Retrieves the details of an existing workflow by supplying the workflow's id.

> To retrieve a workflow, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/workflows/wrkf_uylMWijKauV4B4Te7UJg9cNIv?workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Workflow.retrieve(
'wrkf_uylMWijKauV4B4Te7UJg9cNIv',
workspace='main'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"status": "OK",
"updated": 1624309266,
"description": "This is my first workflow. #first #new #workflow",
"tags": [
"first",
"new",
"workflow"
],
"trigger_enabled": true,
"workers": [
...
],
"created": 1624309074,
"starter_worker_id": "wrkr_jcQBp4Hj2MX3l9xsk8wgAByi7",
"version": "v1",
"workspace": "main",
"id": "wrkf_uylMWijKauV4B4Te7UJg9cNIv",
"trigger_type": "MANUAL",
"trigger_config": {},
"gui": {
"offset_x": 0,
"zoom": 75,
"offset_y": 0
},
"name": "My First Workflow"
}
```

HTTP Request

GET /workflows/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED A unique identifier (UID) for a workflow. A workflow's id will always look like this: wrkf_uylMWijKauV4B4Te7UJg9cNIv. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### Run a workflow

Runs a specific workflow through the api. On this example we are running a workflow that contains a File Generator worker.

> To run a workflow, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/workflows/wrkf_P95OLO61oGM5NwFn3W4iMl7rs/run \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-d '{
"parameters": {
"file": {
"name": "SimpleTextFile.txt",
"content_type": "text/plain",
"data": "SGVsbG8gV29ybGQ=",
}
},
"workspace": "main"
}' \
-X POST
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

params = {
'parameters': {
'file': {
'name': 'SimpleTextFile.txt',
'content_type': 'text/plain',
'data': 'SGVsbG8gV29ybGQ=',
}
}
}

response = everysk.Workflow.run('wrkf_P95OLO61oGM5NwFn3W4iMl7rs',  workspace='main', **params)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"workflow_execution":{
"status": "OK",
"started_worker_id": "wrkr_Sut4ZTaePs4PkdjDliVWYseGD",
"version": "v1",
"created": 1632835285,
"started": null,
"workflow_name": "File Generator Workflow",
"started_worker_name": "Starter",
"workflow_id": "wrkf_P95OLO61oGM5NwFn3W4iMl7rs",
"trigger": "API",
"id": "wfex_T1eYymTSIptJ4Hyt1Z6p4uGOe"
}
}
```

HTTP Request

POST /workflows/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED The workflow's unique indetifier. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |
| parameters object | REQUIRED Object sent to be used inside the workflow that will be started through the API. Usually this object contains information and data required by the workers inside the workflow in order to execute properly. If the workers inside the target workflow do not require external inputs you can pass a empty object as parameter. In Python it must be used as kwargs. |

### Delete a workflow

Permanently deletes a workflow. It cannot be undone. Returns an object with the workflow's id and an attribute specifying whether the workflow was successfully deleted or not.

> To delete a workflow, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/workflows/wrkf_uylMWijKauV4B4Te7UJg9cNIv?workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-X DELETE
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.Workflow.remove('wrkf_uylMWijKauV4B4Te7UJg9cNIv', workspace='main')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"deleted": true,
"id": "wrkf_uylMWijKauV4B4Te7UJg9cNIv",
"name": "My First Workflow"
}
```

HTTP Request

DELETE /workflows/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED The workflow's unique indetifier. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

## Report Template

---

> Endpoints

```
GET       /report_templates
GET       /report_templates/:id
DELETE    /report_templates/:id
```

A report template is a set of reporting widgets that are able to calculate, visualize and aggregate analytics based on a portfolio and/or datastores.

### The report template object

> What a report object looks like?

```
{
"status": "OK",
"updated": 1624633635,
"name": "My First Report Template",
"tags": [
"first",
"new",
"report_template"
],
"created": 1624633635,
"version": "v1",
"workspace": "main",
"id": "rtpl_UHAo64xdlah3iR9lZgB6LFwAb",
"categories": [],
"description": "Design a custom report using Everysk's library of widgets and analytics. #blank #new #report"
}
```

| Property | Description |
| --- | --- |
| id string | Unique identifier (UID) for the report template. |
| created timestamp | Time at which the object was created. Measured in seconds since the Unix epoch. |
| updated timestamp | Time at which the object was updated. Measured in seconds since the Unix epoch. |
| name string | The report template's name. |
| description string | An arbitrary string attached to the report template. Often useful for finding detailed information about the report template or for filtering a search based on the present hashtags. |
| tags array | Sequence of hashtags used to find the related report template. The more hashtags that are used, the more elements that are filtered out from the search. Labels, dates and any other hashtag can be used. |
| authorization string | Indicates whether the report template is public or not. |
| categories array | The report template category. |
| workspace string | The workspace where the report template was generated. |

### List all Report Templates

Returns a list of report templates you’ve previously generated. The report templates are returned in sorted order, with the most recent report template appearing first.

> To list all report templates, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/report_templates?query=#first&workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.ReportTemplate.list(query='#first', workspace='main')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
[
{
"status": "OK",
"updated": 1632329105,
"name": "First Report Template",
"tags": [
"first",
"new",
"report_template"
],
"created": 1630348524,
"version": "v1",
"workspace": "main",
"id": "rtpl_oobGe082N8U4PPhLrU60xNOLT",
"categories": [],
"description": "Design a custom report using Everysk's library of widgets and analytics. #blank #new #report"
},
{
"status": "OK",
"updated": 1627663323,
"name": "Second Report Template",
"tags": [
"blank",
"new",
"report"
],
"created": 1627593196,
"version": "v1",
"workspace": "main",
"id": "rtpl_oZbdHf786RRZIGN3WJQSY2M88",
"categories": [],
"description": "Design a custom report using Everysk's library of widgets and analytics. #blank #new #report"
}
]
```

HTTP Request

GET /report_templates

HTTP Parameters

| Parameter | Description |
| --- | --- |
| query string | optional, default is null Request a list of report templates filtering it by name or tag. When using a tag to perform a query, each term must include a hashtag prefix. (e.g: query="#april #sample") |
| page_size int | optional, default is 10 Set the number of objects that will be listed per page. |
| page_token int | optional, default is null The token defines which page will be returned to the user. For further information, please check out our pagination guide. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### Retrieve a report template

Retrieves the details of an existing report template by supplying the report template's id.

> To retrieve a report template, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/report_template/rtpl_UHAo64xdlah3iR9lZgB6LFwAb?workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-G
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.ReportTemplate.retrieve(
'rtpl_UHAo64xdlah3iR9lZgB6LFwAb',
workspace='main'
)

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"status": "OK",
"updated": 1624633635,
"layout": [
...
],
"description": "Design a custom report using Everysk's library of widgets and analytics. #blank #new #report",
"created": 1624633635,
"tags": [
"first",
"new",
"report_template"
],
"version": "v1",
"workspace": "main",
"global_parameters": {
"advanced_settings": {
"confidence": {
"variant": "select",
"select": {
"value": "95%",
"label": "95%"
}
},
"correlation_half_life": {
"variant": "select",
"select": {
"value": 6,
"label": "6-months"
}
}
...
}
},
"id": "rtpl_UHAo64xdlah3iR9lZgB6LFwAb",
"categories": [],
"name": "First Report Template"
}
```

HTTP Request

GET /report_templates/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED A unique identifier (UID) for a report template. A report template's id will always look like this: rtpl_UHAo64xdlah3iR9lZgB6LFwAb. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

### Delete a report template

> To delete a report template, run the following:

**Curl:**



```
curl https://api.everysk.com/v2/report_templates/rtpl_UHAo64xdlah3iR9lZgB6LFwAb?workspace=main \
-H "Content-Type: application/json" \
-u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN \
-X DELETE
```

```
import everysk
import json

everysk.api_sid = <YOUR_API_SID>
everysk.api_token = <YOUR_API_TOKEN>

response = everysk.ReportTemplate.remove('rtpl_UHAo64xdlah3iR9lZgB6LFwAb', workspace='main')

print(json.dumps(response, indent=2))
```

> The above call returns the following JSON object:

```
{
"deleted": true,
"id": "rtpl_UHAo64xdlah3iR9lZgB6LFwAb",
"name": "First Report Template"
}
```

Permanently deletes a report template. It cannot be undone. Returns an object with the report template's id and an attribute specifying whether the report was successfully deleted or not.

HTTP Request

DELETE /report_templates/:id

HTTP Parameters

| Parameter | Description |
| --- | --- |
| id string | REQUIRED A unique identifier (UID) for a report. |
| workspace string | optional, default is main Determines on which workspace the request will be made. |

## Parameter Details

### Securities

---

> Example of long/short global stocks portfolio with user defined label (JSON):

```
[
{
"id": "0f82eb",
"symbol": "GMEXICOB:XMEX",
"quantity": 125000.0,
"label": "AB"
},
{
"id": "76ac8d",
"symbol": "CNCO",
"quantity": 150000.0,
"label": "DL"
},
{
"id": "47e7ba",
"symbol": "SIE:XETR",
"quantity": 10000.0,
"label": "DL"
},
{
"id": "86f551",
"symbol": "BN:XPAR",
"quantity": 4000.0,
"label": "AB"
},
{
"id": "1b9b11",
"symbol": "BMW:XETR",
"quantity": 2000.0,
"label": "AB"
},
{
"id": "a089b0",
"symbol": "AAPL",
"quantity": -1000.0,
"label": "AB"
},
{
"id": "bc1413",
"symbol": "FB",
"quantity": -2400.0,
"label": "DL"
}
]
```

The parameter securities is an array of objects representing each security in the portfolio.
Each object in the array has the following attributes:

| Attribute | Description |
| --- | --- |
| id string | REQUIRED A unique identifier (UID) for a security. |
| symbol string | REQUIRED Security symbol: Please refer to our symbology. |
| quantity file | REQUIRED Numbers of shares or contracts. Positive quantities are longs and negative are shorts. For fixed income securities, mutual funds, swaps, cash and margin the amounts are defined in the security's currency. |
| label string | optional, default is "" (no aggregation label) Aggregation label defined by the user. It is utilized when aggregation is set to "aggregation_label". |
| cost_price float | optional, default is null Unit price of the security. |
| market_price float | optional, default is null Current market price in local currency. |
| currency string | optional, default is null 3-letter ISO 4217 code for currency. The currency of the security. To see all supported currencies click here. |
| fx_rate float | optional, default is null The price of the domestic currency stated in terms of another currency. |
| multiplier float | optional, default is null The securitie's multiplier. |
| unrealized_pl float | optional, default is null The current profit or loss on an open security. |
| unrealized_pl_in_base float | optional, default is null The current profit or loss on an open security based on the portfolio base currency. |
| isin string | optional, default is null A 12-digit alphanumeric code that uniquely identifies a specific security. The numbers are allocated by a country's respective national numbering agency (NNA). |
| status string | optional, default is OK It can be "OK", "ERROR" or "UNHEALTHY". |
| exchange string | optional, default is null The stock exchange where the security is traded. |
| name string | optional, default is null The security full name in the market. |
| extra_data object | optional, default is null An object sent by the user in order to give more details to the API. |

Maximum securities length:

- 250 securities (with or without a supplied nlv).
- 3000 securities (nlv is not optional and needs to be supplied).

### Magnitude

---

The parameter magnitude is an instantaneous shock as a decimal number: -10% = -0.10.

Certain rates/spreads can also be shocked and the magnitude of the shock is an absolute widening or tightening of the rate/spread. For example:

| Shock | Magnitude | Current level | New level |
| --- | --- | --- | --- |
| IND:SPX | -1% | 2821 | 2792 |
| IND:LIBOR3M | -1% | 1.77 | 0.77 |

In the table above, the shock in SPX is a percent change, whereas the libor shock is an absolute shift.

For a list of rates and spreads that are shocked in absolute terms please click here.

### Confidence

---

The parameter confidence can be one of: 1sigma, 2sigma, 3sigma, 85%, 90% or 95%. For example: 1sigma represents the left tail outside a one-sigma move from the mean of the profit and loss distribution (PL). It would represent roughly the worst/best 16% (=68%+16%) forecasted outcomes. Conversely, 95% explicitly represents the worst/best 5% forecasted outcomes.

The table below clarifies:

| Confidence | Probability |
| --- | --- |
| 1sigma | One sigma dispersion around the mean (approx. 68.27%) + one tail Tail measure* ≅ 15.86% |
| 2sigma | Two sigma dispersion around the mean (approx. 95.45%) + one tail Tail measure* ≅ 2.27% |
| 3sigma | Three sigma dispersion around the mean (approx. 99.73%) + one tail Tail measure* ≅ 0.13% |
| 85% | Explicit 85% Tail measure* = 15% |
| 90% | Explicit 90% Tail measure* = 10% |
| 95% | Explicit 95% Tail measure* = 5% |
| 97% | Explicit 95% Tail measure* = 3% |
| 99% | Explicit 95% Tail measure* = 1% |

* Tail measure = (1-confidence)

### Use Drift

---

By default our simulations are zero-centered. This flag specifies that the dispersion of simulations should be around the average of the historical risk factors instead.

In the calculation of the averages, volatility_half_life and correlation_half_life are taken into account.

### Forecasts

---

> Example of forecast (JSON):

```
[
{
"symbol": "NFLX",
"years": 1.0,
"targets": [160, 260, 400, 480],
"probabilities": [0.55, 0.15, 0.15, 0.15]
},
{
"symbol": "SPY",
"years": 0.5,
"targets": [270, 260, 200],
"probabilities": [0.5, 0.4, 0.1]
}
]
```

User-supplied forecasts can represent outcomes that are difficult to be captured by the covariance matrix, for example:
a takeover situation, a pharmaceutical company clearing a drug trial or even a large correction not captured with the historical data.

The parameter forecasts is an array of objects representing the price forecast for a security in the portfolio.
Each object in the array has the following attributes:

| Attribute | Description |
| --- | --- |
| years file | REQUIRED Timeframe for the forecast to materialize in years. |
| targets array | REQUIRED Target prices at a horizon represented by attribute years. Can contain any number of targets. |
| probabilities array | REQUIRED Probabilities associated to each element inside the attribute targets. |

The arrays targets and probabilities have to be of same size and probabilities need to sum to 1.0.

### Volatility Surface

---

> Example of volatility surface (JSON):

```
[
{
"symbol": "IBM",
"time_to_expiration": [0.12, 0.25],
"moneyness": [0.97, 1, 1.03, 1.05],
"volatilities": [
[0.36, 0.16, 0.33, 0.26],
[0.19, 0.2, 0.17, 0.16]
]
}
]
```

Surfaces are parameterized in years to expiration and moneyness.
When supplied, the surface is used to price any options on the underlying.
When omitted, an implied volatility is calculated with Black and Scholes.

The parameter volatility_surface is an array of objects representing the implied volatilities for underlying securities in the portfolio.
Each object in the array has the following attributes:

| Attribute | Description |
| --- | --- |
| time_to_expiration array | REQUIRED Various times to expiration (as a fraction of a year). |
| moneyness array | REQUIRED Various moneyness. |
| volatilities 2d array | REQUIRED Implied volatilities, with times_to_expiration rows and moneyness columns. |

### Filter Expression

---

> Example using logical operator 'and'. Retrieve identifiers for positions that are long and also denominated in a currency different than the base currency of the portfolio:

```
"exposure('long') and currency('foreign securities')"
```

> Example using logical operator 'or'. Retrieve any shorts or illiquid positions:

```
"exposure('short') or liquidity('>300%')"
```

> Example using logical operator 'not'. Retrieve all positions that are not long options:

```
"not(type('equity option long delta'))"
```

> Example using logical operators combined:

```
"currency('foreign securities') and (not(exposure('short') or liquidity('>300%')))"
```

Filters are powerful constructs to return the unique identifiers of certain positions in the portfolio, satisfying a specific criteria. When used, they isolate the behavior of a unique group, compared to the whole. For example: how illiquid securities might react to an oil shock.

The parameter filter supports the following expressions:

| Filter Function | Description |
| --- | --- |
| years file | REQUIRED Extracts the unique identifiers according to different currency related buckets: 'foreign securities', 'domestic securities'. |
| targets array | REQUIRED Extracts the unique identifiers that represent long exposures (including long calls and short puts) and short exposures (including long puts and short calls): 'long', 'short'. |
| probabilities array | REQUIRED Extracts the identifiers of securities from a specific type: 'equity option long delta', 'equity option short delta', 'future option long delta', 'future option short delta', 'foreign equity long', 'foreign equity short', 'us equity long', 'us equity short', 'fx forward', 'fx option long delta', 'fx option short delta'. |
| liquidity array | REQUIRED Extracts the identifiers of securities satisfying certain liquidity criteria: '0-5%', '5-25%', '25-50%', '50-100%', '100-300%', '>300%'. |

Liquidity above is expressed as the proportion of the 20-day average trading volume required to unwind a position in full, taking into account a 20% participation rate. Thus, ">300%" means that will take at least 3 days to unwind the position(s) in full.

Simple filters above can be combined into complex filters using logical expressions, namely: or, and and not.
Please see various examples in the right panel.

Filters that do not satisfy all the conditions return an empty dictionary, therefore the whole portfolio is used.

### Sampling Combinations

---

| Sampling | Horizon | Explanation |
| --- | --- | --- |
| 1 | 1 | One-day ahead forecasts with daily sampling |
| 5 | 5 | Week-ahead forecasts with weekly (non-overlapping) sampling |
| 1 | 5 | Week-ahead forecasts with daily (overlapping) sampling |



