# BAB III
PEMBAHASAN

## 3.1 Definisi Materi yang Digunakan dalam Pelaksanaan Kerja Praktik

Dalam pelaksanaan kerja praktik yang berfokus pada pengembangan Document Management System (DMS) berbasis Cloud di PT Pelayaran Nasional Indonesia (Persero), berbagai teknologi dan konsep pendukung digunakan untuk membangun sistem yang fungsional, terstruktur, dan sesuai dengan kebutuhan perusahaan. Materi tersebut menjadi dasar dalam proses perancangan, implementasi, dan pengujian sistem. Oleh karena itu, pada subbab ini dijelaskan definisi dan konsep dasar dari materi yang digunakan selama pelaksanaan kerja praktik.

### 3.1.1 Next.js

Next.js merupakan framework React.js yang dikembangkan oleh Vercel untuk membangun aplikasi web dengan kemampuan Server-Side Rendering (SSR) dan Static Site Generation (SSG). Salah satu keunggulan utama Next.js adalah kemampuannya dalam melakukan pre-rendering halaman di sisi server, yang secara signifikan meningkatkan performa initial load dan optimasi mesin pencari (SEO) dibandingkan dengan Client-Side Rendering (CSR) murni (Saputra & Rahmanto, 2024). Next.js juga mendukung API Routes yang memungkinkan pengembang membangun RESTful API tanpa memerlukan server backend terpisah, sehingga arsitektur pengembangan menjadi lebih sederhana dan terpadu. Dalam konteks DMS Cloud, Next.js digunakan untuk membangun antarmuka pengguna dengan SSR yang cepat serta menyediakan endpoint RESTful API untuk pengelolaan dokumen secara terintegrasi.

### 3.1.2 Redux

Redux adalah library state management yang populer untuk aplikasi JavaScript, dirancang untuk mengelola state global secara terprediksi dan terpusat. Redux terinspirasi oleh arsitektur Flux dan bekerja berdasarkan prinsip single source of truth, di mana seluruh state aplikasi disimpan dalam satu store (Ullummuddien et al., 2024). Redux menggunakan pola reducer untuk memperbarui state secara immutable, sehingga perubahan state dapat dilacak dan di-debug dengan mudah. Dalam pengembangan DMS Cloud yang memiliki kompleksitas state tinggi—mencakup data pengguna, hak akses, metadata dokumen, status versi, dan alur persetujuan—Redux memberikan prediktabilitas dan kemudahan dalam mengelola interaksi antar komponen secara efisien.

### 3.1.3 MySQL

MySQL adalah sistem manajemen basis data relasional (RDBMS) open-source yang banyak digunakan dalam pengembangan aplikasi web. MySQL mendukung bahasa SQL (Structured Query Language) untuk melakukan operasi data seperti CREATE, READ, UPDATE, dan DELETE. MySQL dikenal karena performa tinggi, keandalan, dan kemudahan penggunaannya, serta mendukung berbagai fitur seperti indexing, transactions, dan stored procedures. Dalam DMS Cloud, MySQL digunakan sebagai basis data utama untuk menyimpan data pengguna dengan role masing-masing, metadata dokumen, riwayat versi dokumen, serta data alur persetujuan (approval workflow).

### 3.1.4 Role-Based Access Control (RBAC)

Role-Based Access Control (RBAC) adalah mekanisme pengaturan hak akses pengguna terhadap sumber daya sistem berdasarkan peran (role) yang dimiliki masing-masing pengguna. Konsep dasar RBAC meliputi pengguna (user), peran (role), izin (permission), dan sumber daya (resource). Setiap pengguna diberikan satu atau lebih peran, dan setiap peran memiliki serangkaian izin yang telah ditentukan sebelumnya (Uddin et al., 2019). Dalam DMS Cloud, RBAC diterapkan untuk membedakan hak akses antara tiga peran utama: Admin Dokumen yang memiliki akses penuh, Staf Operasional yang dapat mengunggah dan mencari dokumen, serta Manajer yang memiliki kewenangan persetujuan dokumen.

### 3.1.5 JSON

