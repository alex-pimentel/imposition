FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY packages/ui/package.json packages/ui/
COPY packages/web/package.json packages/web/
RUN npm install
COPY packages/core packages/core
COPY packages/ui packages/ui
COPY packages/web packages/web
RUN npm run build -w packages/web

FROM nginx:alpine
COPY --from=build /app/packages/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
