<img src="https://i.imgur.com/JwUGvaT.jpg" width="100px"/><br>
# **rippleitin.nz XRPL Farmer API**

## 👋 Welcome!

> This is a public API hosted by [rippleitin.nz](https://rippleitin.nz). The database for this API is updated frequently with most current list of [XRPL](https://xrpl.org) addresses that have been flagged as farmers.

## **Base URL:**
- https://farmerapi.rippleitin.nz
## **Endpoint:**

- (**GET**) `/verify` 
<br> **Query Parameters**: `xrpl_address`

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