JSON (JavaScript Object Notation) merupakan format pertukaran data ringan yang mudah dibaca dan ditulis oleh manusia, serta mudah diterjemahkan (parse) dan dibuat (generate) oleh komputer (Pendahuluan, 1978). Format JSON tidak bergantung pada bahasa pemrograman tertentu, sehingga JSON dapat digunakan sebagai bahasa pertukaran data antar layanan dan platform yang berbeda. Dalam implementasi RESTful API DMS Cloud, JSON digunakan sebagai format standar untuk mengirimkan data request dan response antara klien frontend dan server backend melalui endpoint API.

### 3.1.6 Postman

Postman merupakan platform yang digunakan untuk membantu proses pengembangan dan pengujian API. Postman Docs menjelaskan bahwa dokumentasi tersebut berisi informasi resmi mengenai cara menggunakan Postman dalam proyek API, seperti mengirim request, menulis test, mengelompokkan request ke dalam collection, melakukan pengujian API, serta mendesain struktur API (Postman, n.d.). Dalam pelaksanaan kerja praktik ini, Postman digunakan untuk menguji endpoint RESTful API DMS Cloud yang dibangun menggunakan Next.js API Routes. Pengujian dilakukan dengan mengirim request HTTP ke server, memeriksa response yang diterima, serta memastikan setiap endpoint berjalan sesuai kebutuhan fungsional sistem. Chandrika (2023) menjelaskan bahwa Postman menyediakan antarmuka yang intuitif untuk membantu proses validasi respons API, alur kerja, dan performa secara manual maupun otomatis.

### 3.1.7 UML (Unified Modeling Language)

UML (Unified Modeling Language) merupakan bahasa pemodelan visual yang digunakan untuk mendefinisikan dan mendokumentasikan sebuah sistem dalam rekayasa perangkat lunak (Koç et al., 2021). Dalam pengembangan sistem, UML membantu pengembang memahami kebutuhan, alur proses, struktur, dan interaksi antarbagian sistem sebelum tahap implementasi dilakukan. Koç et al. (2021) menjelaskan bahwa UML banyak digunakan dalam penelitian rekayasa perangkat lunak, terutama untuk kebutuhan desain dan pemodelan sistem. Pada kerja praktik ini, UML digunakan untuk menggambarkan rancangan DMS Cloud agar proses pengembangan lebih terarah dan mudah dipahami. Pemodelan UML mencakup use case diagram untuk menggambarkan interaksi aktor dengan sistem, activity diagram untuk alur proses, serta class diagram untuk struktur data yang dibutuhkan.

## 3.2 Hasil dan Output Kerja Praktik

Bagian ini membahas hasil kerja praktik dalam pengembangan Document Management System (DMS) Berbasis Cloud di PT Pelayaran Nasional Indonesia (Persero). Pembahasan mencakup analisis kebutuhan sistem, pemodelan sistem melalui use case diagram, implementasi dan pengujian RESTful API, serta hasil antarmuka sistem yang diperoleh selama proses pengembangan.

### 3.2.1 Analisis Sistem

Analisis sistem dilakukan untuk memahami ruang lingkup kebutuhan dalam pengelolaan dokumen operasional di PT Pelni. Berdasarkan hasil observasi dan wawancara selama pelaksanaan kerja praktik, diidentifikasi bahwa sistem memiliki tiga kelompok pengguna utama, yaitu Admin Dokumen, Staf Operasional, dan Manajer, dengan pembagian peran yang disesuaikan dengan kewenangan masing-masing. Perbedaan kewenangan pada setiap jenis pengguna menunjukkan bahwa sistem perlu menerapkan mekanisme Role-Based Access Control (RBAC) agar setiap pengguna hanya dapat mengakses fitur dan data sesuai dengan perannya.

Analisis lebih lanjut mengungkapkan kebutuhan fungsional utama sistem sebagai berikut:
1. Sistem harus memungkinkan pengguna untuk mengunggah dokumen dalam berbagai format (PDF, DOCX, XLSX) beserta metadata seperti judul, kategori, dan deskripsi.
2. Sistem harus menyediakan fitur pencarian dokumen berbasis metadata untuk mempermudah pelacakan arsip.
3. Sistem harus mendukung kontrol versi dokumen sehingga setiap perubahan pada dokumen dapat dilacak dan dikembalikan ke versi sebelumnya jika diperlukan.
4. Sistem harus memiliki alur kerja persetujuan (approval workflow) di mana dokumen yang diunggah oleh Staf Operasional harus mendapat persetujuan dari Manajer sebelum statusnya menjadi final.
5. Sistem harus menerapkan RBAC untuk membedakan hak akses Admin Dokumen, Staf Operasional, dan Manajer.

