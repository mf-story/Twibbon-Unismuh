/* =========================================================================
   EduGame Hub — Default Content Banks (data.js)
   -------------------------------------------------------------------------
   Setiap MAPEL punya struktur seragam sehingga satu mapel bisa dipakai
   oleh SEMUA jenis game:
     quiz  : [{ q, options:[a,b,c,d], answer:<index benar>, hint }]  -> Kuis, Roda, Ular Tangga
     pairs : [{ a, b }]                                              -> Mencocokkan, Kartu Memori
     words : [{ word, hint }]                                        -> Tebak Kata
   Guru dapat menamb/mengubah lewat menu "Materi" (disimpan di localStorage).
   Setiap mapel punya JENJANG (level) & KELAS (grade) agar bisa difilter.
   ========================================================================= */

/* Daftar jenjang & kelas yang tersedia */
window.LEVELS = [
  { id: "SD", name: "SD", grades: [1, 2, 3, 4, 5, 6] },
  { id: "SMP", name: "SMP", grades: [7, 8, 9] },
  { id: "SMA", name: "SMA/SMK", grades: [10, 11, 12] },
  { id: "Umum", name: "Umum", grades: [] }
];

/* Label kelas: gradeLabel("SD", 3) -> "Kelas 3"; jenjang Umum -> "Semua Kelas" */
window.gradeLabel = function (level, grade) {
  if (!level || level === "Umum" || !grade) return "Semua Kelas";
  return "Kelas " + grade;
};

