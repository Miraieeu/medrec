# 1. Gunakan Node versi 20 (Alpine lebih ringan)
FROM node:20-alpine

# 2. Set folder kerja di dalam container
WORKDIR /app

# 3. Copy package.json dan install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy semua kode frontend ke dalam container
COPY app ./app
COPY src ./src
COPY hooks ./hooks
COPY services ./services
COPY utils ./utils
COPY public ./public
COPY next.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.js ./

# 5. Build aplikasi Next.js (Production Ready)
RUN npm run build
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
# 6. Expose port bawaan Next.js (3000)
EXPOSE 3000

# 7. Jalankan aplikasi
CMD ["npm", "start"]