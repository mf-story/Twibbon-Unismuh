/* =========================================================================
   EduGame Hub — Katalog Kurikulum Merdeka (curriculum.js)
   -------------------------------------------------------------------------
   Katalog SEMUA mata pelajaran beserta materi & sub-materi untuk tiap
   jenjang (SD/SMP/SMA) dan tiap kelas. Dipakai untuk membuat mapel
   "on-demand" lewat pemilih mapel (hemat penyimpanan — bank soal diisi
   manual atau lewat AI). Struktur:
     window.CURRICULUM = { SD:{1:[subj...],...}, SMP:{7:[...]}, SMA:{10:[...]} }
     subj = { name, icon, color, topics:[{ name, subs:[...] }] }
   ========================================================================= */
window.CURRICULUM = (function () {
  var META = {
    "Pendidikan Agama Islam & Budi Pekerti": { icon: "🕌", color: "#14b8a6" },
    "Pendidikan Pancasila": { icon: "🇮🇩", color: "#ef4444" },
    "Bahasa Indonesia": { icon: "📖", color: "#f43f5e" },
    "Matematika": { icon: "🔢", color: "#0ea5e9" },
    "IPAS": { icon: "🌏", color: "#22c55e" },
    "IPA": { icon: "🔬", color: "#22c55e" },
    "IPS": { icon: "🗺️", color: "#f59e0b" },
    "Bahasa Inggris": { icon: "🔤", color: "#a855f7" },
    "Seni Budaya": { icon: "🎨", color: "#ec4899" },
    "Seni dan Budaya": { icon: "🎨", color: "#ec4899" },
    "PJOK": { icon: "⚽", color: "#10b981" },
    "Informatika": { icon: "💻", color: "#6366f1" },
    "Prakarya": { icon: "🛠️", color: "#f97316" },
    "Sejarah": { icon: "🏛️", color: "#b45309" },
    "Fisika": { icon: "⚛️", color: "#3b82f6" },
    "Kimia": { icon: "⚗️", color: "#8b5cf6" },
    "Biologi": { icon: "🧬", color: "#16a34a" },
    "Ekonomi": { icon: "💰", color: "#eab308" },
    "Sosiologi": { icon: "👥", color: "#0891b2" },
    "Geografi": { icon: "🌐", color: "#0d9488" }
  };
  function t(name, subs) { return { name: name, subs: subs || [] }; }
  function s(name, topics) {
    var m = META[name] || { icon: "📘", color: "#4f46e5" };
    return { name: name, icon: m.icon, color: m.color, topics: topics };
  }

  return {
    /* ===================== SD ===================== */
    SD: {
      1: [
        s("Pendidikan Agama Islam & Budi Pekerti", [
          t("Mengenal Al-Qur'an", ["Huruf Hijaiah", "Membaca Iqra"]),
          t("Rukun Iman", ["Iman kepada Allah", "Sifat Allah"]),
          t("Rukun Islam", ["Syahadat", "Salat"]),
          t("Bersuci (Taharah)", ["Wudu", "Kebersihan"]),
          t("Kisah Teladan", ["Nabi Adam a.s."])
        ]),
        s("Pendidikan Pancasila", [
          t("Aku dan Temanku", ["Perkenalan Diri", "Bermain Bersama"]),
          t("Simbol Pancasila", ["Garuda Pancasila", "Bunyi Sila"]),
          t("Aturan di Rumah", ["Kewajiban di Rumah", "Hak Anak"]),
          t("Keberagaman", ["Perbedaan Teman", "Saling Menghargai"]),
          t("Identitas Bangsa", ["Bendera Merah Putih", "Lagu Indonesia Raya"])
        ]),
        s("Bahasa Indonesia", [
          t("Menyimak", ["Menyimak Bunyi & Huruf", "Menyimak Cerita"]),
          t("Membaca & Memirsa", ["Suku Kata", "Membaca Kata & Kalimat"]),
          t("Berbicara & Mempresentasikan", ["Memperkenalkan Diri", "Bercerita Sederhana"]),
          t("Menulis", ["Menulis Huruf", "Menulis Kata"]),
          t("Kebahasaan", ["Nama Benda", "Nama Hewan", "Kosakata Sehari-hari"])
        ]),
        s("Matematika", [
          t("Bilangan", ["Membilang 1–20", "Lambang Bilangan", "Membandingkan Bilangan"]),
          t("Operasi Bilangan", ["Penjumlahan sampai 20", "Pengurangan sampai 20"]),
          t("Pengukuran", ["Panjang & Berat (tak baku)", "Waktu (pagi-siang-malam)"]),
          t("Geometri", ["Bangun Datar Sederhana", "Bangun Ruang di Sekitar"]),
          t("Analisis Data", ["Pola Gambar", "Pola Bilangan"])
        ]),
        s("Seni dan Budaya", [
          t("Menggambar", ["Garis & Bentuk", "Mewarnai"]),
          t("Menyanyi", ["Lagu Anak", "Tepuk Irama"]),
          t("Menari", ["Gerak Anggota Tubuh"])
        ]),
        s("PJOK", [
          t("Gerak Lokomotor", ["Berjalan & Berlari", "Melompat"]),
          t("Gerak Non-lokomotor", ["Menekuk & Memutar"]),
          t("Gerak Manipulatif", ["Melempar & Menangkap"]),
          t("Pola Hidup Sehat", ["Kebersihan Diri"])
        ]),
        s("Bahasa Inggris", [
          t("Greetings", ["Hello & Goodbye", "How are you"]),
          t("Numbers", ["Numbers 1–10"]),
          t("Colors", ["Basic Colors"]),
          t("Family", ["Family Members"])
        ])
      ],
      2: [
        s("Pendidikan Agama Islam & Budi Pekerti", [
          t("Al-Qur'an", ["Huruf Hijaiah Bersambung", "Surah Pendek"]),
          t("Asmaul Husna", ["Ar-Rahman", "Ar-Rahim"]),
          t("Kalimat Thayyibah", ["Basmalah", "Hamdalah"]),
          t("Ibadah", ["Doa Harian", "Adab"]),
          t("Kisah Teladan", ["Nabi Nuh a.s."])
        ]),
        s("Pendidikan Pancasila", [
          t("Bersyukur", ["Nikmat Tuhan"]),
          t("Gotong Royong", ["Kerja Sama", "Tolong-menolong"]),
          t("Aturan di Sekolah", ["Tata Tertib", "Piket Kelas"]),
          t("Keberagaman", ["Suku & Budaya"]),
          t("Lingkungan", ["Menjaga Kebersihan"])
        ]),
        s("Bahasa Indonesia", [
          t("Menyimak", ["Menyimak Petunjuk", "Menyimak Cerita"]),
          t("Membaca & Memirsa", ["Membaca Lancar", "Memahami Isi Teks"]),
          t("Berbicara & Mempresentasikan", ["Bercerita Pengalaman", "Bertanya & Menjawab"]),
          t("Menulis", ["Kalimat Sederhana", "Tanda Baca", "Huruf Kapital"]),
          t("Kebahasaan", ["Kata Sifat", "Kata Kerja", "Kosakata"]),
          t("Sastra", ["Puisi Anak"])
        ]),
        s("Matematika", [
          t("Bilangan", ["Bilangan sampai 100", "Nilai Tempat (puluhan-satuan)", "Membandingkan & Mengurutkan"]),
          t("Operasi Bilangan", ["Penjumlahan & Pengurangan", "Perkalian Dasar", "Pembagian Dasar"]),
          t("Pengukuran", ["Panjang (baku)", "Berat", "Waktu & Jam"]),
          t("Geometri", ["Bangun Datar", "Bangun Ruang"]),
          t("Analisis Data", ["Membaca Diagram Gambar"])
        ]),
        s("Seni dan Budaya", [
          t("Seni Rupa", ["Kolase", "Finger Painting"]),
          t("Musik", ["Nada Tinggi-Rendah"]),
          t("Tari", ["Gerak & Lagu"])
        ]),
        s("PJOK", [
          t("Variasi Gerak Dasar", ["Kombinasi Gerak"]),
          t("Senam Lantai Dasar", ["Guling Depan"]),
          t("Permainan Bola", ["Menendang & Menangkap"]),
          t("Kebersihan Diri", ["Merawat Tubuh"])
        ]),
        s("Bahasa Inggris", [
          t("Animals", ["Farm & Wild Animals"]),
          t("Fruits", ["Common Fruits"]),
          t("Parts of Body", ["Face & Body"]),
          t("Classroom Objects", ["Things in Class"])
        ])
      ],
      3: [
        s("Pendidikan Agama Islam & Budi Pekerti", [
          t("Al-Qur'an", ["Surah Al-Fatihah", "Tajwid Dasar"]),
          t("Akidah", ["Iman kepada Malaikat"]),
          t("Akhlak", ["Jujur & Amanah"]),
          t("Fikih", ["Salat Wajib"]),
          t("Kisah Teladan", ["Nabi Ibrahim a.s."])
        ]),
        s("Pendidikan Pancasila", [
          t("Norma & Aturan", ["Norma di Masyarakat"]),
          t("Hak & Kewajiban", ["di Rumah & Sekolah"]),
          t("Identitas & Budaya", ["Ciri Khas Daerah"]),
          t("Musyawarah", ["Mufakat"]),
          t("Lingkungan Sekitar", ["Menjaga Lingkungan"])
        ]),
        s("Bahasa Indonesia", [
          t("Menyimak", ["Menyimak Teks Informasi", "Menyimak Teks Narasi"]),
          t("Membaca & Memirsa", ["Ide Pokok & Pendukung", "Unsur Cerita"]),
          t("Berbicara & Mempresentasikan", ["Wawancara Sederhana", "Menyampaikan Pendapat"]),
          t("Menulis", ["Menulis Paragraf", "Kalimat Efektif"]),
          t("Kebahasaan", ["Sinonim & Antonim", "Huruf Kapital", "Tanda Baca"]),
          t("Sastra", ["Puisi & Rima"])
        ]),
        s("Matematika", [
          t("Bilangan", ["Bilangan sampai 10.000", "Nilai Tempat", "Membandingkan & Mengurutkan"]),
          t("Operasi Hitung", ["Perkalian", "Pembagian", "Operasi Campuran"]),
          t("Pecahan", ["Pecahan Sederhana", "Pecahan Senilai"]),
          t("Pengukuran", ["Panjang, Berat, Waktu", "Keliling Bangun Datar"]),
          t("Geometri", ["Bangun Datar", "Ciri Bangun"]),
          t("Analisis Data", ["Diagram Gambar", "Tabel"])
        ]),
        s("IPAS", [
          t("Makhluk Hidup", ["Ciri Makhluk Hidup", "Kebutuhan Hidup", "Penggolongan"]),
          t("Tumbuhan", ["Bagian & Fungsi", "Fotosintesis"]),
          t("Wujud & Sifat Benda", ["Padat, Cair, Gas", "Perubahan Wujud"]),
          t("Gaya & Gerak", ["Dorong & Tarik", "Pengaruh Gaya"]),
          t("Lingkungan & Sosial", ["Denah & Arah Mata Angin", "Kegiatan Ekonomi Keluarga"]),
          t("Keterampilan Proses", ["Mengamati & Bertanya"])
        ]),
        s("Seni dan Budaya", [
          t("Seni Rupa", ["Menggambar Bentuk"]),
          t("Musik", ["Alat Musik Ritmis"]),
          t("Tari", ["Tari Daerah"]),
          t("Teater", ["Bermain Peran"])
        ]),
        s("PJOK", [
          t("Permainan Bola Besar", ["Sepak Bola Sederhana"]),
          t("Permainan Bola Kecil", ["Kasti"]),
          t("Atletik Dasar", ["Lari & Lompat"]),
          t("Kebugaran Jasmani", ["Latihan Sederhana"])
        ]),
        s("Bahasa Inggris", [
          t("Food & Drink", ["Meals"]),
          t("Hobbies", ["Favorite Activities"]),
          t("Days of the Week", ["Seven Days"]),
          t("My House", ["Rooms in House"])
        ])
      ],
      4: [
        s("Pendidikan Agama Islam & Budi Pekerti", [
          t("Al-Qur'an", ["Surah Al-'Asr", "Hukum Nun Mati"]),
          t("Akidah", ["Asmaul Husna", "Iman kepada Kitab"]),
          t("Akhlak", ["Hormat Orang Tua & Guru"]),
          t("Fikih", ["Salat Berjamaah"]),
          t("Sejarah Islam", ["Kisah Nabi Muhammad SAW"])
        ]),
        s("Pendidikan Pancasila", [
          t("Makna Sila Pancasila", ["Penerapan Sila"]),
          t("Hak & Kewajiban", ["Sebagai Warga"]),
          t("Keberagaman", ["Bhinneka Tunggal Ika"]),
          t("Musyawarah", ["Pengambilan Keputusan"]),
          t("Norma", ["Aturan & Sanksi"])
        ]),
        s("Bahasa Indonesia", [
          t("Menyimak", ["Menyimak Teks Fiksi", "Menyimak Instruksi"]),
          t("Membaca & Memirsa", ["Teks Fiksi (Tokoh & Latar)", "Teks Nonfiksi (Gagasan Pokok)"]),
          t("Berbicara & Mempresentasikan", ["Menyampaikan Pendapat", "Presentasi Sederhana"]),
          t("Menulis", ["Teks Deskripsi", "Kalimat Majemuk"]),
          t("Kebahasaan", ["Imbuhan", "Sinonim & Antonim", "Kata Baku"]),
          t("Sastra", ["Pantun", "Puisi"])
        ]),
        s("Matematika", [
          t("Bilangan", ["Bilangan Cacah Besar", "Bilangan Prima", "KPK & FPB"]),
          t("Operasi Hitung", ["Perkalian", "Pembagian", "Operasi Campuran"]),
          t("Pecahan", ["Pecahan Senilai", "Penjumlahan Pecahan", "Persen"]),
          t("Geometri", ["Bangun Datar", "Sudut", "Simetri"]),
          t("Pengukuran", ["Keliling & Luas"]),
          t("Analisis Data", ["Diagram Batang"])
        ]),
        s("IPAS", [
          t("Tumbuhan & Bagiannya", ["Bagian Tumbuhan & Fungsi", "Perkembangbiakan Tumbuhan"]),
          t("Energi", ["Bentuk Energi", "Perubahan Energi", "Sumber Energi"]),
          t("Gaya", ["Gaya Gravitasi", "Gaya Gesek", "Gaya Magnet"]),
          t("Siklus Hidup", ["Metamorfosis Sempurna", "Metamorfosis Tidak Sempurna"]),
          t("Keragaman Indonesia", ["Suku & Budaya", "Peta & Kenampakan Alam"]),
          t("Keterampilan Proses", ["Percobaan Sederhana"])
        ]),
        s("Seni dan Budaya", [
          t("Seni Rupa", ["Gambar Ilustrasi"]),
          t("Musik", ["Lagu Daerah"]),
          t("Tari", ["Pola Lantai"]),
          t("Teater", ["Ekspresi"])
        ]),
        s("PJOK", [
          t("Sepak Bola & Voli", ["Teknik Dasar"]),
          t("Kasti", ["Melempar & Memukul"]),
          t("Atletik", ["Lari & Lompat"]),
          t("Renang & Keselamatan", ["Pengenalan Air"])
        ]),
        s("Bahasa Inggris", [
          t("Daily Activities", ["Routines"]),
          t("Telling Time", ["Clock"]),
          t("Occupations", ["Jobs"]),
          t("Places in Town", ["Public Places"])
        ])
      ],
      5: [
        s("Pendidikan Agama Islam & Budi Pekerti", [
          t("Al-Qur'an", ["Surah Al-Ma'un", "Tajwid"]),
          t("Akidah", ["Iman kepada Rasul"]),
          t("Akhlak", ["Sederhana & Ikhlas"]),
          t("Fikih", ["Puasa", "Zakat Fitrah"]),
          t("Sejarah Islam", ["Khulafaur Rasyidin"])
        ]),
        s("Pendidikan Pancasila", [
          t("Nilai Pancasila", ["Penerapan dalam Kehidupan"]),
          t("Hak, Kewajiban, Tanggung Jawab", ["Warga Negara"]),
          t("Keragaman Sosial Budaya", ["Persatuan"]),
          t("NKRI", ["Wilayah Indonesia"]),
          t("Demokrasi", ["Musyawarah"])
        ]),
        s("Bahasa Indonesia", [
          t("Menyimak", ["Menyimak Teks Eksplanasi", "Menyimak Berita"]),
          t("Membaca & Memirsa", ["Teks Narasi (Alur)", "Teks Eksplanasi (Sebab-Akibat)"]),
          t("Berbicara & Mempresentasikan", ["Berdiskusi", "Presentasi Hasil"]),
          t("Menulis", ["Menulis Teks Eksplanasi", "Kalimat Efektif"]),
          t("Kebahasaan", ["Jenis Kata", "Sinonim & Antonim", "Kata Baku"]),
          t("Sastra", ["Pantun & Puisi", "Peribahasa"])
        ]),
        s("Matematika", [
          t("Bilangan", ["Bilangan Desimal", "Desimal & Persen", "KPK & FPB"]),
          t("Operasi Pecahan", ["Penjumlahan Pecahan", "Perkalian & Pembagian Pecahan"]),
          t("Geometri", ["Bangun Ruang (Kubus & Balok)", "Volume", "Jaring-jaring"]),
          t("Pengukuran", ["Kecepatan", "Debit", "Skala"]),
          t("Analisis Data", ["Rata-rata (Mean)", "Penyajian Data"])
        ]),
        s("IPAS", [
          t("Sistem Tubuh Manusia", ["Pencernaan", "Pernapasan", "Peredaran Darah"]),
          t("Ekosistem", ["Rantai Makanan", "Jaring-jaring Makanan"]),
          t("Siklus Air", ["Daur Air", "Kegiatan yang Memengaruhi"]),
          t("Perubahan Zat", ["Perubahan Fisika", "Perubahan Kimia"]),
          t("Sejarah & Sosial", ["Kerajaan di Indonesia", "Interaksi Sosial"]),
          t("Keterampilan Proses", ["Menyimpulkan Data"])
        ]),
        s("Seni dan Budaya", [
          t("Seni Rupa", ["Karya 3 Dimensi"]),
          t("Musik", ["Tangga Nada"]),
          t("Tari", ["Properti Tari"]),
          t("Teater", ["Naskah Drama"])
        ]),
        s("PJOK", [
          t("Voli & Basket", ["Teknik Dasar"]),
          t("Atletik", ["Lari & Lompat"]),
          t("Senam Irama", ["Gerak Berirama"]),
          t("Pola Hidup Sehat", ["Gizi Seimbang"])
        ]),
        s("Bahasa Inggris", [
          t("Simple Present Tense", ["Daily Habits"]),
          t("Descriptive", ["Adjectives"]),
          t("Directions", ["Left, Right, Straight"]),
          t("Weather & Seasons", ["Weather"])
        ])
      ],
      6: [
        s("Pendidikan Agama Islam & Budi Pekerti", [
          t("Al-Qur'an", ["Surah Al-Kafirun", "Al-Hujurat"]),
          t("Akidah", ["Iman kepada Hari Akhir"]),
          t("Akhlak", ["Toleransi"]),
          t("Fikih", ["Zakat", "Haji"]),
          t("Sejarah Islam", ["Wali Songo"])
        ]),
        s("Pendidikan Pancasila", [
          t("Penerapan Pancasila", ["dalam Kehidupan Berbangsa"]),
          t("Kesatuan NKRI", ["Wilayah & Batas"]),
          t("Keberagaman", ["Persatuan dalam Perbedaan"]),
          t("Sistem Pemerintahan", ["Lembaga Negara"]),
          t("Hak & Kewajiban", ["Warga Negara"])
        ]),
        s("Bahasa Indonesia", [
          t("Menyimak", ["Menyimak Pidato", "Menyimak Teks Argumentasi"]),
          t("Membaca & Memirsa", ["Teks Fiksi (Amanat)", "Teks Nonfiksi (Simpulan)"]),
          t("Berbicara & Mempresentasikan", ["Berpidato", "Menyampaikan Tanggapan"]),
          t("Menulis", ["Menulis Pidato", "Menyusun Simpulan"]),
          t("Kebahasaan", ["Kata Baku & Ejaan (EYD)", "Kalimat Efektif"]),
          t("Sastra", ["Majas", "Puisi"])
        ]),
        s("Matematika", [
          t("Bilangan", ["Bilangan Bulat", "Operasi Campuran", "Bilangan Pangkat & Akar"]),
          t("Aljabar", ["Rasio & Perbandingan", "Skala"]),
          t("Geometri", ["Lingkaran (Keliling & Luas)", "Bangun Ruang (Volume & Luas Permukaan)"]),
          t("Pengukuran", ["Satuan Volume", "Debit"]),
          t("Analisis Data & Peluang", ["Modus, Median, Mean", "Penyajian Data", "Peluang Sederhana"])
        ]),
        s("IPAS", [
          t("Perkembangbiakan", ["Tumbuhan", "Hewan", "Manusia (Pubertas)"]),
          t("Listrik & Magnet", ["Rangkaian Listrik", "Sifat Magnet", "Induksi"]),
          t("Bumi & Antariksa", ["Tata Surya", "Rotasi & Revolusi", "Gerhana"]),
          t("Adaptasi Makhluk Hidup", ["Adaptasi & Ciri Khusus"]),
          t("Masyarakat & Globalisasi", ["Dampak Globalisasi", "Ekonomi & Modernisasi"]),
          t("Keterampilan Proses", ["Laporan Penyelidikan"])
        ]),
        s("Seni dan Budaya", [
          t("Seni Rupa", ["Poster & Reklame"]),
          t("Musik", ["Interval Nada"]),
          t("Tari", ["Tari Kreasi"]),
          t("Teater", ["Pementasan"])
        ]),
        s("PJOK", [
          t("Permainan Bola Besar", ["Sepak Bola & Basket"]),
          t("Pencak Silat", ["Teknik Dasar"]),
          t("Kebugaran Jasmani", ["Tes Kebugaran"]),
          t("Renang", ["Gaya Bebas"])
        ]),
        s("Bahasa Inggris", [
          t("Simple Past Tense", ["Past Events"]),
          t("Shopping", ["At the Store"]),
          t("Public Places", ["Around Town"]),
          t("Short Dialogue", ["Conversation"])
        ])
      ]
    },

    /* ===================== SMP ===================== */
    SMP: {
      7: [
        s("Pendidikan Agama Islam & Budi Pekerti", [
          t("Al-Qur'an & Hadis", ["Hukum Bacaan (Tajwid)", "Hafalan Surah"]),
          t("Akidah", ["Iman kepada Allah & Asmaul Husna"]),
          t("Akhlak", ["Jujur, Amanah, Istiqomah"]),
          t("Fikih", ["Taharah", "Salat Wajib & Sunah"]),
          t("Sejarah Kebudayaan Islam", ["Dakwah Nabi di Makkah"])
        ]),
        s("Pendidikan Pancasila", [
          t("Sejarah Pancasila", ["Perumusan Pancasila"]),
          t("Norma & UUD 1945", ["Norma dalam Masyarakat"]),
          t("Kebinekaan", ["Keberagaman SARA"]),
          t("Kerja Sama", ["Gotong Royong"]),
          t("Wilayah NKRI", ["Karakteristik Daerah"])
        ]),
        s("Bahasa Indonesia", [
          t("Teks Deskripsi", ["Struktur & Ciri"]),
          t("Cerita Fantasi", ["Unsur Intrinsik"]),
          t("Teks Prosedur", ["Langkah-langkah"]),
          t("Laporan Observasi", ["Fakta & Klasifikasi"]),
          t("Puisi Rakyat", ["Pantun, Gurindam, Syair"]),
          t("Surat", ["Surat Pribadi & Dinas"])
        ]),
        s("Matematika", [
          t("Bilangan", ["Bilangan Bulat & Pecahan", "Bilangan Berpangkat"]),
          t("Aljabar", ["Bentuk Aljabar", "Operasi Aljabar"]),
          t("Persamaan Linear", ["PLSV & PtLSV"]),
          t("Perbandingan", ["Skala & Rasio"]),
          t("Aritmetika Sosial", ["Untung Rugi", "Diskon"]),
          t("Himpunan", ["Operasi Himpunan"])
        ]),
        s("IPA", [
          t("Pengukuran", ["Besaran & Satuan"]),
          t("Zat dan Perubahannya", ["Wujud Zat", "Perubahan Fisika & Kimia"]),
          t("Suhu & Kalor", ["Suhu", "Perpindahan Kalor"]),
          t("Klasifikasi Makhluk Hidup", ["Ciri & Kingdom"]),
          t("Sistem Organisasi Kehidupan", ["Sel, Jaringan, Organ"]),
          t("Ekologi", ["Ekosistem"])
        ]),
        s("IPS", [
          t("Manusia, Tempat, Lingkungan", ["Letak & Kondisi Geografis"]),
          t("Interaksi Sosial", ["Bentuk Interaksi"]),
          t("Aktivitas Ekonomi", ["Produksi, Distribusi, Konsumsi"]),
          t("Masa Praaksara", ["Kehidupan Praaksara"]),
          t("Masa Hindu-Buddha", ["Kerajaan Hindu-Buddha"])
        ]),
        s("Bahasa Inggris", [
          t("Greetings & Introduction", ["Self Introduction"]),
          t("Things & Places", ["Preposition of Place"]),
          t("Daily Activities", ["Simple Present"]),
          t("Describing People", ["Adjectives"]),
          t("Descriptive Text", ["Animals & Things"])
        ]),
        s("Informatika", [
          t("Berpikir Komputasional", ["Algoritma Sederhana"]),
          t("TIK", ["Perangkat Keras & Lunak"]),
          t("Sistem Komputer", ["Input-Proses-Output"]),
          t("Jaringan & Internet", ["Internet Aman"]),
          t("Analisis Data", ["Data & Informasi"])
        ]),
        s("Seni Budaya", [
          t("Seni Rupa", ["Menggambar Flora & Fauna"]),
          t("Seni Musik", ["Bernyanyi Unisono"]),
          t("Seni Tari", ["Ragam Gerak Tari"]),
          t("Seni Teater", ["Dasar Akting"])
        ]),
        s("PJOK", [
          t("Permainan Bola Besar", ["Sepak Bola", "Bola Voli"]),
          t("Permainan Bola Kecil", ["Bulu Tangkis"]),
          t("Atletik", ["Lari & Lompat"]),
          t("Kebugaran Jasmani", ["Latihan Kebugaran"]),
          t("Senam Lantai", ["Guling Depan & Belakang"])
        ]),
        s("Prakarya", [
          t("Kerajinan", ["Bahan Serat"]),
          t("Rekayasa", ["Teknologi Sederhana"]),
          t("Budi Daya", ["Tanaman Sayuran"]),
          t("Pengolahan", ["Buah & Sayur"])
        ])
      ],
      8: [
        s("Pendidikan Agama Islam & Budi Pekerti", [
          t("Al-Qur'an & Hadis", ["Tajwid (Mad)", "Hafalan"]),
          t("Akidah", ["Iman kepada Kitab & Rasul"]),
          t("Akhlak", ["Rendah Hati & Hemat"]),
          t("Fikih", ["Salat Sunah", "Makanan Halal-Haram"]),
          t("Sejarah Kebudayaan Islam", ["Daulah Umayyah"])
        ]),
        s("Pendidikan Pancasila", [
          t("Kedudukan Pancasila", ["Ideologi Negara"]),
          t("UUD NRI 1945", ["Sistem Pemerintahan"]),
          t("Tata Negara", ["Lembaga Negara"]),
          t("Keberagaman Masyarakat", ["Toleransi"]),
          t("Semangat Kebangsaan", ["Sumpah Pemuda"])
        ]),
        s("Bahasa Indonesia", [
          t("Teks Berita", ["Unsur 5W+1H"]),
          t("Teks Eksposisi", ["Gagasan & Fakta"]),
          t("Teks Eksplanasi", ["Sebab-Akibat"]),
          t("Teks Persuasi", ["Ajakan"]),
          t("Drama", ["Unsur Drama"]),
          t("Teks Ulasan", ["Kelebihan & Kekurangan"])
        ]),
        s("Matematika", [
          t("Pola Bilangan", ["Barisan & Deret"]),
          t("Koordinat Kartesius", ["Titik & Bidang"]),
          t("Relasi & Fungsi", ["Fungsi"]),
          t("Persamaan Garis Lurus", ["Gradien"]),
          t("SPLDV", ["Metode Penyelesaian"]),
          t("Teorema Pythagoras", ["Penerapan"]),
          t("Bangun Ruang Sisi Datar", ["Volume & Luas"]),
          t("Statistika & Peluang", ["Mean, Median, Modus", "Peluang"])
        ]),
        s("IPA", [
          t("Gerak & Gaya", ["Hukum Newton"]),
          t("Pesawat Sederhana", ["Tuas, Katrol"]),
          t("Struktur Tumbuhan", ["Jaringan Tumbuhan"]),
          t("Sistem Pencernaan", ["Organ & Enzim"]),
          t("Zat Aditif & Adiktif", ["Bahan Makanan"]),
          t("Sistem Peredaran Darah", ["Jantung & Pembuluh"]),
          t("Tekanan", ["Zat Cair & Gas"]),
          t("Sistem Pernapasan & Ekskresi", ["Organ Tubuh"])
        ]),
        s("IPS", [
          t("Geografis ASEAN", ["Letak & SDA"]),
          t("Mobilitas Sosial", ["Bentuk Mobilitas"]),
          t("Pluralitas Masyarakat", ["Keberagaman"]),
          t("Perdagangan Antarnegara", ["Ekonomi Maritim"]),
          t("Masa Kolonialisme", ["Penjajahan & Perlawanan"])
        ]),
        s("Bahasa Inggris", [
          t("Asking & Giving Attention", ["Expressions"]),
          t("Ability & Willingness", ["Can & Will"]),
          t("Obligation & Prohibition", ["Must & Mustn't"]),
          t("Recount Text", ["Past Events"]),
          t("Notice & Greeting Card", ["Short Functional Text"])
        ]),
        s("Informatika", [
          t("Berpikir Komputasional", ["Algoritma & Flowchart"]),
          t("Jaringan Komputer", ["Konektivitas"]),
          t("Pengolah Data", ["Spreadsheet"]),
          t("Pemrograman Visual", ["Scratch / Blok"]),
          t("Dampak Sosial Informatika", ["Etika Digital"])
        ]),
        s("Seni Budaya", [
          t("Seni Rupa", ["Menggambar Model & Ilustrasi"]),
          t("Seni Musik", ["Bernyanyi Vokal Grup"]),
          t("Seni Tari", ["Tari Tradisional"]),
          t("Seni Teater", ["Teknik Pementasan"])
        ]),
        s("PJOK", [
          t("Permainan Bola Besar", ["Bola Basket"]),
          t("Permainan Bola Kecil", ["Tenis Meja"]),
          t("Atletik", ["Lompat Jauh"]),
          t("Beladiri", ["Pencak Silat"]),
          t("Senam Irama", ["Gerak Berirama"])
        ]),
        s("Prakarya", [
          t("Kerajinan", ["Bahan Lunak"]),
          t("Rekayasa", ["Teknologi Informasi & Komunikasi"]),
          t("Budi Daya", ["Ternak Kesayangan"]),
          t("Pengolahan", ["Serealia & Umbi"])
        ])
      ],
      9: [
        s("Pendidikan Agama Islam & Budi Pekerti", [
          t("Al-Qur'an & Hadis", ["Tajwid (Qalqalah)", "Hafalan"]),
          t("Akidah", ["Iman kepada Hari Akhir", "Qada & Qadar"]),
          t("Akhlak", ["Jujur & Menepati Janji"]),
          t("Fikih", ["Zakat", "Haji & Umrah", "Kurban & Akikah"]),
          t("Sejarah Kebudayaan Islam", ["Islam di Nusantara"])
        ]),
        s("Pendidikan Pancasila", [
          t("Dinamika Pancasila", ["Penerapan dari Masa ke Masa"]),
          t("Pokok Pikiran UUD 1945", ["Pembukaan UUD"]),
          t("Kedaulatan Rakyat", ["Demokrasi"]),
          t("Bela Negara", ["Upaya Bela Negara"]),
          t("Persatuan dalam Keberagaman", ["Harmoni Sosial"])
        ]),
        s("Bahasa Indonesia", [
          t("Laporan Percobaan", ["Struktur"]),
          t("Pidato Persuasif", ["Struktur Pidato"]),
          t("Cerpen", ["Unsur Intrinsik"]),
          t("Teks Tanggapan", ["Kritik & Pujian"]),
          t("Teks Diskusi", ["Argumen Pro & Kontra"]),
          t("Cerita Inspiratif", ["Amanat"])
        ]),
        s("Matematika", [
          t("Bilangan Berpangkat & Akar", ["Pangkat & Akar"]),
          t("Persamaan Kuadrat", ["Akar Persamaan"]),
          t("Fungsi Kuadrat", ["Grafik Parabola"]),
          t("Transformasi Geometri", ["Translasi, Refleksi, Rotasi, Dilatasi"]),
          t("Kesebangunan & Kekongruenan", ["Bangun Datar"]),
          t("Bangun Ruang Sisi Lengkung", ["Tabung, Kerucut, Bola"])
        ]),
        s("IPA", [
          t("Sistem Reproduksi", ["Manusia & Tumbuhan"]),
          t("Kemagnetan", ["Induksi Elektromagnetik"]),
          t("Listrik", ["Rangkaian & Hukum Ohm"]),
          t("Pewarisan Sifat", ["Genetika (Mendel)"]),
          t("Bioteknologi", ["Konvensional & Modern"]),
          t("Partikel Materi", ["Atom, Ion, Molekul"]),
          t("Tanah & Kehidupan", ["Peran Tanah"])
        ]),
        s("IPS", [
          t("Interaksi Antarbenua", ["Kondisi Benua"]),
          t("Perubahan Sosial Budaya", ["Globalisasi"]),
          t("Ekonomi Kreatif", ["Perdagangan Internasional"]),
          t("Kemerdekaan Indonesia", ["Proklamasi & Perjuangan"]),
          t("Indonesia Pascakemerdekaan", ["Orde Lama sampai Reformasi"])
        ]),
        s("Bahasa Inggris", [
          t("Hope & Wish", ["Congratulations"]),
          t("Agreement & Disagreement", ["Opinion"]),
          t("Procedure Text", ["How to & Recipe"]),
          t("Report Text", ["General Facts"]),
          t("Passive Voice", ["Simple Passive"]),
          t("Narrative Text", ["Fable & Legend"])
        ]),
        s("Informatika", [
          t("Berpikir Komputasional", ["Struktur Data Sederhana"]),
          t("Pemrograman", ["Dasar Koding"]),
          t("Analisis Data", ["Visualisasi Data"]),
          t("Jaringan", ["Keamanan Data"]),
          t("Proyek Informatika", ["Rekayasa Sederhana"])
        ]),
        s("Seni Budaya", [
          t("Seni Rupa", ["Seni Lukis & Patung"]),
          t("Seni Musik", ["Musik Modern"]),
          t("Seni Tari", ["Tari Kreasi"]),
          t("Seni Teater", ["Pergelaran"])
        ]),
        s("PJOK", [
          t("Permainan Bola Besar", ["Taktik & Strategi"]),
          t("Atletik", ["Lari Estafet"]),
          t("Beladiri", ["Variasi Teknik"]),
          t("Kebugaran Jasmani", ["Program Latihan"]),
          t("Renang", ["Gaya Dada"])
        ]),
        s("Prakarya", [
          t("Kerajinan", ["Bahan Keras"]),
          t("Rekayasa", ["Instalasi Listrik Sederhana"]),
          t("Budi Daya", ["Ikan Konsumsi"]),
          t("Pengolahan", ["Hasil Peternakan & Perikanan"])
        ])
      ]
    },

    /* ===================== SMA ===================== */
    SMA: {
      10: [
        s("Pendidikan Agama Islam & Budi Pekerti", [
          t("Al-Qur'an & Hadis", ["Kontrol Diri, Prasangka Baik, Ukhuwah"]),
          t("Akidah", ["Syu'abul Iman (Cabang Iman)"]),
          t("Akhlak", ["Menghindari Akhlak Mazmumah"]),
          t("Fikih", ["Muamalah", "Perbankan Syariah"]),
          t("Sejarah Peradaban Islam", ["Islam Masa Modern"])
        ]),
        s("Pendidikan Pancasila", [
          t("Pancasila", ["Kedudukan & Fungsi"]),
          t("UUD NRI 1945", ["Hak & Kewajiban Konstitusional"]),
          t("Bhinneka Tunggal Ika", ["Identitas Nasional"]),
          t("NKRI", ["Kedaulatan Negara"]),
          t("Demokrasi", ["Sistem Politik"])
        ]),
        s("Bahasa Indonesia", [
          t("Laporan Hasil Observasi", ["Struktur & Kaidah"]),
          t("Teks Eksposisi", ["Argumentasi"]),
          t("Teks Anekdot", ["Humor & Kritik"]),
          t("Hikayat", ["Nilai & Karakteristik"]),
          t("Teks Negosiasi", ["Struktur"]),
          t("Teks Biografi", ["Keteladanan"])
        ]),
        s("Matematika", [
          t("Eksponen & Logaritma", ["Sifat Eksponen", "Logaritma"]),
          t("Barisan & Deret", ["Aritmetika", "Geometri"]),
          t("Vektor", ["Operasi Vektor"]),
          t("Trigonometri", ["Perbandingan Trigonometri"]),
          t("Sistem Persamaan Linear", ["SPLTV"]),
          t("Statistika", ["Ukuran Pemusatan & Penyebaran"]),
          t("Peluang", ["Kejadian Majemuk"])
        ]),
        s("Bahasa Inggris", [
          t("Self & Others", ["Descriptive"]),
          t("Recount", ["Personal Experience"]),
          t("Narrative", ["Legend"]),
          t("Procedure", ["Manual & Tips"]),
          t("Report", ["Scientific Facts"]),
          t("Analytical Exposition", ["Argument"])
        ]),
        s("Fisika", [
          t("Besaran & Pengukuran", ["Angka Penting", "Vektor"]),
          t("Kinematika", ["GLB & GLBB"]),
          t("Dinamika", ["Hukum Newton"]),
          t("Usaha & Energi", ["Energi Kinetik & Potensial"]),
          t("Suhu & Kalor", ["Perpindahan Kalor"]),
          t("Gelombang & Bunyi", ["Sifat Gelombang"])
        ]),
        s("Kimia", [
          t("Struktur Atom", ["Konfigurasi Elektron"]),
          t("Sistem Periodik", ["Sifat Periodik"]),
          t("Ikatan Kimia", ["Ion & Kovalen"]),
          t("Stoikiometri", ["Mol & Persamaan Reaksi"]),
          t("Larutan", ["Asam Basa"]),
          t("Hidrokarbon", ["Senyawa Karbon"])
        ]),
        s("Biologi", [
          t("Ruang Lingkup Biologi", ["Metode Ilmiah"]),
          t("Keanekaragaman Hayati", ["Tingkat Keanekaragaman"]),
          t("Klasifikasi Makhluk Hidup", ["Kingdom"]),
          t("Virus", ["Ciri & Peran"]),
          t("Bakteri (Monera)", ["Peran Bakteri"]),
          t("Ekosistem", ["Aliran Energi & Daur"])
        ]),
        s("Sejarah", [
          t("Konsep Dasar Sejarah", ["Ruang & Waktu"]),
          t("Manusia Praaksara", ["Kehidupan Awal"]),
          t("Hindu-Buddha di Indonesia", ["Kerajaan"]),
          t("Kerajaan Islam", ["Perkembangan Islam"]),
          t("Penjelajahan Samudra", ["Kolonialisme"])
        ]),
        s("Ekonomi", [
          t("Konsep Ekonomi", ["Kelangkaan & Kebutuhan"]),
          t("Permintaan & Penawaran", ["Harga Keseimbangan"]),
          t("Pasar", ["Struktur Pasar"]),
          t("Bank & Lembaga Keuangan", ["OJK"]),
          t("Sistem Pembayaran", ["Uang & Alat Pembayaran"])
        ]),
        s("Geografi", [
          t("Pengetahuan Dasar Geografi", ["Konsep & Prinsip"]),
          t("Peta & Penginderaan Jauh", ["SIG"]),
          t("Dinamika Litosfer", ["Tenaga Geologi"]),
          t("Dinamika Atmosfer", ["Cuaca & Iklim"]),
          t("Dinamika Hidrosfer", ["Perairan"])
        ]),
        s("Sosiologi", [
          t("Fungsi Sosiologi", ["Objek Kajian"]),
          t("Individu & Kelompok", ["Interaksi Sosial"]),
          t("Nilai & Norma", ["Sosialisasi"]),
          t("Ragam Gejala Sosial", ["Masyarakat"]),
          t("Penelitian Sosial", ["Metode"])
        ]),
        s("Informatika", [
          t("Berpikir Komputasional", ["Algoritma"]),
          t("Sistem Komputer", ["Perangkat & Sistem Operasi"]),
          t("Jaringan & Internet", ["Keamanan Data"]),
          t("Analisis Data", ["Spreadsheet & Visualisasi"]),
          t("Pemrograman", ["Dasar Pemrograman"])
        ]),
        s("PJOK", [
          t("Permainan Bola Besar", ["Sepak Bola, Voli, Basket"]),
          t("Permainan Bola Kecil", ["Bulu Tangkis, Tenis Meja"]),
          t("Atletik", ["Lari, Lompat, Lempar"]),
          t("Beladiri", ["Pencak Silat"]),
          t("Kebugaran Jasmani", ["Komponen Kebugaran"])
        ]),
        s("Seni Budaya", [
          t("Seni Rupa", ["Seni Rupa 2D & 3D"]),
          t("Seni Musik", ["Musik Kreasi"]),
          t("Seni Tari", ["Tari Kreasi"]),
          t("Seni Teater", ["Pementasan"])
        ])
      ],
      11: [
        s("Pendidikan Agama Islam & Budi Pekerti", [
          t("Al-Qur'an & Hadis", ["Toleransi & Memelihara Kehidupan"]),
          t("Akidah", ["Sifat Wajib Allah"]),
          t("Akhlak", ["Menghindari Pergaulan Bebas"]),
          t("Fikih", ["Mawaris (Waris)", "Ekonomi Islam"]),
          t("Sejarah Kebudayaan Islam", ["Tokoh Pembaru Islam"])
        ]),
        s("Pendidikan Pancasila", [
          t("Hak & Kewajiban", ["HAM"]),
          t("Sistem Hukum & Peradilan", ["Lembaga Peradilan"]),
          t("Ancaman terhadap NKRI", ["Integrasi Nasional"]),
          t("Hubungan Internasional", ["Peran Indonesia"]),
          t("Demokrasi Pancasila", ["Budaya Politik"])
        ]),
        s("Bahasa Indonesia", [
          t("Teks Prosedur", ["Prosedur Kompleks"]),
          t("Teks Eksplanasi", ["Fenomena"]),
          t("Ceramah", ["Struktur"]),
          t("Cerpen", ["Unsur & Nilai"]),
          t("Proposal", ["Karya Ilmiah"]),
          t("Resensi", ["Ulasan Buku"])
        ]),
        s("Matematika", [
          t("Komposisi & Fungsi Invers", ["Fungsi"]),
          t("Lingkaran", ["Persamaan Lingkaran"]),
          t("Polinomial", ["Suku Banyak"]),
          t("Limit Fungsi", ["Limit Aljabar"]),
          t("Turunan", ["Aturan Turunan"]),
          t("Statistika", ["Distribusi Data"])
        ]),
        s("Bahasa Inggris", [
          t("Suggestion & Offer", ["Expressions"]),
          t("Opinion & Thought", ["Argument"]),
          t("Explanation Text", ["Natural Phenomena"]),
          t("Analytical Exposition", ["Thesis & Argument"]),
          t("Hortatory Exposition", ["Recommendation"]),
          t("Formal Letter", ["Application Letter"])
        ]),
        s("Sejarah", [
          t("Kolonialisme & Pergerakan", ["Pergerakan Nasional"]),
          t("Pendudukan Jepang", ["Dampak"]),
          t("Proklamasi Kemerdekaan", ["Peristiwa Sekitar Proklamasi"]),
          t("Mempertahankan Kemerdekaan", ["Diplomasi & Konflik"]),
          t("Demokrasi Liberal & Terpimpin", ["Politik 1945-1965"])
        ]),
        s("Fisika", [
          t("Keseimbangan Benda Tegar", ["Torsi & Momen"]),
          t("Elastisitas & Hukum Hooke", ["Pegas"]),
          t("Fluida", ["Statis & Dinamis"]),
          t("Teori Kinetik Gas", ["Gas Ideal"]),
          t("Termodinamika", ["Hukum Termodinamika"]),
          t("Gelombang Mekanik", ["Gelombang Berjalan"])
        ]),
        s("Kimia", [
          t("Termokimia", ["Entalpi Reaksi"]),
          t("Laju Reaksi", ["Faktor Laju"]),
          t("Kesetimbangan Kimia", ["Pergeseran Kesetimbangan"]),
          t("Asam Basa", ["pH Larutan"]),
          t("Larutan Penyangga", ["Buffer"]),
          t("Kelarutan (Ksp)", ["Hasil Kali Kelarutan"])
        ]),
        s("Biologi", [
          t("Sel", ["Struktur & Fungsi"]),
          t("Jaringan", ["Tumbuhan & Hewan"]),
          t("Sistem Gerak", ["Tulang & Otot"]),
          t("Sistem Peredaran Darah", ["Organ"]),
          t("Sistem Pencernaan", ["Organ & Enzim"]),
          t("Sistem Pernapasan & Ekskresi", ["Organ"])
        ]),
        s("Ekonomi", [
          t("Pendapatan Nasional", ["GDP & GNP"]),
          t("Pertumbuhan & Pembangunan", ["Indikator"]),
          t("Ketenagakerjaan", ["Pengangguran"]),
          t("Indeks Harga & Inflasi", ["Inflasi"]),
          t("Kebijakan Moneter & Fiskal", ["Instrumen"]),
          t("APBN & APBD", ["Anggaran Negara"])
        ]),
        s("Sosiologi", [
          t("Kelompok Sosial", ["Jenis Kelompok"]),
          t("Permasalahan Sosial", ["Kemiskinan & Kriminalitas"]),
          t("Kesetaraan Sosial", ["Diferensiasi & Stratifikasi"]),
          t("Konflik & Integrasi", ["Resolusi Konflik"])
        ]),
        s("Geografi", [
          t("Biosfer", ["Flora & Fauna"]),
          t("Antroposfer", ["Dinamika Penduduk"]),
          t("Sumber Daya Alam", ["Pengelolaan SDA"]),
          t("Ketahanan Pangan", ["Industri & Energi"]),
          t("Mitigasi Bencana", ["Kebencanaan"])
        ]),
        s("Informatika", [
          t("Analisis Data", ["Pengolahan Data"]),
          t("Algoritma & Pemrograman", ["Struktur Kontrol"]),
          t("Jaringan Komputer", ["Internet & Protokol"]),
          t("Dampak Sosial Informatika", ["Etika & HKI"])
        ]),
        s("PJOK", [
          t("Permainan Bola Besar", ["Taktik & Strategi"]),
          t("Atletik", ["Nomor Lari & Lompat"]),
          t("Beladiri", ["Pencak Silat"]),
          t("Kebugaran Jasmani", ["Latihan & Pengukuran"]),
          t("Senam", ["Senam Lantai & Irama"])
        ]),
        s("Seni Budaya", [
          t("Seni Rupa", ["Kritik Seni"]),
          t("Seni Musik", ["Musik Kreasi"]),
          t("Seni Tari", ["Manajemen Pergelaran"]),
          t("Seni Teater", ["Produksi Teater"])
        ])
      ],
      12: [
        s("Pendidikan Agama Islam & Budi Pekerti", [
          t("Al-Qur'an & Hadis", ["Berpikir Kritis & Demokrasi"]),
          t("Akidah", ["Iman kepada Qada & Qadar"]),
          t("Akhlak", ["Etos Kerja & Tanggung Jawab"]),
          t("Fikih", ["Pernikahan dalam Islam"]),
          t("Sejarah Kebudayaan Islam", ["Islam di Dunia"])
        ]),
        s("Pendidikan Pancasila", [
          t("Pancasila sebagai Ideologi Terbuka", ["Nilai Pancasila"]),
          t("Hak Asasi Manusia", ["Penegakan HAM"]),
          t("Sistem Pemerintahan", ["Pusat & Daerah"]),
          t("Peran Indonesia di Dunia", ["PBB & ASEAN"]),
          t("Iptek & Kemajuan Bangsa", ["Dampak Iptek"])
        ]),
        s("Bahasa Indonesia", [
          t("Surat Lamaran Pekerjaan", ["Struktur"]),
          t("Teks Cerita Sejarah", ["Novel Sejarah"]),
          t("Teks Editorial", ["Opini & Fakta"]),
          t("Novel", ["Unsur Intrinsik & Ekstrinsik"]),
          t("Artikel", ["Opini"]),
          t("Kritik & Esai", ["Ciri"])
        ]),
        s("Matematika", [
          t("Integral", ["Integral Tak Tentu & Tentu"]),
          t("Dimensi Tiga", ["Jarak & Sudut"]),
          t("Statistika Inferensia", ["Distribusi Normal"]),
          t("Limit & Kekontinuan", ["Limit Fungsi"]),
          t("Peluang", ["Distribusi Peluang"])
        ]),
        s("Bahasa Inggris", [
          t("Application Letter", ["Job Application"]),
          t("Caption Text", ["Photos & Events"]),
          t("News Item", ["Headline & Facts"]),
          t("Discussion Text", ["Pros & Cons"]),
          t("Review Text", ["Movie & Book"]),
          t("Song", ["Meaning & Message"])
        ]),
        s("Sejarah", [
          t("Mempertahankan Kemerdekaan", ["Agresi Militer"]),
          t("Demokrasi Terpimpin", ["Politik & Ekonomi"]),
          t("Orde Baru", ["Kebijakan & Dampak"]),
          t("Reformasi", ["Lahirnya Reformasi"]),
          t("Indonesia Kontemporer", ["Peran Internasional"])
        ]),
        s("Fisika", [
          t("Listrik Statis", ["Hukum Coulomb"]),
          t("Listrik Dinamis", ["Rangkaian Arus Searah"]),
          t("Medan Magnet", ["Induksi Magnetik"]),
          t("Induksi Elektromagnetik", ["GGL Induksi"]),
          t("Fisika Modern", ["Relativitas & Kuantum"]),
          t("Fisika Inti", ["Radioaktivitas"])
        ]),
        s("Kimia", [
          t("Sifat Koligatif Larutan", ["Penurunan Titik Beku"]),
          t("Redoks & Elektrokimia", ["Sel Volta & Elektrolisis"]),
          t("Kimia Unsur", ["Golongan Unsur"]),
          t("Senyawa Karbon", ["Gugus Fungsi"]),
          t("Benzena & Turunannya", ["Struktur"]),
          t("Makromolekul", ["Polimer, Karbohidrat, Protein"])
        ]),
        s("Biologi", [
          t("Pertumbuhan & Perkembangan", ["Faktor"]),
          t("Metabolisme", ["Enzim, Respirasi, Fotosintesis"]),
          t("Materi Genetik", ["DNA, RNA, Kromosom"]),
          t("Pembelahan Sel", ["Mitosis & Meiosis"]),
          t("Pola Hereditas", ["Hukum Mendel"]),
          t("Evolusi & Bioteknologi", ["Teori Evolusi"])
        ]),
        s("Ekonomi", [
          t("Akuntansi", ["Persamaan Dasar Akuntansi"]),
          t("Siklus Akuntansi", ["Jurnal & Buku Besar"]),
          t("Laporan Keuangan", ["Neraca & Laba Rugi"]),
          t("Manajemen", ["Fungsi Manajemen"]),
          t("Badan Usaha & Koperasi", ["BUMN, BUMS, Koperasi"]),
          t("Perdagangan Internasional", ["Ekspor Impor"])
        ]),
        s("Sosiologi", [
          t("Perubahan Sosial", ["Faktor & Dampak"]),
          t("Globalisasi", ["Dampak Globalisasi"]),
          t("Ketimpangan Sosial", ["Penyebab"]),
          t("Pemberdayaan Komunitas", ["Kearifan Lokal"]),
          t("Penelitian Sosial", ["Laporan Penelitian"])
        ]),
        s("Geografi", [
          t("Wilayah & Tata Ruang", ["Perwilayahan"]),
          t("Interaksi Desa-Kota", ["Pola Keruangan"]),
          t("Negara Maju & Berkembang", ["Karakteristik"]),
          t("Kerja Sama Regional & Global", ["Kemitraan"]),
          t("SIG untuk Pembangunan", ["Aplikasi SIG"])
        ]),
        s("Informatika", [
          t("Pemrograman Lanjut", ["Fungsi & Modularisasi"]),
          t("Analisis Data", ["Big Data & Visualisasi"]),
          t("Jaringan & Keamanan", ["Kriptografi Dasar"]),
          t("Proyek Informatika", ["Rekayasa Perangkat Lunak"])
        ]),
        s("PJOK", [
          t("Permainan Bola Besar", ["Pola Penyerangan & Pertahanan"]),
          t("Atletik", ["Nomor Lempar"]),
          t("Beladiri", ["Variasi Teknik"]),
          t("Kebugaran Jasmani", ["Program Latihan"]),
          t("Kesehatan", ["Pola Hidup Sehat & Napza"])
        ]),
        s("Seni Budaya", [
          t("Seni Rupa", ["Pameran Karya"]),
          t("Seni Musik", ["Pergelaran Musik"]),
          t("Seni Tari", ["Evaluasi Karya Tari"]),
          t("Seni Teater", ["Pementasan Teater"])
        ])
      ]
    }
  };
})();
