<img src="https://i.imgur.com/JwUGvaT.jpg" width="100px"/><br>
# **rippleitin.nz XRPL Air Drop Farmer API**

## 👋 Welcome! 

> This is a public API hosted by [rippleitin.nz](https://rippleitin.nz). The database for this API is updated frequently with the most current list of [XRPL](https://xrpl.org) addresses that have been flagged as Air Drop farmers, from numerous sources.

The last update was on Septmeber 26th 2022 with 142,827 individual accounts featuring on the list.

## **Monitoring**

An API status page has been established for the purposes of monitoring

[Status Monitor](https://stats.uptimerobot.com/By15MTDWMn)



## **API Rate Limiting**

You can make a maximum of **100 REQUESTS PER 15 MINUTE WINDOW**. If you exceed the request limit, the API will respond with `429 Too many requests, please try again later`. If you need to process large sets of XRPL addresses we advise you to use the `POST /verify-bulk` endpoint. If you only need to verify a single XRPL address you should use the `GET /verify` endpoint.

Each request will return the following headers:

- `RateLimit-Limit` - This value will always show `100`. The value is related to the max number of requests you can make within the 15 minute window.

- `RateLimit-Remaining` - How many requests remaining until you have hit the rate limit. 

- `RateLimit-Reset` - The number of seconds remaining in the current 15 minute window before the rate limit is reset.

## **Base URL:**
- https://farmerapi.rippleitin.nz
---
## **Endpoint:** 
**`POST`** 
`/verify-bulk` 
---
**Request Body**:
`xrpl_addresses: Array<xrpl_address>`

## **cURL Request (Example):**

```bash
curl --location --request POST 'https://farmerapi.rippleitin.nz/verify-bulk' \
--header 'Content-Type: application/json' \
--data-raw '{
    "xrpl_addresses": [
        "r14zaSurzKZmPvi6GvonCaz3mc7ztVckf",
        "r154HkaFcT6E4PeQNxgKvYKNvxQzXkmaA",
        "r166jkLzedGTtTpRGeqrXF4pPipaTkEAJ"
    ]
}'
```
## **JSON Response (Example):**

```JSON
{
    "xrplAddressesCleaned": [
        "r154HkaFcT6E4PeQNxgKvYKNvxQzXkmaA"
    ],
    "xrplAddressesFarmers": [
        "r14zaSurzKZmPvi6GvonCaz3mc7ztVckf",
        "r166jkLzedGTtTpRGeqrXF4pPipaTkEAJ"
    ],
    "totalFarmersFound": 2,
    "lookupDurationSeconds": 0.47
}
```

- `xrplAddressesCleaned` - The XRPL addresses provided in the request that did not get flagged as farmers. These appear to be valid addresses.

- `xrplAddressesFarmers` - The XRPL addresses provided in the request that are flagged as farmers. These appear to be farmer addresses.

- `totalFarmersFound` - The total amount of XRPL addresses provided in the request that appear to be farmers.

## **Error Messages**

**401 (Bad Request)**

- If the `xrpl_addresses` is missing you will get the following error message:
**"Missing required [xrpl_addresses] property from payload body."**

- If the `xrpl_addresses` is not an array: 
**"The [xrpl_addresses] property must be be of type array filled with XRPL addresses as strings."**

- If the `xrpl_addresses` is empty: 
**"The [xrpl_addresses] property must contain minimum of 1 XRPL address string."**
---
## **Endpoint:** (**`GET`**) `/verify`
--- 
**Query Parameters**: `xrpl_address`

## **cURL Request (Example):**

```bash
curl --location --request GET 'https://farmerapi.rippleitin.nz/verify?xrpl_address=r36PzVWGbVaUvLaqej22BFEHi4m37ufBte'
```

## **JSON Response (Example):**

```JSON
{
    "isFarmer": true,
    "lookupDurationSeconds": 0.47
}
```

## **Error Messages**

**401 (Bad Request)**

- If the `xrpl_address` is missing you will get the following error message:
**"Missing required query parameter [xrpl_address] to use this endpoint."**

- If the `xrpl_address` is not a valid XRPL classic address you will get the following error message: 
**"The XRPL address provided is not a valid classic address. Please check the address and try again."**


