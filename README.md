# QEnglish — Personal English Learning System (FPT University Edition)

Hệ thống học tiếng Anh cá nhân hóa toàn diện **5 nhóm kỹ năng** (**Listening**, **Speaking**, **Reading**, **Writing**, **Grammar & Vocabulary**) được nâng cấp từ nền tảng QEnglish gốc, thiết kế chuyên biệt cho sinh viên năm nhất **FPT University TP.HCM** hoàn thành mục tiêu **English Level 3** (lộ trình 6 tuần: `04/11/2026` – `17/12/2026`) và mở rộng lên chuẩn **CEFR A1–C2** & **IELTS 3.0–9.0**.

---

## 1. Bảo Toàn 100% Dữ Liệu & Chức Năng Gốc

- **Bản sao lưu nguyên gốc:** File gốc chưa chỉnh sửa được giữ nguyên tại `QEnglish-BACKUP-ORIGINAL.html`.
- **Tương thích hoàn toàn `localStorage` cũ:** Tự động đọc và bảo toàn dữ liệu từ các khóa `qenglish_deck_v2`, `qenglish_deck_v1`, `fpt_eng_deck_v3` mà không bao giờ tự ý xóa khóa cũ; tự động chụp ảnh sao lưu an toàn vào `qenglish_legacy_snapshot_v1` trước khi nâng cấp.
- **Giữ nguyên 20 từ vựng mặc định** (10 từ STEM + 10 từ Campus), IPA, nghĩa tiếng Việt, ví dụ, từ đánh dấu sao (`starred`), từ người học tự thêm và đủ 6 chức năng cũ (Thẻ học 3D, Danh sách lọc ngày/danh mục, Trắc nghiệm, Nhập hàng loạt + 16 từ mẫu AI, Quản lý xóa ngày/khôi phục gốc, Luyện từ & câu).

---

## 2. Cấu Trúc Thư Mục Dự Án

```text
QEnglish/
├── index.html                              # Giao diện chính của hệ thống
├── QEnglish - Học Từ Vựng Thông Minh.html  # Đồng bộ 100% với index.html để giữ tương thích tên file cũ
├── QEnglish-BACKUP-ORIGINAL.html           # Bản sao lưu nguyên trạng website v1 trước nâng cấp
├── css/
│   └── styles.css                          # Dark Glassmorphism, 3D Flashcard, Split Reading/Writing, Highlight
├── js/
│   ├── data/
│   │   ├── default-deck.js                 # 20 từ gốc + 16 từ mẫu + từ điển học thuật & câu mở rộng
│   │   ├── grammar-data.js                 # 19 bài học bao phủ đủ 16 chủ đề Ngữ pháp A1–C2
│   │   ├── listening-data.js               # Kho bài nghe 4 chế độ (Choose, Dictation, Blanks, Full Test)
│   │   ├── reading-data.js                 # Kho bài đọc học thuật & đời sống đại học
│   │   ├── writing-data.js                 # Đề luyện viết Paragraph, Email, Essay
│   │   ├── speaking-data.js                # Chủ đề Speaking & câu hỏi hội thoại trực tiếp
│   │   └── extra-levels-data.js            # Học liệu mở rộng A1, C1, C2, IELTS 6.0+ & nguồn quốc tế
│   ├── core/
│   │   ├── storage.js                      # Migration an toàn, SRS 5 trạng thái, Analytics thực, CMS chống trùng
│   │   └── audio-ai.js                     # TTS (0.1x–3.0x), SpeechRecognition, Bộ chấm câu cục bộ & AIClient
│   └── modules/
│       ├── vocabulary.js                   # Flashcards, Kho từ, Quiz, Luyện 6 bước, SRS, Nhập & Quản lý
│       ├── grammar.js                      # Học ngữ pháp 8 phần + chấm bài tập có giải thích
│       ├── listening.js                    # Player 0.5x–1.5x, tua lại, mở khóa Transcript sau khi làm
│       ├── reading.js                      # Màn hình đôi, 4 màu Highlight, tra từ lưu thẳng vào Kho từ
│       ├── writing.js                      # Đếm từ, hẹn giờ, lưu nháp tự động, chấm sửa từng câu
│       ├── speaking.js                     # Hội thoại trực tiếp, Topic Speaking & lệnh "Please do"
│       ├── notebook-cms.js                 # Sổ tay 5 phân mục + Quản lý học liệu & AI Preview
│       └── dashboard-progress.js           # Dashboard 9 chỉ số, Kế hoạch ngày, So sánh tuần & Adaptive Learning
├── api/
│   ├── ai-core.js                          # Xử lý Gemini / OpenAI, Rate Limit, giới hạn Token & Timeout 20s
│   └── ai.js                               # Serverless Function cho Vercel
├── server.js                               # Node.js HTTP Server (không cần cài thư viện ngoài)
├── supabase-schema.sql                     # Schema PostgreSQL + RLS tùy chọn cho đồng bộ đám mây
├── vercel.json                             # Cấu hình định tuyến Serverless trên Vercel
├── .env.example                            # Mẫu cấu hình biến môi trường an toàn
└── .gitignore                              # Ngăn đẩy .env và file sao lưu cá nhân lên GitHub
```

