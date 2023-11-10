FROM node:21 as build

COPY . /heisse-preise-de

WORKDIR /heisse-preise-de/

RUN npm install
RUN npm run build


FROM node:21

COPY --from=build /heisse-preise-de/site/build /heisse-preise-de/site/build
COPY --from=build /heisse-preise-de/server/build /heisse-preise-de/server/build
COPY --from=build /heisse-preise-de/package.json /heisse-preise-de/package.json

EXPOSE 3000

LABEL org.opencontainers.image.source=https://github.com/yobst/heisse-preise-de
LABEL org.opencontainers.image.description="Yobst Price Scraper"

WORKDIR /heisse-preise-de/

ENTRYPOINT ["npm"] 
CMD ["run", "server"]
