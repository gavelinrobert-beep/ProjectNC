FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install || true
COPY . .
EXPOSE 5173
CMD ["sh","-lc","npm install && npm run dev -- --host 0.0.0.0"]
