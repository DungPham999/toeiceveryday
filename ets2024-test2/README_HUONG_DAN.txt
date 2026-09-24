TOEIC LISTENING TEMPLATE v1

MỤC ĐÍCH
- app.js, style.css, listening.html, index.html: DÙNG CHUNG cho mọi đề Listening.
- Mỗi test mới chỉ cần thay: config.js, data.js, audio-times.js và assets/.

MỖI LẦN LÀM TEST MỚI
1. Copy nguyên folder Test 2.
2. Đổi tên folder, ví dụ: ets2024-test3.
3. Giữ nguyên 4 file: app.js, style.css, listening.html, index.html.
4. Thay 4 phần riêng của đề: config.js, data.js, audio-times.js, assets/.

CONFIG.JS
Ví dụ Test 3:
  year: 2024
  testNumber: 3
  title: ETS 2024 · Test 3
  storageKey: ets2024-t3

storageKey PHẢI khác nhau giữa các test để tiến độ học viên không bị lẫn.

AUDIO
- assets/audio/ chứa file MP3 full.
- assets/images/ chứa ảnh Part 1 và graphic Part 3/4.
- Nên giữ mỗi MP3 dưới 25 MB nếu upload bằng giao diện web GitHub.

SAU NÀY BẠN CHỈ CẦN GỬI CHATGPT
1. PDF đề
2. Tapescript + answer key
3. Audio full
ChatGPT sẽ tạo config.js, data.js, audio-times.js và assets/.
