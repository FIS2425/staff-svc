FROM node:lts-alpine

WORKDIR /staff-svc

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && \
    rm -rf $(npm get cache)

COPY . .

ENTRYPOINT ["npm", "start"]