### 3.2.2 Use Case Diagram

Use case diagram digunakan untuk menggambarkan hubungan antara aktor dan fitur utama pada DMS Cloud PT Pelni. Diagram ini menjelaskan ruang lingkup sistem serta batasan akses yang dimiliki oleh masing-masing aktor. Pada kerja praktik ini, use case diagram mencakup tiga aktor utama, yaitu Admin Dokumen, Staf Operasional, dan Manajer.

**Gambar 3.1 Use Case Diagram DMS Cloud PT Pelni**

Berdasarkan use case diagram pada Gambar 3.1, interaksi masing-masing aktor dengan sistem dijelaskan sebagai berikut.

1. **Admin Dokumen** — memiliki akses penuh terhadap seluruh fitur sistem, meliputi: mengelola pengguna (menambah, mengubah, menghapus akun), mengelola dokumen (mengunggah, melihat, mengubah metadata, menghapus), mengelola kategori dokumen, melihat seluruh dokumen tanpa terkecuali, menyetujui atau menolak dokumen, melihat riwayat versi dokumen, serta mengelola role dan izin pengguna.

2. **Staf Operasional** — dapat mengunggah dokumen baru, mencari dokumen berdasarkan metadata, mengunduh dokumen yang telah disetujui, serta melihat riwayat versi dokumen yang pernah diunggahnya. Staf Operasional tidak dapat menghapus dokumen atau menyetujui dokumen.

3. **Manajer** — dapat melihat seluruh dokumen yang beredar di unit kerjanya, menyetujui atau menolak dokumen yang menunggu persetujuan, serta melihat riwayat versi dan aktivitas dokumen. Manajer tidak dapat mengunggah atau menghapus dokumen.

Berdasarkan use case diagram, terdapat beberapa alur skenario sebagai berikut.

**Tabel 3.1 Skenario Use Case Unggah Dokumen**

| **Staf Operasional** | **Sistem** |
|---|---|
| 1. Staf Operasional memilih menu Unggah Dokumen. | 1. Sistem menampilkan formulir unggah dokumen beserta field metadata (judul, kategori, deskripsi). |
| 2. Staf Operasional memilih file dokumen dari perangkat dan mengisi metadata. | 2. Sistem menerima dan menampilkan informasi file yang dipilih serta data yang dimasukkan. |
| 3. Staf Operasional menekan tombol Unggah. | 3. Sistem memvalidasi format dan ukuran file. Apabila valid, sistem menyimpan dokumen dengan status "Menunggu Persetujuan" dan menampilkan notifikasi bahwa dokumen berhasil diunggah. |

**Tabel 3.2 Skenario Use Case Pencarian Dokumen**

| **Staf Operasional / Admin Dokumen / Manajer** | **Sistem** |
|---|---|
| 1. Pengguna memasukkan kata kunci pada kolom pencarian. | 1. Sistem melakukan pencarian berdasarkan metadata dokumen (judul, kategori, deskripsi) dan menampilkan daftar hasil yang sesuai. |
| 2. Pengguna dapat memfilter hasil berdasarkan kategori, tanggal unggah, atau status dokumen. | 2. Sistem menyaring hasil sesuai filter yang dipilih dan memperbarui tampilan daftar dokumen. |
| 3. Pengguna memilih dokumen untuk melihat detail. | 3. Sistem menampilkan halaman detail dokumen yang mencakup metadata, riwayat versi, dan status persetujuan. |

**Tabel 3.3 Skenario Use Case Approval Workflow**

| **Manajer** | **Sistem** |
|---|---|
| 1. Manajer membuka menu Persetujuan Dokumen. | 1. Sistem menampilkan daftar dokumen yang berstatus "Menunggu Persetujuan". |
| 2. Manajer memilih dokumen yang akan disetujui atau ditolak. | 2. Sistem menampilkan detail dokumen beserta metadata dan riwayat versi. |
| 3. Manajer menekan tombol Setujui atau Tolak. | 3. Sistem menampilkan konfirmasi tindakan. |
| 4. Manajer mengonfirmasi keputusan. | 4. Sistem memperbarui status dokumen menjadi "Disetujui" atau "Ditolak" dan menampilkan notifikasi bahwa tindakan berhasil dilakukan. |

