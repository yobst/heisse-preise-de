# Heisse Preise - Germany

German fork of Austrian [heissepreise](https://github.com/badlogic/heissepreise) app.

## TODO

-   Additional stores

    -   Penny: sites seem to be quite different than Austrian sites
    -   Flink
    -   Flaschenpost
    -   Combi.de
    -   myTime.de
    -   Edeka
    -   Netto
    -   Kaufland

-   Additional attributes
    -   origin
    -   gtin

## Requirements

-   Node.js

## Running

### Postgresql Connection

This application adheres to the [official Postgresql environment variables](https://www.postgresql.org/docs/9.1/libpq-envars.html).

### Development

Install NodeJS, then run this in a shell of your choice.

```bash
git clone https://github.com/yobst/heisse-preise-de
cd heisse-preise-de
mkdir -p data
npm install
npm run dev
```

The first time you run this, the data needs to be fetched from the stores. You should see log out put like this.

```bash
Fetching data for date: 2023-05-23
Fetched LIDL data, took 0.77065160000324 seconds
Fetched DM data, took 438.77065160000324 seconds
Merged price history
App listening on port 3000
```

Once the app is listening per default on port 3000, open <http://localhost:3000> in your browser.

Subsequent starts will fetch the data asynchronously, so you can start working immediately.

### Production and Staging

To run a containerized version of the application, you will need to build the application image first, before deploying it on the target system.

Build the image running the following:

```bash
docker build . -t localhost/heisse-preise-de_site:latest
```

Deploy the container with the following command

```bash
docker run --volume=$(pwd)/data/:/heisse-preise-de/data --publish 3000:3000 localhost/heisse-preise-de_site:latest
```

## Using data from heisse-preise-de

An item has the following fields:

-   `store`: (`aldi`, `dm`, `lidl`, ...)
-   `name`: the product name.
-   `price`: the current price in €.
-   `priceHistory`: an array of `{ date: "yyyy-mm-dd", price: number }` objects, sorted in descending order of date.
-   `unit`: unit the product is sold at. May be undefined.
-   `quantity`: quantity the product is sold at for the given price
-   `bio`: whether this product is classified as organic/"Bio"
