# 1. Gunakan Node versi 20 (Alpine lebih ringan)
FROM node:20-alpine

# 2. Set folder kerja di dalam container
WORKDIR /app

# 3. Copy package.json dan install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy semua kode frontend ke dalam container
COPY . .

# 5. Build aplikasi Next.js (Production Ready)
RUN npm run build

# 6. Expose port bawaan Next.js (4000)
EXPOSE 4000

# 7. Jalankan aplikasi
CMD ["npm", "start"]