**Tabel 3.4 Skenario Use Case Kontrol Versi Dokumen**

| **Staf Operasional / Admin Dokumen** | **Sistem** |
|---|---|
| 1. Pengguna membuka halaman detail dokumen yang telah diunggah sebelumnya. | 1. Sistem menampilkan detail dokumen beserta daftar versi yang tersedia. |
| 2. Pengguna memilih opsi Unggah Versi Baru. | 2. Sistem menampilkan formulir unggah versi baru. |
| 3. Pengguna memilih file revisi dan mengisi catatan perubahan. | 3. Sistem menyimpan file baru sebagai versi berikutnya, memperbarui timestamp, dan menampilkan notifikasi bahwa versi baru berhasil ditambahkan. |
| 4. Pengguna dapat melihat atau mengunduh versi terdahulu. | 4. Sistem menyediakan tautan unduh untuk setiap versi yang tersimpan. |

**Tabel 3.5 Skenario Use Case Kelola Pengguna (Admin Dokumen)**

| **Admin Dokumen** | **Sistem** |
|---|---|
| 1. Admin Dokumen memilih menu Kelola Pengguna. | 1. Sistem menampilkan daftar seluruh pengguna terdaftar. |
| **Alternatif 1 – Tambah Pengguna** | |
| 1. Admin Dokumen menekan tombol Tambah Pengguna. | 1. Sistem menampilkan formulir pendaftaran pengguna baru. |
| 2. Admin Dokumen mengisi data pengguna dan memilih peran (role). | 2. Sistem menerima data yang dimasukkan. |
| 3. Admin Dokumen menekan tombol Simpan. | 3. Sistem memvalidasi data. Apabila valid, sistem menyimpan pengguna baru dan menampilkan notifikasi bahwa akun berhasil dibuat. |
| **Alternatif 2 – Ubah Peran Pengguna** | |
| 1. Admin Dokumen menekan tombol Edit pada pengguna yang akan diubah perannya. | 1. Sistem menampilkan formulir berisi data pengguna yang dipilih. |
| 2. Admin Dokumen mengubah peran pengguna sesuai kebutuhan. | 2. Sistem menerima perubahan. |
| 3. Admin Dokumen menekan tombol Simpan. | 3. Sistem memperbarui data dan menampilkan notifikasi bahwa peran berhasil diubah. |
| **Alternatif 3 – Nonaktifkan Pengguna** | |
| 1. Admin Dokumen menekan tombol Nonaktifkan pada pengguna. | 1. Sistem menampilkan konfirmasi penonaktifan. |
| 2. Admin Dokumen mengonfirmasi. | 2. Sistem menonaktifkan akun dan menampilkan notifikasi bahwa akun berhasil dinonaktifkan. |

### 3.2.3 Implementasi dan Pengujian RESTful API

Pengujian RESTful API pada DMS Cloud PT Pelni dilakukan menggunakan Postman dengan pendekatan black-box testing. Pengujian ini bertujuan untuk memastikan setiap endpoint yang telah diimplementasikan berfungsi sesuai dengan rancangan dan kebutuhan fungsional sistem. Proses pengujian dilakukan dengan mengirimkan request ke masing-masing endpoint berdasarkan metode HTTP yang digunakan, kemudian memeriksa status code dan body response yang dikembalikan oleh sistem. Seluruh endpoint API dibangun menggunakan Next.js API Routes dan menerapkan autentikasi berbasis JWT (JSON Web Token) serta otorisasi RBAC.

**1. Autentikasi dan Otorisasi**

Fitur autentikasi memungkinkan pengguna untuk login ke sistem dan mendapatkan token akses. Endpoint yang digunakan meliputi:

- **POST /api/auth/login** — Menerima data berupa email dan password, kemudian memvalidasi kredensial pengguna. Apabila valid, sistem mengembalikan token JWT beserta data role pengguna dengan status 200 OK. Apabila kredensial tidak valid, sistem mengembalikan status 401 Unauthorized.

- **POST /api/auth/register** — (Khusus Admin Dokumen) Menerima data berupa nama, email, password, dan role_id. Sistem membuat akun baru dan mengembalikan respons dengan status 201 Created.

**Gambar 3.2 Hasil Pengujian Endpoint Login**

