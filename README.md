# rippleitin.nz XRPL Farmer API

## MSSQL database table schema

```sql
CREATE TABLE Wallets (
    xrpl_address varchar(255) NOT NULL primary key,
    created_at datetime default CURRENT_TIMESTAMP
);
```
