# Upload File Besar: Next.js → Java Quarkus

🔍 Riset Velma — 7 Agustus 2026

---

## 📌 3 Strategi Upload File Besar

### Strategi A: Client → Next.js API → Quarkus (Proxy)
Klien upload ke Next.js Route Handler, Next.js forward ke Quarkus.

**❌ Tidak direkomendasikan untuk file besar** — double memory usage, double latency, Next.js terbatas di serverless (Vercel: max 4.5MB body, durasi timeout).

### Strategi B: Client → Quarkus langsung (Direct Upload)
Klien bypass Next.js, upload langsung ke Quarkus REST API.

**✅ Paling simpel untuk file besar** — gak ada bottleneck Next.js.

### Strategi C: Client → Next.js (Streaming Proxy) → Quarkus
Next.js API route menerima stream dari klien dan meneruskan (pipe) ke Quarkus tanpa buffer seluruh file.

**✅ Praktis kalau butuh Next.js sebagai auth gate / middleware** sebelum kirim ke Quarkus.

---

## 1. Next.js — Menerima Upload File

### Route Handler (App Router) — Strategi A/C

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }

  // Forward ke Quarkus (multipart)
  const quarkusForm = new FormData();
  quarkusForm.append('file', file, file.name);
  // optional metadata
  quarkusForm.append('folder', 'documents');

  const res = await fetch('http://quarkus-host:8080/api/upload', {
    method: 'POST',
    body: quarkusForm,
  });

  return NextResponse.json(await res.json());
}
```

**Masalah:** `request.formData()` buffer seluruh file di memori server Next.js. Untuk file besar (>100MB), ini akan OOM di serverless.

### Streaming Proxy — Jangan Buffer (Strategi C)

```typescript
// app/api/upload/route.ts
export async function POST(request: NextRequest) {
  // Forward raw stream tanpa parse FormData
  const quarkusRes = await fetch('http://quarkus-host:8080/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': request.headers.get('content-type') || 'multipart/form-data',
      'Content-Length': request.headers.get('content-length') || '',
    },
    body: request.body, // ReadableStream, NO buffering
    // @ts-expect-error duplex not in TS types yet
    duplex: 'half',
  });

  return NextResponse.json(await quarkusRes.json());
}
```

**Kunci:** `body: request.body` meneruskan stream mentah — gak ada buffering. Next.js cuma jadi proxy tipis.

### Next.js Config — Raise Body Limit

```javascript
// next.config.js (Next.js 16+)
module.exports = {
  serverExternalPackages: [],
  // Next.js 16: body limit via Route Handler export
};

// atau per-route:
// app/api/upload/route.ts
export const maxDuration = 300; // 5 menit (hanya di Vercel Pro/Enterprise)
```

> ⚠️ **Vercel Serverless Functions:** max body size 4.5MB, timeout 10-300 detik (tergantung plan).  
> ✅ **Self-hosted Next.js:** no limit selain resource server sendiri.

### Client-side Upload (Browser → Next.js atau Quarkus)

```typescript
// components/upload.tsx
async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  // Opsi 1: via Next.js API
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData, // jangan set Content-Type header, biar browser set boundary
  });

  // Opsi 2: langsung ke Quarkus
  const res = await fetch('http://quarkus-host:8080/api/upload', {
    method: 'POST',
    body: formData,
  });
}
```

---

## 2. Java Quarkus — Menerima Upload File

### Dependencies (pom.xml)

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-resteasy-reactive</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-resteasy-reactive-multipart</artifactId>
</dependency>
```

### Endpoint Multipart (RESTEasy Reactive)

```java
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;
import org.jboss.resteasy.reactive.MultipartForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

@Path("/api/upload")
public class UploadResource {

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response upload(@MultipartForm FileUploadForm form) {
        FileUpload file = form.file;
        
        // Simpan ke disk / cloud storage
        java.nio.file.Path targetPath = Path.of(
            "/uploads", form.folder, file.fileName()
        );
        Files.createDirectories(targetPath.getParent());
        Files.move(file.uploadedFile(), targetPath);

        return Response.ok(Map.of(
            "status", "ok",
            "path", targetPath.toString(),
            "size", file.size()
        )).build();
    }
}
```

### MultipartForm DTO

```java
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.core.MediaType;
import org.jboss.resteasy.reactive.PartType;
import org.jboss.resteasy.reactive.multipart.FileUpload;

public class FileUploadForm {

    @FormParam("file")
    @PartType(MediaType.APPLICATION_OCTET_STREAM)
    public FileUpload file;

    @FormParam("folder")
    @PartType(MediaType.TEXT_PLAIN)
    public String folder;
}
```

### Konfigurasi Upload Size Quarkus

```properties
# application.properties
# Max upload size (default 10MB, format: 100M = 100MB, 1G = 1GB)
quarkus.http.limits.max-body-size=500M

# Timeout untuk upload lama
quarkus.http.read-timeout=10M

# Multipart: simpan file ke disk (bukan memory) untuk file besar
quarkus.http.body.uploads-directory=/tmp/quarkus-uploads
```

---

## 3. Strategi Chunked Upload (File Sangat Besar: >1GB)