**2. Kelola Dokumen**

Fitur Kelola Dokumen digunakan oleh Staf Operasional dan Admin Dokumen untuk mengunggah, melihat, memperbarui metadata, dan menghapus dokumen. Endpoint yang digunakan meliputi:

- **POST /api/documents** — Mengunggah dokumen baru. Menerima data berupa file (PDF, DOCX, XLSX) serta metadata (judul, kategori, deskripsi). Sistem menyimpan file ke penyimpanan cloud, mencatat metadata ke basis data, dan mengembalikan respons dengan status 201 Created. Dokumen yang diunggah oleh Staf Operasional otomatis berstatus "Menunggu Persetujuan", sedangkan dokumen yang diunggah oleh Admin Dokumen langsung berstatus "Disetujui".

- **GET /api/documents** — Menampilkan daftar dokumen. Admin Dokumen dan Manajer dapat melihat seluruh dokumen, sedangkan Staf Operasional hanya dapat melihat dokumen yang diunggahnya sendiri. Sistem mengembalikan daftar dokumen dalam format pagination dengan status 200 OK.

- **GET /api/documents/[id]** — Menampilkan detail dokumen berdasarkan ID. Sistem mengembalikan metadata dokumen, daftar versi, dan status persetujuan dengan status 200 OK.

- **PUT /api/documents/[id]** — Memperbarui metadata dokumen (judul, kategori, deskripsi). Sistem memvalidasi hak akses: hanya Admin Dokumen atau pemilik dokumen yang dapat mengubah metadata. Sistem mengembalikan pesan bahwa data berhasil diperbarui dengan status 200 OK.

- **DELETE /api/documents/[id]** — Menghapus dokumen (hanya Admin Dokumen). Sistem menghapus file dari penyimpanan dan data dari basis data, kemudian mengembalikan pesan bahwa dokumen berhasil dihapus dengan status 200 OK.

**Gambar 3.3 Hasil Pengujian Endpoint Tambah Dokumen**

**Gambar 3.4 Hasil Pengujian Endpoint Daftar Dokumen**

**Gambar 3.5 Hasil Pengujian Endpoint Detail Dokumen**

**Gambar 3.6 Hasil Pengujian Endpoint Hapus Dokumen**

**3. Kontrol Versi Dokumen**

Fitur Kontrol Versi Dokumen memungkinkan pengguna untuk mengunggah versi baru dari dokumen yang sudah ada serta melihat riwayat versi. Endpoint yang digunakan meliputi:

- **POST /api/documents/[id]/versions** — Mengunggah versi baru dokumen. Menerima data berupa file revisi dan catatan perubahan. Sistem menyimpan versi baru dengan nomor versi inkremental dan mengembalikan respons dengan status 201 Created.

- **GET /api/documents/[id]/versions** — Menampilkan daftar seluruh versi dokumen. Sistem mengembalikan array versi yang mencakup nomor versi, tanggal unggah, pengunggah, catatan perubahan, dan tautan unduh dengan status 200 OK.

**Gambar 3.7 Hasil Pengujian Endpoint Tambah Versi Dokumen**

**Gambar 3.8 Hasil Pengujian Endpoint Riwayat Versi Dokumen**

**4. Approval Workflow**

Fitur Approval Workflow digunakan oleh Manajer dan Admin Dokumen untuk menyetujui atau menolak dokumen yang menunggu persetujuan. Endpoint yang digunakan meliputi:

- **PUT /api/documents/[id]/approve** — Menyetujui dokumen (Manajer atau Admin Dokumen). Sistem mengubah status dokumen menjadi "Disetujui", mencatat timestamp dan pengguna yang menyetujui, kemudian mengembalikan pesan bahwa dokumen berhasil disetujui dengan status 200 OK.

- **PUT /api/documents/[id]/reject** — Menolak dokumen. Sistem mengubah status menjadi "Ditolak" dan mengembalikan pesan bahwa dokumen berhasil ditolak dengan status 200 OK.

**Gambar 3.9 Hasil Pengujian Endpoint Approve Dokumen**

**Gambar 3.10 Hasil Pengujian Endpoint Reject Dokumen**

**5. Pencarian Dokumen**

Fitur pencarian dokumen memungkinkan semua pengguna untuk mencari dokumen berdasarkan metadata. Endpoint yang digunakan meliputi:

