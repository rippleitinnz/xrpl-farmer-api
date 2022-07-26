<img src="https://i.imgur.com/JwUGvaT.jpg" width="100px"/><br>
# **rippleitin.nz XRPL Farmer API**

## 👋 Welcome!

> This is a public API hosted by [rippleitin.nz](https://rippleitin.nz). The database for this API is updated frequently with most current list of [XRPL](https://xrpl.org) addresses that have been flagged as farmers.

## **Base URL:**
- http://farmerapi.rippleitin.nz:3000
---
## **Endpoint:** 
**`POST`** 
`/verify-bulk` 
---
**Request Body**:
`xrpl_addresses: Array<xrpl_address>`

## **cURL Request (Example):**

```bash
curl --location --request POST 'http://farmerapi.rippleitin.nz:3000/verify-bulk' \
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
    "totalRemoved": 2,
    "lookupDurationSeconds": 0.47
}
```

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
curl --location --request GET 'http://farmerapi.rippleitin.nz:3000/verify?xrpl_address=r36PzVWGbVaUvLaqej22BFEHi4m37ufBte'
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

- If the `xrpl_address` is not a valid XRPL classic address you will get error with the following message: 
**"The XRPL address provided is not a valid classic address. Please check the address and try again."**




