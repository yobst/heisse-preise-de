FROM node:19

WORKDIR /heisse-preise-de/

EXPOSE 3000

LABEL org.opencontainers.image.source=https://github.com/yobst/heisse-preise-de
LABEL org.opencontainers.image.description="Yobst Price Scraper"

ENTRYPOINT ["npm"] 
CMD ["run", "start"]
