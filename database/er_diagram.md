```mermaid
erDiagram
    Users ||--o{ Addresses : "has"
    Users ||--o{ Orders : "places"
    Users ||--o{ Cart : "has"
    Users ||--o{ Reviews : "writes"
    Categories ||--o{ Products : "contains"
    Products ||--o{ Order_Items : "included in"
    Products ||--o{ Cart : "added to"
    Products ||--o{ Reviews : "has"
    Orders ||--o{ Order_Items : "contains"
    Addresses ||--o{ Orders : "used for"
```
