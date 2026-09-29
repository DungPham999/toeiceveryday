# TOEIC EVERYDAY — ETS LISTENING SPEC

## 1. Mục đích

File này là quy chuẩn chính thức để tạo **Full ETS TOEIC Listening Test** cho TOEIC EVERYDAY.

Đây **không phải Practice Unit**.

Nếu prompt có dạng:

```text
Tạo ETS ... Listening Test ...
```

thì dùng file này.

---

## 2. Folder chuẩn

```text
tests/[TEST-ID]/listening/
├── config.js
├── data.js
├── audio-times.js
└── assets/
    ├── audio/
    └── images/
```

Shared:

```text
shared/listening/
├── listening.html
├── loader.js
├── app.js
└── style.css
```

Khi tạo đề mới:

**Không tạo lại hoặc ghi đè shared/listening trừ khi giáo viên yêu cầu sửa template chung.**

---

## 3. Test ID

Dùng lowercase + kebab-case:

```text
ets2024-t1
ets2024-t2
ets2026-t1
ets2026-t5
```

Không dùng tên folder dài hoặc không thống nhất.

---

## 4. Cấu trúc ETS Listening bắt buộc

```text
Part 1: Q1–6
Part 2: Q7–31
Part 3: Q32–70
Part 4: Q71–100
```

Phải có đúng:

```text
100 câu
Q1 → Q100
không thiếu
không trùng
```

Không dùng số câu linh hoạt như Practice.

---

## 5. Nguồn đầu vào

Có thể gồm:

- Listening booklet/PDF/images
- audio
- tapescript
- answer key
- explanation nếu có
- graphic đã nằm trong đề

Giữ nguyên English của nguồn.

Không tự viết lại question, choices, tapescript hoặc graphic.

---

## 6. Output bắt buộc

### `config.js`

Ví dụ:

```javascript
window.TEST_CONFIG = {
  year: 2026,
  testNumber: 3,
  title: "ETS 2026 · Test 3",
  storageKey: "ets2026-t3",
  homeUrl: "../../",
  readingEnabled: false,
  readingUrl: "./reading/"
};
```

Phải đúng năm và số Test.

---

### `data.js`

Chứa:

- Q1–100
- choices
- answers
- scripts
- Part/set structure
- image/graphic paths
- explanation nếu nguồn có hoặc template cần

Phải tương thích `shared/listening` hiện tại.

Không tạo schema mới riêng cho từng Test.

---

### `audio-times.js`

Chứa timestamp dùng để shared player phát đúng câu/set.

Timestamp phải khớp audio thật.

---

### `assets/`

```text
assets/audio/
assets/images/
```

Part 1 và graphic Part 3/4 có thể cần ảnh.

Ảnh/graphic không được bị crop trên giao diện.

---

## 7. Part 1 — Q1–6

- hiện ảnh
- phát đúng đoạn audio của từng câu
- có replay/seek/back/speed theo shared player hiện tại
- chọn A/B/C/D
- chấm ngay câu đó
- hiện correct/wrong
- hiện đáp án
- hiện script
- hiện explanation nếu có

Không đợi làm hết Part 1 mới chấm.

---

## 8. Part 2 — Q7–31

- phát đúng audio từng câu
- chọn đáp án
- chấm ngay
- hiện đáp án
- hiện script
- explanation nếu có
- nghe lại được sau khi trả lời

Không check theo set.

---

## 9. Part 3 — Q32–70

- giữ đúng grouping ETS
- thường 3 câu/conversation
- phát đúng đoạn audio của set
- graphic nếu nguồn có
- học viên làm đủ câu
- bấm **Check**
- sau Check mới:
  - chấm
  - hiện đáp án
  - hiện script
  - hiện explanation

Không chấm từng câu trước Check.

---

## 10. Part 4 — Q71–100

Giống Part 3:

- grouping đúng nguồn
- audio theo set
- graphic nếu có
- làm đủ set rồi Check
- sau Check mới hiện đáp án, script, explanation

---

## 11. Shared Listening UI

Phải tương thích các tính năng hiện tại:

- Part tabs
- Question Palette
- Mark ★
- audio player
- replay
- back control
- speed
- Làm lại bài
- Trang chủ
- Đăng xuất
- script
- lưu trạng thái bằng localStorage
- responsive

Không tạo UI riêng cho từng đề.

---

## 12. Audio timing

Nếu audio là một file dài:

- xác định timestamp chính xác
- lưu trong `audio-times.js`
- kiểm tra từng đoạn
- sửa offset thủ công nếu cần

Tránh:

- đầu đoạn bị cắt
- cuối đoạn bị cắt
- script không khớp audio
- Part 3/4 thiếu câu mở đầu
- lệch timestamp dây chuyền

Không đoán timestamp mà không kiểm tra audio.

---

## 13. Image/graphic

- Part 1: lấy đúng ảnh câu hỏi
- Part 3/4: lấy đúng graphic nếu có
- không crop nội dung quan trọng
- dùng filename ổn định
- kiểm tra không 404

Ví dụ:

```text
assets/images/q01.jpg
assets/images/q97.png
```

---

## 14. Tapescript

Tapescript nguồn là chuẩn.

- giữ nguyên wording
- giữ speaker turns
- chỉ sửa OCR lỗi rõ ràng khi đối chiếu được nguồn
- không tự bịa đoạn thiếu
- không thay tapescript thật bằng nội dung model tự viết

---

## 15. Answer key

Answer key nguồn là chuẩn.

- map đáp án đúng
- kiểm tra từng câu
- không tự đổi key
- nếu nghi key sai, vẫn giữ key và báo riêng để giáo viên kiểm tra

---

## 16. Explanation

Nếu nguồn có explanation:

- giữ đúng lập luận
- có thể format/rút gọn
- không thay bằng giải thích không được nguồn hỗ trợ

Nếu nguồn không có explanation:

- không bắt buộc tự tạo explanation dài
- Listening có thể chỉ cần tapescript
- chỉ tự tạo explanation nếu giáo viên yêu cầu

---

## 17. `tests.json`

Chỉ đưa Test đã publish lên homepage.

Ví dụ:

```json
{
  "id": "ets2026-t3",
  "year": 2026,
  "test": 3,
  "listening": true,
  "reading": false
}
```

Không tạo placeholder "Chưa mở" nếu không được yêu cầu.

---

## 18. Loader/path

URL điển hình:

```text
/shared/listening/listening.html?test=ets2026-t3
```

Loader phải tìm đúng:

```text
../../tests/ets2026-t3/listening/config.js
../../tests/ets2026-t3/listening/data.js
../../tests/ets2026-t3/listening/audio-times.js
```

Không tạo folder lặp:

```text
tests/ets2026-t3/ets2026-t3/listening/
```

Đúng:

```text
tests/ets2026-t3/listening/
```

---

## 19. Validation trước khi xuất

Kiểm tra:

- đúng năm ETS
- đúng Test number
- đúng folder ID
- đủ Q1–100
- không trùng số câu
- Part 1 = Q1–6
- Part 2 = Q7–31
- Part 3 = Q32–70
- Part 4 = Q71–100
- choices đúng thứ tự
- key đúng
- script đầy đủ
- ảnh Part 1 đủ
- graphic Part 3/4 đủ
- không broken paths
- timestamp hợp lệ
- không audio/image 404
- storageKey duy nhất
- tương thích `shared/listening`
- output không chứa shared files thừa

---

## 20. Prompt ngắn chuẩn

```text
Tạo ETS 2026 Listening Test 3 theo ETS_LISTENING_SPEC.md.

Nguồn đính kèm:
- đề
- audio
- tapescript + key
- file giải nếu có

Tạo đúng:
tests/ets2026-t3/listening/

Không tạo lại shared/listening.
Kiểm tra đủ Q1–100 trước khi xuất.
```

---

## 21. Quy tắc cuối

Nếu prompt là:

```text
ETS ... Listening Test ...
```

thì dùng Full ETS Listening spec này.

Không áp dụng Practice Unit, folder `units/` hoặc số câu linh hoạt.