- **GET /api/documents/search?q=[keyword]** — Mencari dokumen berdasarkan judul, kategori, atau deskripsi. Sistem melakukan pencarian full-text dan mengembalikan daftar dokumen yang relevan dengan status 200 OK. Hasil pencarian dibatasi sesuai hak akses pengguna (Staf Operasional hanya melihat dokumennya sendiri).

**Gambar 3.11 Hasil Pengujian Endpoint Pencarian Dokumen**

**6. Kelola Pengguna (Admin Dokumen)**

Fitur Kelola Pengguna hanya dapat diakses oleh Admin Dokumen untuk mengelola akun pengguna sistem. Endpoint yang digunakan meliputi:

- **GET /api/users** — Menampilkan daftar seluruh pengguna. Sistem mengembalikan data pengguna beserta role masing-masing dengan status 200 OK.

- **POST /api/users** — Menambahkan pengguna baru. Menerima data berupa nama, email, password, dan role_id. Sistem menyimpan pengguna baru dan mengembalikan respons dengan status 201 Created.

- **PUT /api/users/[id]** — Memperbarui data pengguna. Sistem memvalidasi dan memperbarui data, kemudian mengembalikan pesan bahwa data berhasil diperbarui dengan status 200 OK.

- **DELETE /api/users/[id]** — Menonaktifkan atau menghapus pengguna. Sistem mengembalikan pesan bahwa pengguna berhasil dinonaktifkan dengan status 200 OK.

**Gambar 3.12 Hasil Pengujian Endpoint Daftar Pengguna**

**Gambar 3.13 Hasil Pengujian Endpoint Tambah Pengguna**

### 3.2.4 Hasil Antarmuka

Bagian ini menampilkan hasil antarmuka (user interface) dari DMS Cloud PT Pelni yang telah diimplementasikan sesuai dengan rancangan use case pada subbab sebelumnya. Antarmuka disajikan berdasarkan tiga aktor utama, yaitu Admin Dokumen, Staf Operasional, dan Manajer, sehingga pembaca dapat memahami bagaimana masing-masing aktor berinteraksi dengan sistem.

**1. Halaman Login**

Halaman Login merupakan gerbang awal sebelum pengguna dapat mengakses sistem. Pengguna memasukkan email dan password yang terdaftar, kemudian sistem memvalidasi kredensial dan mengarahkan pengguna ke dashboard sesuai dengan role masing-masing. Halaman ini juga menyediakan opsi "Ingat Saya" untuk menyimpan sesi login.

**Gambar 3.14 Halaman Login DMS Cloud PT Pelni**

**2. Dashboard Utama**

Setelah login, sistem menampilkan Dashboard Utama yang berisi ringkasan statistik dokumen, termasuk jumlah total dokumen, jumlah dokumen menunggu persetujuan, dokumen yang disetujui, dan dokumen yang ditolak. Dashboard juga menampilkan grafik aktivitas pengunggahan dokumen dalam periode waktu tertentu serta notifikasi terkini.

**Gambar 3.15 Halaman Dashboard Admin Dokumen**

**3. Halaman Daftar Dokumen (Staf Operasional)**

Halaman Daftar Dokumen menampilkan seluruh dokumen yang telah diunggah oleh Staf Operasional yang bersangkutan. Setiap baris dokumen menampilkan judul, kategori, status persetujuan, tanggal unggah, dan jumlah versi. Staf Operasional dapat mengunggah dokumen baru melalui tombol Unggah Dokumen, mengunduh dokumen yang telah disetujui, serta mengunggah versi baru dari dokumen yang sudah ada.

**Gambar 3.16 Halaman Daftar Dokumen Staf Operasional**

**4. Halaman Persetujuan Dokumen (Manajer)**

Halaman Persetujuan Dokumen menampilkan seluruh dokumen yang berstatus "Menunggu Persetujuan" dari staf operasional di unit kerjanya. Setiap baris dilengkapi tombol Setujui dan Tolak. Manajer dapat melihat detail dokumen sebelum mengambil keputusan, termasuk metadata dan riwayat versi. Dokumen yang telah diproses akan dipindahkan ke tab Riwayat Persetujuan.

**Gambar 3.17 Halaman Persetujuan Dokumen pada Manajer**

**Gambar 3.18 Halaman Detail Dokumen pada Manajer**

