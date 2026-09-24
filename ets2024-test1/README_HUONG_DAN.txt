ETS 2024 – TEST 1 (100 CÂU)

CÁCH MỞ TRÊN MÁY
1. Mở index.html bằng Google Chrome.
2. Part 1–2: chọn đáp án -> hiện đúng/sai + script.
3. Part 3–4: chọn đủ 3 câu -> bấm Check -> hiện đúng/sai + script.
4. Nút “Danh sách câu hỏi” mở palette 100 câu.

CÁCH SỬA THỜI GIAN AUDIO TRÊN GITHUB
Bạn CHỈ cần sửa file: audio-times.js

Ví dụ:
  "p2-q18": { start: "09:26.78", end: "09:41.10" },

- Audio bị MẤT 2 giây đầu -> giảm START 2 giây.
  Ví dụ 09:26.78 -> 09:24.78
- Audio bị DƯ 2 giây đầu -> tăng START 2 giây.
  Ví dụ 09:26.78 -> 09:28.78
- Audio bị MẤT 2 giây cuối -> tăng END 2 giây.
- Audio bị DƯ 2 giây cuối -> giảm END 2 giây.

Sau khi sửa trên GitHub, bấm Commit changes. Không cần cắt MP3 và không cần sửa app.js.

CÁCH SỬA LỖI SPELLING / SCRIPT
Mở data.js trên GitHub -> Ctrl/Cmd+F tìm đúng cụm từ sai -> sửa chữ -> Commit changes.
Không sửa các trường answer nếu chỉ sửa spelling.

LƯU Ý
- Website dùng một file audio duy nhất: assets/audio/Test_01.mp3
- Mốc audio được suy ra tự động và có thể có vài đoạn lệch 1–5 giây. Đây là lý do audio-times.js được tách riêng để chỉnh rất nhanh.
- Script lấy từ bản tapescript scan; một vài tên riêng hoặc dấu câu có thể cần hiệu chỉnh sau khi sử dụng thực tế.

ĐƯA LÊN GITHUB PAGES KHÔNG DÙNG TERMINAL
1. Tạo repository mới trên GitHub, ví dụ: toeic-listening.
2. Chọn Add file -> Upload files.
3. Kéo TOÀN BỘ nội dung bên trong thư mục này lên GitHub (index.html phải nằm ở thư mục gốc của repo).
4. Bấm Commit changes.
5. Vào Settings -> Pages -> Deploy from a branch -> main -> /root -> Save.
6. GitHub sẽ tạo link dạng https://ten-cua-ban.github.io/toeic-listening/

File audio trong bản này đã được nén còn khoảng 22 MB để có thể upload bằng giao diện web GitHub mà không cần Git/Terminal.