Untuk file yang BESAR BANGET, standard multipart gak ideal. Pakai chunked upload.

### Alur Chunked Upload:

```
Klien                          Quarkus
  │                               │
  ├─ POST /upload/init ──────────►│  (dapat uploadId)
  │   { fileName, totalSize }     │
  │                               │
  ├─ POST /upload/{id}/chunk?n=0─►│  (kirim chunk 0)
  │   binary blob                 │
  ├─ POST /upload/{id}/chunk?n=1─►│  (kirim chunk 1)
  │   binary blob                 │
  │  ...                          │
  ├─ POST /upload/{id}/complete──►│  (merge semua chunk)
  │                               │  Kembalikan path final
```

### Client-side Chunking (Next.js)

```typescript
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk

async function chunkedUpload(file: File) {
  // 1. Init
  const initRes = await fetch('/api/upload/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, totalSize: file.size }),
  });
  const { uploadId } = await initRes.json();

  // 2. Upload chunks
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const chunk = file.slice(start, start + CHUNK_SIZE);
    
    await fetch(`/api/upload/${uploadId}/chunk?n=${i}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: chunk,
    });
  }

  // 3. Complete
  const completeRes = await fetch(`/api/upload/${uploadId}/complete`, { method: 'POST' });
  return completeRes.json();
}
```

### Quarkus Chunked Endpoint

```java
@Path("/api/upload")
public class ChunkedUploadResource {

    private final Map<String, UploadSession> sessions = new ConcurrentHashMap<>();

    @POST
    @Path("/init")
    public Response init(UploadInitRequest req) {
        String uploadId = UUID.randomUUID().toString();
        sessions.put(uploadId, new UploadSession(req.fileName, req.totalSize));
        return Response.ok(Map.of("uploadId", uploadId)).build();
    }

    @POST
    @Path("/{uploadId}/chunk")
    @Consumes(MediaType.APPLICATION_OCTET_STREAM)
    public Response uploadChunk(
        @PathParam("uploadId") String uploadId,
        @QueryParam("n") int chunkIndex,
        byte[] chunk  // Quarkus manages chunk size via body limit
    ) {
        UploadSession session = sessions.get(uploadId);
        if (session == null) throw new NotFoundException();
        
        session.writeChunk(chunkIndex, chunk);
        return Response.ok(Map.of("chunk", chunkIndex)).build();
    }

    @POST
    @Path("/{uploadId}/complete")
    public Response complete(@PathParam("uploadId") String uploadId) {
        UploadSession session = sessions.remove(uploadId);
        String finalPath = session.mergeChunks();
        return Response.ok(Map.of("path", finalPath)).build();
    }
}
```

---

## 4. Rekomendasi Berdasarkan Ukuran File

| Ukuran File | Strategi | Catatan |
|-------------|----------|---------|
| <10MB | A (Proxy Next.js) | Simpel. Next.js handle semuanya. |
| 10-100MB | C (Streaming Proxy) | Next.js forward stream, jangan buffer. |
| 100MB - 1GB | B (Direct to Quarkus) | Bypass Next.js. Quarkus handle multipart. |
| >1GB | Chunked Upload | Pisah jadi chunk 5-10MB, resumable. |

---

## 5. Poin Penting

### Next.js
- **Vercel:** body limit 4.5MB, timeout 10-300s. Gak cocok untuk upload besar.
- **Self-hosted:** bisa atur body limit & timeout bebas via config.
- Gunakan `request.body` (ReadableStream) untuk proxy tanpa buffering.
- Jangan pakai `request.formData()` untuk file besar — itu buffer seluruh file ke memory.

### Quarkus
- `quarkus.http.limits.max-body-size` — atur batas upload.
- Multipart file otomatis di-spool ke disk kalo melebihi buffer memory.
- RESTEasy Reactive multipart sangat mature dan efisien.
- Untuk chunked: simpan chunk ke file sementara, merge di akhir.

### Bonus: Resumable Upload (TUS Protocol)
Untuk use case enterprise dengan network unreliable, pertimbangkan **TUS protocol** (tus.io). Quarkus punya ekstensi: `quarkus-tus`. Klien bisa pause/resume upload tanpa kirim ulang dari awal.

---

## 6. Ringkasan Arsitektur Rekomendasi

```
┌─────────┐     multipart/stream      ┌────────────┐     multipart      ┌─────────┐
│ Browser │ ─────────────────────────►│  Next.js   │ ──────────────────►│ Quarkus │
│ (File)  │                           │  (Proxy)   │                    │ (Store) │
└─────────┘                           └────────────┘                    └─────────┘
                                            │                                │
                                     Auth check,                        Simpan ke:
                                     validasi,                          - Disk lokal
                                     rate limiting                      - S3/MinIO
                                                                        - DB blob
                                            │
                                   ┌────────┴────────┐
                                   │  Alternatif:     │
                                   │  Direct upload   │
                                   │  (skip Next.js)  │
                                   └─────────────────┘
```

---

Ada yang mau didalemin? Misalnya detail implementasi TUS, integrasi S3/MinIO, atau best practice error handling? 🧪