**5. Halaman Kelola Pengguna (Admin Dokumen)**

Halaman Kelola Pengguna hanya dapat diakses oleh Admin Dokumen. Halaman ini menampilkan daftar seluruh pengguna beserta role dan status akun. Admin Dokumen dapat menambahkan pengguna baru melalui tombol Tambah Pengguna, mengubah role atau data pengguna melalui tombol Edit, serta menonaktifkan akun melalui tombol Nonaktifkan.

**Gambar 3.19 Halaman Kelola Pengguna pada Admin Dokumen**

**6. Halaman Detail Dokumen dengan Riwayat Versi**

Halaman Detail Dokumen menampilkan informasi lengkap suatu dokumen, termasuk metadata, status persetujuan, dan riwayat versi. Setiap versi menampilkan nomor versi, tanggal unggah, pengunggah, catatan perubahan, dan tautan unduh. Pengguna dapat mengunduh versi tertentu atau mengunggah versi baru melalui halaman ini.

**Gambar 3.20 Halaman Detail Dokumen dengan Riwayat Versi**

## 3.3 Relevansi Mata Kuliah dengan Kerja Praktik

Pelaksanaan kerja praktik di PT Pelayaran Nasional Indonesia (Persero) Cabang Semarang memberikan kesempatan bagi mahasiswa untuk menerapkan pengetahuan yang diperoleh selama perkuliahan secara langsung di lingkungan kerja perusahaan pelayaran nasional. Terdapat beberapa mata kuliah yang memiliki keterkaitan dengan proyek yang dikerjakan selama kerja praktik, sebagaimana disajikan pada Tabel 3.6.

**Tabel 3.6 Relevansi Mata Kuliah dengan Kerja Praktik**

| **Mata Kuliah** | **Kegiatan Kerja Praktik** | **Luaran** |
|---|---|---|
| Pemrograman Web | Pengembangan antarmuka pengguna DMS Cloud menggunakan Next.js dengan Server-Side Rendering (SSR) dan React components. | Laporan Kerja Praktik |
| Basis Data | Perancangan skema basis data MySQL untuk menyimpan data pengguna, metadata dokumen, riwayat versi, dan alur persetujuan. | Laporan Kerja Praktik |
| Rekayasa Perangkat Lunak | Perancangan sistem menggunakan UML (use case diagram, activity diagram, class diagram) dan penerapan metodologi pengembangan perangkat lunak terstruktur. | Laporan Kerja Praktik |
| Sistem Informasi | Analisis kebutuhan sistem informasi manajemen dokumen di lingkungan perusahaan pelayaran serta perancangan solusi digitalisasi arsip yang terintegrasi. | Laporan Kerja Praktik |
| Keamanan Data dan Sistem Informasi | Implementasi autentikasi berbasis JWT (JSON Web Token), penerapan Role-Based Access Control (RBAC) untuk membatasi akses endpoint sesuai peran pengguna, serta enkripsi data dokumen di penyimpanan cloud. | Laporan Kerja Praktik |
| Sistem Terdistribusi | Pengembangan sistem multi-pengguna dengan tiga role berbeda (Admin Dokumen, Staf Operasional, Manajer) serta integrasi antara frontend Next.js dengan backend API melalui endpoint RESTful. | Laporan Kerja Praktik |
| Interaksi Manusia dan Komputer | Perancangan antarmuka pengguna yang intuitif dan responsif untuk memudahkan interaksi pengguna dengan sistem manajemen dokumen. | Laporan Kerja Praktik |

# BAB IV
PENUTUP

## 4.1 Kesimpulan

Berdasarkan hasil implementasi dan pengujian yang telah dilakukan pada kerja praktik ini, dapat ditarik kesimpulan sebagai berikut.

1. Implementasi Document Management System (DMS) Berbasis Cloud menggunakan Next.js dengan Server-Side Rendering (SSR) berhasil dibangun untuk menjawab kebutuhan digitalisasi dokumen operasional di PT Pelayaran Nasional Indonesia (Persero). Sistem ini menggantikan pengelolaan dokumen konvensional yang sebelumnya rentan terhadap risiko kerusakan fisik, keterlambatan distribusi informasi, dan kesulitan pelacakan data.

