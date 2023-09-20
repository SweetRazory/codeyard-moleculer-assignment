# Codeyard Test Backend API

Üdv, ezt a Projectet a Codeyard cég számára kellett elkészítenem, mint Backend fejlesztői tesztfeladat.

---

## Tesztkörnyezet futtatása

Első lépésként klónozzuk le a repository-t

```bash
gh repo clone SweetRazory/codeyard-moleculer-assignment
```

Majd, az alábbi parancs segítségével, telepítsük a project számára szükséges package-ket

```bash
npm install
```
vagy
```bash
yarn install
```

Ez után, ha fut a Docker Desktop alkalmazásunk, szimplán futtassuk a következő parancsot, és elméletben már fut is a Dev környezet

```bash
npm run dc:up
```
vagy
```bash
yarn run dc:up
```

---

## API Végpontok

Az API-t, alap esetben a `http://localhost:3000` cím alatt fogod tudni elérni.

Az alábbiakban megtalálod az elérhető API végpontokat és a hozzájuk szükséges adatokat:

---

### Felhasználó bejelentkezése

- **Végpont:** `POST /auth/login`
- **Leírás:** Bejelentkezteti a felhasználót az adott e-mail cím és jelszó alapján.

#### Paraméterek

- `email` (kötelező): A felhasználó e-mail címe.
- `password` (kötelező): A felhasználó jelszava.

#### Sikeres válasz

```json
{
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.-TJ2Rqg7u-D8s1BcsY0tLI9X-cj3pWAw2TPUu5I0uKU"
  }
}
```

#### Hiba válaszok

- **401 Unauthorized**: Ha az e-mail cím vagy jelszó nem megfelelő.
- **500 Internal Server Error**: Az általános szerverhiba esetén.

---

### Felhasználó regisztrációja

- **Végpont:** `POST /auth/register`
- **Leírás:** Regisztrálja az új felhasználót a megadott paraméterek alapján.

#### Paraméterek

- `email` (kötelező): Az új felhasználó e-mail címe.
- `password` (kötelező): Az új felhasználó jelszava.
- `name` (opcionális): Az új felhasználó teljes neve.

#### Sikeres válasz

```json
{
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.-TJ2Rqg7u-D8s1BcsY0tLI9X-cj3pWAw2TPUu5I0uKU"
  }
}
```

#### Hiba válaszok

- **401 Unauthorized**: Ha a felhasználó már létezik az adatbázisban.
- **500 Internal Server Error**: Az általános szerverhiba esetén.

---

### Felhasználók lekérdezése

- **Végpont:** `GET /api/users`
- **Leírás:** Lekéri az összes felhasználót a megadott paraméterek alapján.
- **Opcionális paraméterek:**
  - `showIds` : Boolean típus, felhasználók azonosítóinak megjelenítése.
  - `showPasswords` : Boolean típus, felhasználói jelszavak megjelenítése.
  - `showRawData` : Boolean típus, felhasználói adatok nyers formájának megjelenítése.

#### Paraméterek

- `showIds` (opcionális): Ha `true`, akkor a válasz tartalmazza a felhasználók azonosítóit.
- `showPasswords` (opcionális): Ha `true`, akkor a válasz tartalmazza a felhasználói jelszavakat.
- `showRawData` (opcionális): Ha `true`, akkor a válasz tartalmazza a felhasználói adatokat nyers formájukban.

#### Sikeres válasz

```json
{
    "result": {
        "users": [
            {
                "name": "Almasi Kristof",
                "email": "almasi@kristdfof.com",
                "addresses": [],
                "tokens": []
            },
            {
                "email": "sweetrazory@icloud.com",
                "addresses": [],
                "tokens": [
                    {
                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTBiNWMxZGJiN2I4ODcwZGU5OTMyZDUiLCJpYXQiOjE2OTUyNDMyOTN9.6nJXALUDATVytjL_S-erdQSGrME7kBTCxWa8Z_ZnmVU"
                    }
                ]
            }
        ]
    }
}
```

#### Hiba válaszok

