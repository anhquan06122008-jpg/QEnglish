# QEnglish Cloud — Personal AI English Learning Platform

Hệ thống học tiếng Anh cá nhân hóa toàn diện **5 nhóm kỹ năng** (**Listening**, **Speaking**, **Reading**, **Writing**, **Grammar & Vocabulary**) với **Tài khoản độc lập theo người dùng (Supabase Auth + PostgreSQL RLS)**, **Đồng bộ đa thiết bị**, và **Hệ thống AI Coach & Chấm Writing chuyên sâu** (Internal `/10` 4×2.5, **PEN301**, IELTS, CEFR, TOEFL & Rubric tự nhập).

---

## 1. Bảo Toàn 100% Dữ Liệu & Chức Năng Gốc

- **Bản sao lưu nguyên gốc:** File nguyên trạng trước nâng cấp được giữ tại `QEnglish-BACKUP-ORIGINAL.html`, và tag Git `backup-v2-pre-cloud-upgrade` được tạo trước các thay đổi v3.
- **Di trú dữ liệu cũ an toàn (Non-destructive Migration):** Khi người học lần đầu đăng nhập bằng tài khoản mới trên trình duyệt đã có dữ liệu cũ (`qenglish_vocab_deck_v1`, `qenglish_notebook_v1`, `qenglish_progress_v1`, ...), hệ thống hỏi ý kiến và **sao chép/gộp** sang không gian tài khoản riêng mới, tuyệt đối không xóa dữ liệu cũ hàng loạt.
- **Bảo toàn 20 từ vựng gốc & toàn bộ nội dung:** Từ vựng STEM/Campus, dấu sao, từ tự thêm, 19 bài ngữ pháp, bài Listening/Reading/Writing/Speaking và Sổ tay đều được giữ nguyên 100%.

---

## 2. Cấu Trúc Thư Mục Dự Án

```text
QEnglish/
├── index.html                              # Ứng dụng chính (gộp sẵn toàn bộ 18 module JS để chạy zero-404)
├── QEnglish - Học Từ Vựng Thông Minh.html  # Đồng bộ 100% với index.html để giữ tương thích tên file cũ
├── QEnglish-BACKUP-ORIGINAL.html           # Bản sao lưu nguyên trạng website v1 trước nâng cấp
├── css/
│   └── styles.css                          # Dark Glassmorphism, 3D Flashcard, Split Reading/Writing, Highlight
├── js/
│   ├── data/
│   │   ├── default-deck.js                 # 20 từ gốc + 16 từ mẫu + từ điển học thuật & câu mở rộng
│   │   ├── grammar-data.js                 # 19 bài học bao phủ 16 chủ điểm Ngữ pháp A1–C2
│   │   ├── listening-data.js               # Kho bài nghe 4 chế độ (Choose, Dictation, Blanks, Full Test)
│   │   ├── reading-data.js                 # Kho bài đọc học thuật & đời sống đại học
│   │   ├── writing-data.js                 # Đề luyện viết Paragraph, Email, Essay
│   │   ├── speaking-data.js                # Chủ đề Speaking & câu hỏi hội thoại trực tiếp
│   │   └── extra-levels-data.js            # Học liệu mở rộng A1, C1, C2, IELTS 6.0+ & nguồn quốc tế
│   ├── core/
│   │   ├── supabase-client.js              # CloudClient: Auth, JWT refresh, Snapshot Sync, Material Storage upload
│   │   ├── storage.js                      # Per-user scoped storage, SRS, Analytics thực, CMS & Safe Migration
│   │   └── audio-ai.js                     # TTS (0.1x–3.0x), SpeechRecognition, Bộ chấm cục bộ & AIClient
│   └── modules/
│       ├── vocabulary.js                   # Flashcards, Kho từ, Quiz, Luyện 6 bước, SRS, ✨ AI Vocab Coach
│       ├── grammar.js                      # Học ngữ pháp 8 phần + chấm bài tập + 🤖 AI Grammar Coach
│       ├── listening.js                    # Player 0.5x–1.5x, Dictation, Transcript + 🤖 AI Listening Coach
│       ├── reading.js                      # Màn hình đôi, 4 màu Highlight + 🤖 Phân tích câu & Tóm tắt ý
│       ├── writing.js                      # Chấm Internal /10 (4×2.5), PEN301, IELTS/CEFR, 3 bản viết lại & Kế hoạch 9 mục
│       ├── speaking.js                     # Hội thoại trực tiếp, Topic Speaking & đánh giá minh bạch STT
│       ├── notebook-cms.js                 # Sổ tay 5 phân mục + Kho học liệu cá nhân
│       └── dashboard-progress.js           # Auth Gate, Sync Cloud, Dashboard KPI, Progress Analytics & Materials CRUD
├── api/
│   ├── config.js                           # Trả cờ cấu hình công khai (/api/config) — tuyệt đối không lộ secret
│   └── ai.js                               # Vercel Serverless AI API (Writing Eval, 6 AI Coaches, Auth JWT check)
├── server.js                               # Node.js HTTP Server chạy nội bộ hỗ trợ /api/config & /api/ai/*
├── supabase-schema.sql                     # Schema PostgreSQL + RLS (auth.uid() = user_id) & Storage Bucket
├── vercel.json                             # Định tuyến /api/config và /api/ai/:task trên Vercel
├── .env.example                            # Mẫu cấu hình biến môi trường
└── .gitignore                              # Ngăn đẩy .env và dữ liệu nhạy cảm lên GitHub
```