2. Penerapan Redux sebagai state management berhasil menangani kompleksitas state aplikasi yang mencakup data pengguna, metadata dokumen, hak akses, status versi, dan alur persetujuan secara real-time. Arsitektur Redux dengan single source of truth dan pola reducer memberikan prediktabilitas dalam pengelolaan state di seluruh komponen aplikasi.

3. Mekanisme Role-Based Access Control (RBAC) berhasil diimplementasikan untuk membedakan hak akses antara tiga peran pengguna, yaitu Admin Dokumen (akses penuh), Staf Operasional (unggah dan pencarian dokumen), dan Manajer (persetujuan dokumen). Setiap endpoint API hanya dapat diakses oleh pengguna dengan role yang sesuai, sehingga keamanan data dokumen terjaga.

4. Implementasi RESTful API menggunakan Next.js API Routes mencakup seluruh fitur utama sistem, meliputi autentikasi dan otorisasi pengguna, pengelolaan dokumen (unggah, lihat, ubah, hapus), kontrol versi dokumen, pencarian berbasis metadata, approval workflow, serta pengelolaan pengguna oleh Admin Dokumen.

5. Pengujian fungsional menggunakan Postman dilakukan terhadap seluruh endpoint yang diimplementasikan. Hasil pengujian menunjukkan bahwa seluruh skenario menghasilkan response sesuai kebutuhan fungsional, meliputi autentikasi, otorisasi RBAC, pengelolaan data dokumen, kontrol versi, alur persetujuan, dan pencarian berbasis metadata. Dengan demikian, DMS Cloud PT Pelni telah berjalan sesuai ruang lingkup pengujian yang ditetapkan.

## 4.2 Saran

Berdasarkan hasil kerja praktik yang telah dilaksanakan, terdapat beberapa saran yang dapat dijadikan bahan pertimbangan untuk pengembangan DMS Cloud PT Pelni lebih lanjut.

1. **Implementasi OCR untuk Ekstraksi Teks Otomatis**

Sistem disarankan dilengkapi dengan fitur Optical Character Recognition (OCR) untuk mengekstraksi teks dari dokumen hasil pindaian (scan) secara otomatis. Fitur ini dapat meningkatkan kemampuan pencarian dokumen karena teks dalam dokumen PDF hasil scan dapat diindeks dan dicari, tidak hanya terbatas pada metadata yang diisi secara manual.

2. **Klasifikasi Dokumen dengan Machine Learning**

Pengembangan selanjutnya dapat memanfaatkan algoritma machine learning untuk mengklasifikasikan dokumen secara otomatis berdasarkan kontennya. Hal ini dapat membantu mempercepat proses pengkategorian dokumen dan mengurangi kesalahan pengkategorian akibat input manual.

3. **Penerapan Tanda Tangan Digital**

Sistem disarankan untuk mendukung integrasi tanda tangan digital pada dokumen yang telah disetujui. Fitur ini dapat memperkuat validitas hukum dokumen dan menggantikan proses tanda tangan basah yang masih memerlukan pertemuan fisik.

4. **Penambahan Notifikasi Real-time**

Sistem disarankan dilengkapi dengan fitur notifikasi real-time, baik melalui email maupun notifikasi dalam aplikasi (in-app notification), untuk menginformasikan kepada pengguna ketika terdapat dokumen baru yang perlu disetujui atau ketika status dokumen berubah. Notifikasi dapat dikembangkan menggunakan teknologi WebSocket atau Server-Sent Events (SSE).

5. **Pengujian Nonfungsional dan Skalabilitas**

Pengujian pada kerja praktik ini masih terbatas pada pengujian fungsional menggunakan Postman. Pengembangan selanjutnya disarankan untuk menambahkan pengujian nonfungsional seperti uji performa (load testing), uji keamanan (penetration testing), dan uji beban (stress testing) untuk memastikan sistem dapat menangani jumlah pengguna dan volume dokumen yang besar sesuai skala operasi PT Pelni di seluruh Indonesia.

6. **Dokumentasi API Terstandarisasi**

Sistem disarankan dilengkapi dengan dokumentasi API yang terstandarisasi menggunakan OpenAPI atau Swagger UI untuk memudahkan pengembang pihak ketiga atau tim pengembang selanjutnya dalam memahami daftar endpoint, parameter request, format response, mekanisme autentikasi, serta aturan akses RBAC yang berlaku pada setiap endpoint.