- **500 Internal Server Error**: Az általános szerverhiba esetén.

---

### Felhasználó lekérdezése

- **Végpont:** `GET /api/user/:userId`
- **Leírás:** Lekéri a megadott azonosítójú felhasználót.

#### Paraméterek

- `userId` (kötelező): A lekérdezni kívánt felhasználó azonosítója.

#### Sikeres válasz

```json
{
    "result": {
        "user": {
            "_id": "650b47de3e0822aa5ccaf52a",
            "name": "Almasi Kristof",
            "email": "almasi@kristof.com",
            "password": "$2b$10$3KfNodlLRfvz9NwVlVxF2eiV4wFx9584B/B0gKh8HvidLqU26qvSK",
            "addresses": [],
            "tokens": [],
            "__v": 0
        }
    }
}
```

#### Hiba válaszok

- **400 Bad Request**: Ha a megadott azonosító nem érvényes.
- **500 Internal Server Error**: Az általános szerverhiba esetén.

---

### Felhasználó létrehozása

- **Végpont:** `POST /api/user`
- **Leírás:** Létrehoz egy új felhasználót a megadott paraméterek alapján.
- **Opcionális paraméterek:**
  - `name` : Szöveg típusú, felhasználó teljes neve.
  - `address` : Tömb típusú, felhasználó címei.

#### Paraméterek

- `email` (kötelező): Az új felhasználó e-mail címe.
- `password` (kötelező): Az új felhasználó jelszava.
- `name` (opcionális): Az új felhasználó teljes neve.
- `address` (opcionális): Az új felhasználó címei tömbje.

#### Sikeres válasz

```json
{
  "result": {
    "message": "Successfully created user"
  }
}
```

#### Hiba válaszok

- **400 Bad Request**: Ha hiányoznak a kötelező paraméterek, vagy az e-mail cím nem érvényes.
- **401 Unauthorized**: Ha a felhasználó már létezik az adatbázisban.
- **500 Internal Server Error**: Az általános szerverhiba esetén.

---

### Felhasználó frissítése

- **Végpont:** `PATCH /api/user/:userId`
- **Leírás:** Frissíti a megadott azonosítójú felhasználó adatait.

#### Paraméterek

- `userId` (kötelező): A frissíteni kívánt felhasználó azonosítója.
- `data` (kötelező): Az új felhasználói adatok objektuma.

#### Sikeres válasz

```json
{
  "result": {
    "message": "Successfully updated user"
  }
}
```

#### Hiba válaszok

- **400 Bad Request**: Ha a megadott azonosító nem érvényes, vagy hiányoznak kötelező paraméterek.
- **500 Internal Server Error**: Az általános szerverhiba esetén.

---

### Felhasználó törlése

- **Végpont:** `DELETE /api/user/:userId`
- **Leírás:** Törli a megadott azonosítójú felhasználót.

#### Paraméterek

- `userId` (kötelező): A törölni kívánt felhasználó azonosítója.

#### Sikeres válasz

```json
{
  "result": {
    "message": "Successfully deleted user"
  }
}
```

#### Hiba válaszok

- **400 Bad Request**: Ha a megadott azonosító nem érvényes.
- **500 Internal Server Error**: Az általános szerverhiba esetén.

---

### Felhasználó címeinek lekérdezése

- **Végpont:** `GET /api/user/:userId/addresses`
- **Leírás:** Lekéri a megadott azonosítójú felhasználó összes címét.

#### Paraméterek

- `userId` (kötelező): A felhasználó azonosítója, akinek a címeit le szeretnénk kérni.

#### Sikeres válasz

```json
{
  "result": {
    "addresses": [
      {
        "zip_code": 4321,
        "country": "hu",
        "city": "Budapest",
        "county": "Pest county",
        "street": "Some st.",
        "houseNumber": "123/b"
      },
      {
        "zip_code": 4321,
        "country": "hu",
        "city": "Gyor",
        "county": "Gyor-Moson-Sopron county",
        "street": "Other st.",
        "houseNumber": "1 11/a"
      }
    ]
  }
}
```

