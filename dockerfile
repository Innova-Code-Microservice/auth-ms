# ===== COPIA DE DEPENDENCIAS =====
FROM node:21-alpine3.19 as deps

WORKDIR /usr/src/app


COPY package.json ./
COPY package-lock.json ./

RUN npm install



# ===== CONSTRUCCION DE LA APLICACION =====
FROM node:21-alpine3.19 as build

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules

COPY . .

RUN npx prisma generate

RUN npm run build

RUN npm ci -f --only=production && npm cache clean --force



# ===== CREACION DE LA IMAGEN FINAL =====
FROM node:21-alpine3.19 as prod

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

ENV NODE_ENV=production

USER node

EXPOSE 3000

CMD [ "node", "dist/main.js" ]