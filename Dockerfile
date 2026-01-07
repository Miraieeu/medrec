# Gunakan base image Node versi 20
FROM node:20


# Buat folder kerja di dalam container
WORKDIR /app

# Copy package.json dulu biar caching efisien
COPY package*.json ./

# Install semua dependencies (termasuk devDependencies buat build tsc)
RUN npm install

# Copy semua kode sumber ke dalam container
COPY . .
RUN npx prisma generate

# Build TypeScript ke JavaScript (hasilnya di folder dist)
RUN npm run build

# Buka port aplikasi (Misal port 4000)
EXPOSE 4000

# Perintah untuk menjalankan aplikasi (sesuai script "start" di package.json)
CMD ["npm", "start"]