window.DEFAULT_SUBJECTS = [
  {
    id: "umum",
    name: "Pengetahuan Umum",
    icon: "🌍",
    color: "#4f46e5",
    level: "Umum", grade: 0,
    topics: [
      { name: "Geografi", subs: ["Ibu Kota & Negara", "Alam"] },
      { name: "Sains", subs: ["Antariksa", "Alat Ukur", "Hewan"] },
      { name: "Kebangsaan", subs: ["Simbol Negara"] }
    ],
    quiz: [
      { q: "Ibu kota Indonesia adalah?", options: ["Bandung", "Jakarta", "Surabaya", "Medan"], answer: 1, hint: "Kota terbesar di Pulau Jawa.", topic: "Geografi", sub: "Ibu Kota & Negara" },
      { q: "Planet terdekat dengan Matahari?", options: ["Venus", "Bumi", "Merkurius", "Mars"], answer: 2, hint: "Namanya juga dewa Romawi.", topic: "Sains", sub: "Antariksa" },
      { q: "Berapa jumlah benua di dunia?", options: ["5", "6", "7", "8"], answer: 2, hint: "Termasuk Antartika.", topic: "Geografi", sub: "Alam" },
      { q: "Hewan yang dijuluki 'Raja Hutan'?", options: ["Gajah", "Harimau", "Singa", "Serigala"], answer: 2, hint: "Punya surai.", topic: "Sains", sub: "Hewan" },
      { q: "Alat untuk mengukur suhu adalah?", options: ["Barometer", "Termometer", "Speedometer", "Higrometer"], answer: 1, hint: "Sering dipakai saat demam.", topic: "Sains", sub: "Alat Ukur" },
      { q: "Warna bendera Indonesia adalah?", options: ["Merah-Putih", "Merah-Biru", "Putih-Hijau", "Merah-Kuning"], answer: 0, hint: "Sang Saka.", topic: "Kebangsaan", sub: "Simbol Negara" }
    ],
    pairs: [
      { a: "Jakarta", b: "Indonesia", topic: "Geografi", sub: "Ibu Kota & Negara" },
      { a: "Tokyo", b: "Jepang", topic: "Geografi", sub: "Ibu Kota & Negara" },
      { a: "Paris", b: "Prancis", topic: "Geografi", sub: "Ibu Kota & Negara" },
      { a: "Kairo", b: "Mesir", topic: "Geografi", sub: "Ibu Kota & Negara" },
      { a: "Canberra", b: "Australia", topic: "Geografi", sub: "Ibu Kota & Negara" },
      { a: "Riyadh", b: "Arab Saudi", topic: "Geografi", sub: "Ibu Kota & Negara" }
    ],
    words: [
      { word: "GARUDA", hint: "Lambang negara Indonesia", topic: "Kebangsaan", sub: "Simbol Negara" },
      { word: "PANCASILA", hint: "Dasar negara Indonesia", topic: "Kebangsaan", sub: "Simbol Negara" },
      { word: "NUSANTARA", hint: "Sebutan untuk kepulauan Indonesia", topic: "Geografi", sub: "Alam" },
      { word: "PROKLAMASI", hint: "Pernyataan kemerdekaan", topic: "Kebangsaan", sub: "Simbol Negara" }
    ]
  },
  {
    id: "matematika",
    name: "Matematika",
    icon: "🔢",
    color: "#0ea5e9",
    level: "SD", grade: 4,
    topics: [
      { name: "Bilangan", subs: ["Bilangan Prima", "KPK & FPB"] },
      { name: "Operasi Hitung", subs: ["Perkalian", "Pembagian"] },
      { name: "Pecahan", subs: ["Pecahan Senilai", "Persen"] },
      { name: "Geometri", subs: ["Bangun Datar", "Sudut", "Simetri"] },
      { name: "Pengukuran", subs: ["Keliling & Luas"] }
    ],
    quiz: [
      { q: "7 × 8 = ?", options: ["54", "56", "48", "64"], answer: 1, hint: "Antara 50 dan 60.", topic: "Operasi Hitung", sub: "Perkalian" },
      { q: "Hasil dari 144 : 12 = ?", options: ["11", "12", "13", "14"], answer: 1, hint: "Kuadrat sempurna.", topic: "Operasi Hitung", sub: "Pembagian" },
      { q: "Bilangan prima terkecil adalah?", options: ["0", "1", "2", "3"], answer: 2, hint: "Genap tapi prima.", topic: "Bilangan", sub: "Bilangan Prima" },
      { q: "Keliling persegi sisi 5 cm?", options: ["10 cm", "15 cm", "20 cm", "25 cm"], answer: 2, hint: "4 × sisi.", topic: "Pengukuran", sub: "Keliling & Luas" },
      { q: "Berapa 25% dari 200?", options: ["25", "40", "50", "75"], answer: 2, hint: "Seperempat.", topic: "Pecahan", sub: "Persen" },
      { q: "Sudut siku-siku besarnya?", options: ["45°", "90°", "180°", "360°"], answer: 1, hint: "Bentuk huruf L.", topic: "Geometri", sub: "Sudut" }
    ],
    pairs: [
      { a: "Segitiga", b: "3 sisi", topic: "Geometri", sub: "Bangun Datar" },
      { a: "Persegi", b: "4 sisi", topic: "Geometri", sub: "Bangun Datar" },
      { a: "Segi lima", b: "5 sisi", topic: "Geometri", sub: "Bangun Datar" },
      { a: "Segi enam", b: "6 sisi", topic: "Geometri", sub: "Bangun Datar" },
      { a: "Lingkaran", b: "0 sudut", topic: "Geometri", sub: "Bangun Datar" },
      { a: "Segi delapan", b: "8 sisi", topic: "Geometri", sub: "Bangun Datar" }
    ],
    words: [
      { word: "PECAHAN", hint: "Bilangan berbentuk a/b", topic: "Pecahan", sub: "Pecahan Senilai" },
      { word: "GEOMETRI", hint: "Cabang ilmu tentang bangun", topic: "Geometri", sub: "Bangun Datar" },
      { word: "DIAGONAL", hint: "Garis penghubung sudut tak berdampingan", topic: "Geometri", sub: "Bangun Datar" },
      { word: "SIMETRIS", hint: "Seimbang antara dua sisi", topic: "Geometri", sub: "Simetri" }
    ]
  },
  {
    id: "ipa",
    name: "IPA / Sains",
    icon: "🔬",
    color: "#22c55e",
    level: "SMP", grade: 7,
    topics: [
      { name: "Zat dan Perubahannya", subs: ["Wujud Zat", "Perubahan Wujud"] },
      { name: "Suhu, Kalor, dan Pemuaian", subs: ["Suhu", "Kalor"] },
      { name: "Gerak dan Gaya", subs: ["Gaya", "Gerak"] },
      { name: "Sistem Organisasi Kehidupan", subs: ["Sel", "Organ"] },
      { name: "Ekologi & Keanekaragaman Hayati", subs: ["Ekosistem"] }
    ],
    quiz: [
      { q: "Proses tumbuhan membuat makanan disebut?", options: ["Respirasi", "Fotosintesis", "Transpirasi", "Digesti"], answer: 1, hint: "Butuh cahaya matahari.", topic: "Sistem Organisasi Kehidupan", sub: "Organ" },
      { q: "Organ untuk bernapas pada manusia?", options: ["Jantung", "Ginjal", "Paru-paru", "Hati"], answer: 2, hint: "Ada dua buah di dada.", topic: "Sistem Organisasi Kehidupan", sub: "Organ" },
      { q: "Air mendidih pada suhu?", options: ["50°C", "80°C", "100°C", "120°C"], answer: 2, hint: "Dalam Celsius, tekanan normal.", topic: "Suhu, Kalor, dan Pemuaian", sub: "Suhu" },
      { q: "Gaya yang menarik benda ke bumi?", options: ["Gesek", "Gravitasi", "Magnet", "Pegas"], answer: 1, hint: "Membuat apel jatuh.", topic: "Gerak dan Gaya", sub: "Gaya" },
      { q: "Bagian sel yang mengatur seluruh aktivitas?", options: ["Membran", "Sitoplasma", "Inti sel", "Dinding sel"], answer: 2, hint: "Disebut juga nukleus.", topic: "Sistem Organisasi Kehidupan", sub: "Sel" },
      { q: "Perubahan air menjadi uap disebut?", options: ["Membeku", "Mencair", "Menguap", "Mengembun"], answer: 2, hint: "Dari cair ke gas.", topic: "Zat dan Perubahannya", sub: "Perubahan Wujud" }
    ],
    pairs: [
      { a: "Jantung", b: "Memompa darah", topic: "Sistem Organisasi Kehidupan", sub: "Organ" },
      { a: "Ginjal", b: "Menyaring darah", topic: "Sistem Organisasi Kehidupan", sub: "Organ" },
      { a: "Paru-paru", b: "Bernapas", topic: "Sistem Organisasi Kehidupan", sub: "Organ" },
      { a: "Lambung", b: "Mencerna makanan", topic: "Sistem Organisasi Kehidupan", sub: "Organ" },
      { a: "Mata", b: "Melihat", topic: "Sistem Organisasi Kehidupan", sub: "Organ" },
      { a: "Otak", b: "Berpikir", topic: "Sistem Organisasi Kehidupan", sub: "Organ" }
    ],
    words: [
      { word: "EKOSISTEM", hint: "Hubungan makhluk hidup & lingkungannya", topic: "Ekologi & Keanekaragaman Hayati", sub: "Ekosistem" },
      { word: "FOTOSINTESIS", hint: "Cara tumbuhan membuat makanan", topic: "Sistem Organisasi Kehidupan", sub: "Organ" },
      { word: "MOLEKUL", hint: "Gabungan dua atom atau lebih", topic: "Zat dan Perubahannya", sub: "Wujud Zat" },
      { word: "GRAVITASI", hint: "Gaya tarik bumi", topic: "Gerak dan Gaya", sub: "Gaya" }
    ]
  },
  {
    id: "ips",
    name: "IPS / Sosial",
    icon: "🗺️",
    color: "#f59e0b",
    level: "SMP", grade: 8,
    topics: [
      { name: "Kondisi Geografis Indonesia", subs: ["Letak & Luas", "Gunung & Laut"] },
      { name: "Interaksi Sosial & Ekonomi", subs: ["Barter & Ekonomi"] },
      { name: "Sejarah Nasional", subs: ["Kemerdekaan", "Tokoh"] },
      { name: "Pemerintahan", subs: ["Lembaga Negara"] }
    ],
    quiz: [
      { q: "Indonesia merdeka pada tahun?", options: ["1942", "1945", "1949", "1950"], answer: 1, hint: "17 Agustus.", topic: "Sejarah Nasional", sub: "Kemerdekaan" },
      { q: "Mata angin yang menunjuk ke atas peta?", options: ["Timur", "Selatan", "Utara", "Barat"], answer: 2, hint: "Lawan dari selatan.", topic: "Kondisi Geografis Indonesia", sub: "Letak & Luas" },
      { q: "Presiden pertama Indonesia?", options: ["Soeharto", "Soekarno", "Habibie", "Jokowi"], answer: 1, hint: "Sang Proklamator.", topic: "Sejarah Nasional", sub: "Tokoh" },
      { q: "Kegiatan menukar barang tanpa uang disebut?", options: ["Jual beli", "Barter", "Kredit", "Investasi"], answer: 1, hint: "Zaman dahulu.", topic: "Interaksi Sosial & Ekonomi", sub: "Barter & Ekonomi" },
      { q: "Gunung tertinggi di Indonesia?", options: ["Semeru", "Rinjani", "Puncak Jaya", "Merapi"], answer: 2, hint: "Ada di Papua.", topic: "Kondisi Geografis Indonesia", sub: "Gunung & Laut" },
      { q: "Lembaga yang membuat undang-undang?", options: ["MA", "DPR", "KPK", "TNI"], answer: 1, hint: "Wakil rakyat.", topic: "Pemerintahan", sub: "Lembaga Negara" }
    ],
    pairs: [
      { a: "Sumatra", b: "Danau Toba", topic: "Kondisi Geografis Indonesia", sub: "Letak & Luas" },
      { a: "Jawa", b: "Borobudur", topic: "Kondisi Geografis Indonesia", sub: "Letak & Luas" },
      { a: "Bali", b: "Pura", topic: "Kondisi Geografis Indonesia", sub: "Letak & Luas" },
      { a: "Papua", b: "Raja Ampat", topic: "Kondisi Geografis Indonesia", sub: "Gunung & Laut" },
      { a: "Yogyakarta", b: "Keraton", topic: "Kondisi Geografis Indonesia", sub: "Letak & Luas" },
      { a: "Sulawesi", b: "Tana Toraja", topic: "Kondisi Geografis Indonesia", sub: "Letak & Luas" }
    ],
    words: [
      { word: "PROKLAMASI", hint: "Pernyataan kemerdekaan", topic: "Sejarah Nasional", sub: "Kemerdekaan" },
      { word: "KOPERASI", hint: "Usaha bersama asas kekeluargaan", topic: "Interaksi Sosial & Ekonomi", sub: "Barter & Ekonomi" },
      { word: "DEMOKRASI", hint: "Pemerintahan dari, oleh, untuk rakyat", topic: "Pemerintahan", sub: "Lembaga Negara" },
      { word: "KHATULISTIWA", hint: "Garis lintang nol derajat", topic: "Kondisi Geografis Indonesia", sub: "Letak & Luas" }
    ]
  },
  {
    id: "bindo",
    name: "Bahasa Indonesia",
    icon: "📖",
    color: "#f43f5e",
    level: "SD", grade: 5,
    topics: [
      { name: "Kosakata", subs: ["Sinonim & Antonim", "Kata Baku"] },
      { name: "Kalimat dan Kata", subs: ["Jenis Kata", "Imbuhan"] },
      { name: "Jenis Teks", subs: ["Cerpen", "Paragraf"] },
      { name: "Sastra", subs: ["Pantun & Puisi", "Peribahasa", "Majas"] }
    ],
    quiz: [
      { q: "Lawan kata 'tinggi' adalah?", options: ["Besar", "Rendah", "Panjang", "Lebar"], answer: 1, hint: "Antonim.", topic: "Kosakata", sub: "Sinonim & Antonim" },
      { q: "Kata baku yang benar adalah?", options: ["Apotik", "Apotek", "Aphotek", "Aphotik"], answer: 1, hint: "Menurut KBBI.", topic: "Kosakata", sub: "Kata Baku" },
      { q: "Kalimat 'Rajin pangkal pandai' termasuk?", options: ["Pantun", "Peribahasa", "Puisi", "Cerpen"], answer: 1, hint: "Ungkapan bijak.", topic: "Sastra", sub: "Peribahasa" },
      { q: "Karya sastra pendek berisi cerita disebut?", options: ["Novel", "Cerpen", "Puisi", "Drama"], answer: 1, hint: "Singkatan dari cerita pendek.", topic: "Jenis Teks", sub: "Cerpen" },
      { q: "Kata 'membaca' termasuk jenis kata?", options: ["Benda", "Kerja", "Sifat", "Bilangan"], answer: 1, hint: "Menunjukkan aktivitas.", topic: "Kalimat dan Kata", sub: "Jenis Kata" },
      { q: "Sinonim dari 'pintar' adalah?", options: ["Malas", "Bodoh", "Cerdas", "Lambat"], answer: 2, hint: "Persamaan kata.", topic: "Kosakata", sub: "Sinonim & Antonim" }
    ],
    pairs: [
      { a: "Sinonim", b: "Persamaan kata", topic: "Kosakata", sub: "Sinonim & Antonim" },
      { a: "Antonim", b: "Lawan kata", topic: "Kosakata", sub: "Sinonim & Antonim" },
      { a: "Pantun", b: "Bersajak a-b-a-b", topic: "Sastra", sub: "Pantun & Puisi" },
      { a: "Prosa", b: "Karangan bebas", topic: "Jenis Teks", sub: "Paragraf" },
      { a: "Majas", b: "Gaya bahasa", topic: "Sastra", sub: "Majas" },
      { a: "Paragraf", b: "Kumpulan kalimat", topic: "Jenis Teks", sub: "Paragraf" }
    ],
    words: [
      { word: "PARAGRAF", hint: "Kumpulan kalimat satu gagasan", topic: "Jenis Teks", sub: "Paragraf" },
      { word: "PERIBAHASA", hint: "Ungkapan berisi nasihat", topic: "Sastra", sub: "Peribahasa" },
      { word: "IMBUHAN", hint: "Awalan, sisipan, atau akhiran", topic: "Kalimat dan Kata", sub: "Imbuhan" },
      { word: "SINONIM", hint: "Persamaan makna kata", topic: "Kosakata", sub: "Sinonim & Antonim" }
    ]
  },
  {
    id: "bing",
    name: "Bahasa Inggris",
    icon: "🔤",
    color: "#a855f7",
    level: "SMA", grade: 10,
    topics: [
      { name: "Vocabulary", subs: ["Daily Words", "Antonyms"] },
      { name: "Grammar", subs: ["Tenses", "Plural"] },
      { name: "Expressions", subs: ["Greetings"] }
    ],
    quiz: [
      { q: "'Apple' dalam bahasa Indonesia?", options: ["Jeruk", "Apel", "Anggur", "Mangga"], answer: 1, hint: "Buah merah/hijau.", topic: "Vocabulary", sub: "Daily Words" },
      { q: "Past tense dari 'go' adalah?", options: ["Goed", "Gone", "Went", "Going"], answer: 2, hint: "Irregular verb.", topic: "Grammar", sub: "Tenses" },
      { q: "'Selamat pagi' in English?", options: ["Good night", "Good morning", "Good bye", "Good day"], answer: 1, hint: "Diucapkan pagi hari.", topic: "Expressions", sub: "Greetings" },
      { q: "Plural of 'child' is?", options: ["Childs", "Childes", "Children", "Childrens"], answer: 2, hint: "Irregular plural.", topic: "Grammar", sub: "Plural" },
      { q: "'Teacher' artinya?", options: ["Murid", "Guru", "Kepala sekolah", "Penjaga"], answer: 1, hint: "Yang mengajar.", topic: "Vocabulary", sub: "Daily Words" },
      { q: "Antonym of 'hot' is?", options: ["Warm", "Cold", "Cool", "Boiling"], answer: 1, hint: "Suhu dingin.", topic: "Vocabulary", sub: "Antonyms" }
    ],
    pairs: [
      { a: "Cat", b: "Kucing", topic: "Vocabulary", sub: "Daily Words" },
      { a: "Dog", b: "Anjing", topic: "Vocabulary", sub: "Daily Words" },
      { a: "Book", b: "Buku", topic: "Vocabulary", sub: "Daily Words" },
      { a: "Water", b: "Air", topic: "Vocabulary", sub: "Daily Words" },
      { a: "House", b: "Rumah", topic: "Vocabulary", sub: "Daily Words" },
      { a: "School", b: "Sekolah", topic: "Vocabulary", sub: "Daily Words" }
    ],
    words: [
      { word: "SCHOOL", hint: "Tempat belajar (English)", topic: "Vocabulary", sub: "Daily Words" },
      { word: "FRIEND", hint: "Teman (English)", topic: "Vocabulary", sub: "Daily Words" },
      { word: "TEACHER", hint: "Guru (English)", topic: "Vocabulary", sub: "Daily Words" },
      { word: "LIBRARY", hint: "Perpustakaan (English)", topic: "Vocabulary", sub: "Daily Words" }
    ]
  },
  {
    id: "pai",
    name: "Pendidikan Agama Islam",
    icon: "🕌",
    color: "#14b8a6",
    level: "SD", grade: 3,
    topics: [
      { name: "Rukun Islam", subs: ["Syahadat", "Salat", "Zakat", "Puasa", "Haji"] },
      { name: "Al-Qur'an", subs: ["Kitab Suci"] },
      { name: "Kisah Teladan", subs: ["Nabi & Rasul"] },
      { name: "Akhlak Terpuji", subs: [] }
    ],
    quiz: [
      { q: "Jumlah rukun Islam ada?", options: ["4", "5", "6", "7"], answer: 1, hint: "Termasuk syahadat & haji.", topic: "Rukun Islam", sub: "" },
      { q: "Kitab suci umat Islam adalah?", options: ["Taurat", "Injil", "Al-Qur'an", "Zabur"], answer: 2, hint: "Diturunkan kepada Nabi Muhammad.", topic: "Al-Qur'an", sub: "Kitab Suci" },
      { q: "Sholat wajib sehari semalam ada?", options: ["3", "4", "5", "6"], answer: 2, hint: "Subuh sampai Isya.", topic: "Rukun Islam", sub: "Salat" },
      { q: "Nabi terakhir dalam Islam adalah?", options: ["Nabi Isa", "Nabi Musa", "Nabi Muhammad", "Nabi Adam"], answer: 2, hint: "Penutup para nabi.", topic: "Kisah Teladan", sub: "Nabi & Rasul" },
      { q: "Bulan diwajibkan berpuasa adalah?", options: ["Syawal", "Ramadhan", "Muharram", "Rajab"], answer: 1, hint: "Sebelum Idul Fitri.", topic: "Rukun Islam", sub: "Puasa" },
      { q: "Arah kiblat umat Islam menghadap ke?", options: ["Masjid Nabawi", "Ka'bah", "Masjidil Aqsa", "Madinah"], answer: 1, hint: "Berada di Makkah.", topic: "Rukun Islam", sub: "Salat" }
    ],
    pairs: [
      { a: "Syahadat", b: "Rukun Islam ke-1", topic: "Rukun Islam", sub: "Syahadat" },
      { a: "Sholat", b: "Rukun Islam ke-2", topic: "Rukun Islam", sub: "Salat" },
      { a: "Zakat", b: "Rukun Islam ke-3", topic: "Rukun Islam", sub: "Zakat" },
      { a: "Puasa", b: "Rukun Islam ke-4", topic: "Rukun Islam", sub: "Puasa" },
      { a: "Haji", b: "Rukun Islam ke-5", topic: "Rukun Islam", sub: "Haji" },
      { a: "Wudhu", b: "Bersuci sebelum sholat", topic: "Rukun Islam", sub: "Salat" }
    ],
    words: [
      { word: "TAQWA", hint: "Menjalankan perintah, menjauhi larangan Allah", topic: "Akhlak Terpuji", sub: "" },
      { word: "SEDEKAH", hint: "Memberi tanpa mengharap imbalan", topic: "Akhlak Terpuji", sub: "" },
      { word: "TAWADHU", hint: "Sikap rendah hati", topic: "Akhlak Terpuji", sub: "" },
      { word: "ISTIQOMAH", hint: "Konsisten dalam kebaikan", topic: "Akhlak Terpuji", sub: "" }
    ]
  }
];
