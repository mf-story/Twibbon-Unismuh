FROM node:20-alpine

WORKDIR /app

# Tidak ada dependensi npm — cukup salin sumber.
COPY . .

# Buat data awal (seed) dari isi folder frames saat build.
# Saat container pakai volume kosong di /app/frames, seed ini dipulihkan otomatis.
RUN mkdir -p seed && cp -a frames/. seed/ || true

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