---

## 3. Triển Khai & Cấu Hình Online (Vercel + Supabase Cloud)

### Bước 1: Thiết lập Cơ sở dữ liệu & Xác thực Supabase
1. Tạo dự án trên **Supabase** -> Vào **SQL Editor** -> Chạy toàn bộ nội dung file `supabase-schema.sql`.
   - Schema tạo các bảng cách ly hoàn toàn theo từng người dùng qua Row-Level Security (`auth.uid() = user_id`): `user_profiles`, `user_study_snapshots`, `user_writing_submissions`, `user_materials`, bảng legacy `qenglish_user_snapshots`, và Storage bucket riêng `qenglish-materials`.
2. Vào **Authentication → URL Configuration**: đặt **Site URL** và **Redirect URLs** về domain Vercel của bạn (ví dụ `https://qenglish-ten.vercel.app/**`) để liên kết xác minh email và đặt lại mật khẩu hoạt động chính xác.

### Bước 2: Cấu hình Biến môi trường trên Vercel
Vào **Vercel Project → Settings → Environment Variables** và thiết lập:
- `SUPABASE_URL`: URL dự án Supabase (ví dụ `https://xxxx.supabase.co`)
- `SUPABASE_ANON_KEY`: `anon` public key của Supabase (**không bao giờ** dùng `service_role` key ở đây)
- `GEMINI_API_KEY` (khuyên dùng `gemini-2.5-flash`) **hoặc** `OPENAI_API_KEY`
- Tùy chọn: `REQUIRE_AUTH_FOR_AI=true` để bắt buộc JWT hợp lệ từ Supabase mới gọi được `/api/ai/*`
- Tùy chọn: `ALLOWED_ORIGIN=https://<domain-vercel-cua-ban>`

Sau khi lưu Environment Variables, hãy bấm **Redeploy** trên Vercel để kích hoạt cấu hình mới.

### Bước 3: Chạy Cục bộ với Node.js Server
1. Sao chép `.env.example` thành `.env` và điền key tương ứng.
2. Chạy `node server.js` (yêu cầu Node.js 18+).
3. Truy cập `http://localhost:3000`.

*Lưu ý khi mở trực tiếp file `index.html` (`file://`) hoặc qua GitHub Pages tĩnh:* Trình duyệt không có `/api/config` và `/api/ai/*` nên hệ thống chạy ở chế độ **Cục bộ (Local Fallback Mode)** — tài khoản và dữ liệu lưu trên trình duyệt đó, không đồng bộ chéo thiết bị và không chấm bài AI từ xa.

---

## 4. Cam Kết Bảo Mật & Minh Bạch AI (Security & Honest AI)

1. **Cách ly tài khoản thực thụ:** Mọi tài khoản đăng nhập đều dùng key `localStorage` riêng theo UID (`qenglish_u_<uid>_...`), tự xóa bộ nhớ tạm khi đăng xuất, và phía Cloud PostgreSQL khóa chặt bằng RLS `auth.uid() = user_id`.
2. **Bảo vệ API Key & Chi phí:** Mọi AI key (`GEMINI_API_KEY` / `OPENAI_API_KEY`) chỉ nằm trên Backend/Serverless; `/api/config` chỉ phát `SUPABASE_URL`, `SUPABASE_ANON_KEY` và cờ trạng thái. Backend áp dụng giới hạn IP (`RATE_LIMIT_MAX_PER_MIN`), giới hạn ký tự đầu vào (`12000`), `maxOutputTokens` (`3600`) và timeout `45s`.
3. **Đánh giá trung thực 100%:** Khi chưa kết nối AI Backend, Writing và Speaking hiển thị thông báo rõ ràng thay vì giả mạo điểm AI hay điểm IELTS/CEFR. Speaking tách bạch kết quả nhận dạng giọng nói thành văn bản (`SpeechRecognition`) với chấm ngữ âm IPA bản địa.