#### Hiba válaszok

- **400 Bad Request**: Ha a megadott felhasználó azonosító nem érvényes.
- **500 Internal Server Error**: Az általános szerverhiba esetén.

---

### Felhasználó címének létrehozása

- **Végpont:** `POST /api/user/:userId/address`
- **Leírás:** Létrehoz egy új címet a megadott felhasználóhoz.

#### Paraméterek

- `userId` (kötelező): A felhasználó azonosítója, akinek a címét létre szeretnénk hozni.
- `data` (kötelező): Az új cím adatai.

#### Sikeres válasz

```json
{
  "result": {
    "message": "Successfully created address"
  }
}
```

#### Hiba válaszok

- **400 Bad Request**: Ha a megadott felhasználó azonosító nem érvényes, vagy hiányoznak kötelező paraméterek.
- **500 Internal Server Error**: Az általános szerverhiba esetén.

---

### Felhasználó címének frissítése

- **Végpont:** `PATCH /api/user/:userId/address/:addressId`
- **Leírás:** Frissíti a megadott cím adatait a megadott felhasználóhoz tartozóan.

#### Paraméterek

- `userId` (kötelező): A felhasználó azonosítója, akinek a címét frissíteni szeretnénk.
- `addressId` (kötelező): A frissíteni kívánt cím azonosítója.
- `data` (kötelező): Az új cím adatai.

#### Sikeres válasz

```json
{
  "result": {
    "message": "Successfully updated address"
  }
}
```

#### Hiba válaszok

- **400 Bad Request**: Ha a megadott felhasználó vagy cím azonosító nem érvényes, vagy hiányoznak kötelező paraméterek.
- **500 Internal Server Error**: Az általános szerverhiba esetén.

---

### Felhasználó címének törlése

- **Végpont:** `DELETE /api/user/:userId/address/:addressId`
- **Leírás:** Törli a megadott címet a megadott felhasználóhoz tartozóan.

#### Paraméterek

- `userId` (kötelező): A felhasználó azonosítója, akinek a címét törölni szeretnénk.
- `addressId` (kötelező): A törölni kívánt cím azonosítója.

#### Sikeres válasz

```json
{
  "result": {
    "message": "Successfully deleted address"
  }
}
```

#### Hiba válaszok

- **400 Bad Request**: Ha a megadott felhasználó vagy cím azonosító nem érvényes.
- **500 Internal Server Error**: Az általános szerverhiba esetén.

---

## Authentikáció

Az API használata előtt be kell jelentkezned. Ehhez az `/auth/login` vagy `/auth/register` végpontot használhatod, majd a kapott token-t kell használnod az egyes végpontokhoz való hozzáféréshez. Az authentikált kéréseknek a következő módon kell tartalmazniuk a token-t:

```
Authorization: Bearer <TOKEN>
```

## Postman Gyűjtemény

A projekt mellé mellékelem a Postmanbe importálható gyűjteményt is, amely tartalmazza a végpontokat és kéréseket. Az importáláshoz kövesd az alábbi lépéseket:

1. Nyisd meg a Postman alkalmazást.
2. Kattints a "File" menüpontra.
3. Válaszd ki a "Import" opciót.
4. Válaszd ki a mellékelt `Codeyard Test API.postman_collection.json` fájlt, majd kattints az "Import" gombra.

## Moleculerrel való tapasztalat/fogékonyság

Az elmúlt időszakban főként AWS Lambda funkcionalitásokkal foglalkoztam Node.js és TypeScript környezetben, emellett GitHub Actions és Terraformmal is. Éppen ezért a MoleculerJS-el kellett egy pár napot játszanom, mielőtt ténylegesen belekezdtem a projectbe, próbáltam minél többet megérteni belőle, remélem a kódom reprezentálja nem csak a Moleculerben szerzett hirtelen tapasztalatomat, de általánosságban a fejlesztői képességeimet is.

Köszönöm szépen hogy megtiszteltél és időt áldoztál arra hogy elolvasd ezt a kis readme-t, legyen szép napod :)