---

## 3. Hướng Dẫn Chạy Dự Án

### Cách 1: Chạy ngay lập tức không cần cài đặt (Offline / Local Browser)
Chỉ cần nhấp đúp mở `index.html` (hoặc `QEnglish - Học Từ Vựng Thông Minh.html`) bằng **Google Chrome** hoặc **Microsoft Edge**.
- Khuyến nghị dùng **Chrome** hoặc **Edge** để trình duyệt hỗ trợ tốt nhất giọng đọc tiếng Anh (`SpeechSynthesis`) và nhận diện giọng nói qua Micro (`Web Speech Recognition`).
- Toàn bộ kho từ vựng, SRS, 16 chủ đề Grammar, Listening, Reading, Speaking, Writing (chế độ phân tích ngữ pháp/chính tả cục bộ), Notebook và Báo cáo tiến độ hoạt động **100% ngay lập tức**.

### Cách 2: Chạy cùng Backend AI Server (Kích hoạt chấm bài sâu bằng Gemini / OpenAI)
1. Cài đặt **Node.js 18+** (nếu máy chưa có).
2. Sao chép file `.env.example` thành `.env` tại thư mục gốc và điền `GEMINI_API_KEY` (hoặc `OPENAI_API_KEY`) vào file `.env`.
3. Chạy lệnh:
   ```bash
   node server.js
   ```
4. Mở trình duyệt tại `http://localhost:3000`. Khi đó huy hiệu trên thanh tiêu đề sẽ chuyển sang **AI Live**!

### Cách 3: Đẩy lên GitHub & Triển khai Online (Vercel / GitHub Pages)
```bash
git init
git add .
git commit -m "Upgrade QEnglish to Personal English Learning System v2.0"
git branch -M main
git remote add origin https://github.com/<ten-tai-khoan>/<ten-repo>.git
git push -u origin main
```
- **Nếu dùng GitHub Pages:** Bật GitHub Pages từ nhánh `main` (chạy chế độ tĩnh hoàn chỉnh).
- **Nếu dùng Vercel (khuyên dùng khi muốn có AI Backend):** Import repository từ GitHub vào Vercel → Vào **Project Settings → Environment Variables** → Thêm `GEMINI_API_KEY` (hoặc `OPENAI_API_KEY`) → Nhấn **Deploy**.

---

## 4. Cam Kết Bảo Mật & Minh Bạch AI (Security & Honest AI)

1. **Không bao giờ đặt API Key ở Frontend:** Không có bất kỳ ô nhập API Key nào lưu vào `localStorage` hay mã nguồn JavaScript phía trình duyệt.
2. **Bảo vệ chi phí API:** Backend áp dụng giới hạn tần suất theo IP (`Rate Limiting`), giới hạn độ dài văn bản đầu vào, giới hạn `maxOutputTokens` và `AbortController` ngắt sau 20 giây.
3. **Quyền riêng tư giọng nói:** Bản thu âm từ Micro chỉ lưu tạm trong bộ nhớ trình duyệt để người học tự nghe lại, **không bao giờ tự động tải file ghi âm lên máy chủ bên ngoài**.
4. **Đánh giá trung thực:** Phân biệt rõ nhận diện văn bản giọng nói (`SpeechRecognition`) với chấm phát âm âm vị học IPA/ngữ điệu; ước lượng CEFR và IELTS luôn ghi rõ là **tham khảo phục vụ tự học**, không giả mạo điểm thi chính thức.
