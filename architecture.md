```md
# HiuraMovie Frontend Architecture
## React Router v7 Framework (Scalable & Production-Ready)

Dokumen ini menjelaskan arsitektur frontend **HiuraMovie** menggunakan **React Router v7 Framework Mode**.
Target:
- scalable (jutaan user)
- streaming-friendly
- cocok untuk backend Rust + Axum + S3
- siap tim besar

---

## 1. Prinsip Utama

1. **Route = Feature**
2. **Loader = Read (fetch data)**
3. **Action = Write (mutasi data)**
4. **Streaming pakai defer + Suspense**
5. **Minim global state**
6. **Video logic terisolasi**

---

## 2. Struktur Folder (High-Level)

```

apps/web/
├── app/
│   ├── routes/            # Feature-based routing
│   ├── modules/           # Domain logic (video, auth, user)
│   ├── components/        # Shared components
│   ├── services/          # API client layer
│   ├── hooks/             # Custom hooks
│   ├── stores/            # Global state minimal
│   ├── utils/
│   └── styles/
├── public/
└── entry.client.tsx

```

---

## 3. Routing Strategy (Route = Feature)

```

app/routes/
├── _layout.tsx
├── _auth.tsx
├── index.tsx
├── search.tsx
├── watch.$id.tsx
├── upload/
│   ├── route.tsx
│   ├── loader.ts
│   └── action.ts
├── studio/
│   ├── index.tsx
│   ├── videos.tsx
│   └── analytics.tsx

````

Setiap route:
- punya loader
- punya action (jika mutasi)
- punya error boundary

---

## 4. Data Fetching (Loader Pattern)

```ts
export async function loader({ params }) {
  return fetchVideoMeta(params.id)
}
````

Rules:

* loader = GET
* tidak ada fetch di component utama
* server adalah source of truth

---

## 5. Streaming Data (defer + Suspense)

```ts
export async function loader({ params }) {
  return defer({
    meta: fetchVideoMeta(params.id),
    streamUrl: fetchSignedStream(params.id),
  })
}
```

```tsx
<Suspense fallback={<Skeleton />}>
  <Await resolve={data.streamUrl}>
    {(url) => <VideoPlayer src={url} />}
  </Await>
</Suspense>
```

---

## 6. Video Player Architecture (Isolated)

```
components/video/
├── VideoPlayer.tsx
├── useVideoControls.ts
├── useVideoMetrics.ts
```

Rules:

* video logic tidak masuk global state
* playback isolated
* reusable

---

## 7. Upload Video Architecture

### Route: /upload

```
routes/upload/
├── route.tsx
├── action.ts
├── components/
│   ├── UploadDropzone.tsx
│   ├── UploadProgress.tsx
│   └── UploadChunkManager.ts
```

### Upload pakai useFetcher

```tsx
const fetcher = useFetcher()

fetcher.submit(formData, {
  method: "post",
  encType: "multipart/form-data",
})
```

Keuntungan:

* tidak trigger navigation
* tidak reload page
* cocok untuk progress bar

---

## 8. State Management Strategy

| Kebutuhan          | Solusi              |
| ------------------ | ------------------- |
| Auth               | Cookie + loader     |
| Form & UI state    | Local state         |
| Upload progress    | useRef / useState   |
| Global preferences | Zustand (optional)  |
| Server data        | React Router loader |

Tidak pakai:

* Redux
* React Query

---

## 9. Auth Protection (Route Guard)

```ts
export async function loader({ request }) {
  const user = await getSessionUser(request)
  if (!user) throw redirect("/login")
  return user
}
```

Auth dilakukan sebelum render UI.

---

## 10. API Layer (Typed & Clean)

```
services/
├── http.ts
├── auth.ts
├── video.ts
```

```ts
export async function api<T>(
  url: string,
  options?: RequestInit
): Promise<T>
```

Rules:

* semua API lewat service
* tidak fetch langsung di component

---

## 11. Error Handling (Per Route)

```tsx
export function ErrorBoundary({ error }) {
  return <ErrorPage error={error} />
}
```

Crash satu route tidak menjatuhkan seluruh app.

---

## 12. Performance Rules

Wajib:

* route-based code splitting
* defer + Suspense
* skeleton UI
* CDN static assets

Optional:

* Service Worker
* prefetch metadata
* edge caching (Cloudflare)

---

## 13. Testing Strategy

| Layer      | Tool                |
| ---------- | ------------------- |
| Routes     | Playwright          |
| Components | Testing Library     |
| Upload     | E2E                 |
| Video      | Manual + Automation |

---

## 14. Arsitektur Ringkas

```
React Router v7
├── Loader  → Read
├── Action  → Write
├── Defer   → Stream
├── Fetcher → Background
├── Suspense→ UX
└── Rust Backend → Source of truth
```

---

## 15. Kesimpulan

Arsitektur ini:

* siap untuk traffic besar
* cocok untuk video streaming
* mudah dikembangkan tim besar
* clean separation of concerns

HiuraMovie frontend = **production-grade media platform**.

```