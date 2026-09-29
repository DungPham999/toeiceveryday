# TOEIC EVERYDAY — ETS READING SPEC

## 1. Mục đích

File này là quy chuẩn chính thức để tạo **Full ETS TOEIC Reading Test** cho TOEIC EVERYDAY.

Đây **không phải Practice Unit**.

Nếu prompt có dạng:

```text
Tạo ETS ... Reading Test ...
```

thì dùng file này.

---

## 2. Folder chuẩn

```text
tests/[TEST-ID]/reading/
├── config.js
├── data.js
└── explanation-fixes.js
```

Shared:

```text
shared/reading/
├── reading.html
├── loader.js
├── app.js
└── style.css
```

Khi tạo đề mới:

**Không tạo lại hoặc ghi đè shared/reading trừ khi giáo viên yêu cầu sửa template chung.**

---

## 3. Test ID

Dùng lowercase + kebab-case:

```text
ets2023-t2
ets2024-t1
ets2026-t4
```

Đúng:

```text
tests/ets2026-t4/reading/
```

Sai:

```text
tests/ets2026-t4/ets2026-t4/reading/
```

---

## 4. Cấu trúc ETS Reading bắt buộc

```text
Part 5: Q101–130
Part 6: Q131–146
Part 7: Q147–200
```

Phải có:

```text
100 câu
Q101 → Q200
không thiếu
không trùng
```

---

## 5. Part 6 chuẩn

Thông thường:

```text
Q131–134
Q135–138
Q139–142
Q143–146
```

Giữ đúng grouping nguồn.

Không tự gộp/tách passage.

---

## 6. Part 7

Giữ đúng grouping nguồn:

- single passage
- double passage
- triple passage

Số câu mỗi set theo đúng đề.

Tổng range vẫn là:

```text
Q147–200
```

---

## 7. Nguồn đầu vào

Có thể gồm:

- Reading booklet PDF/images
- answer key
- detailed solution/explanation nếu có

Giữ nguyên English.

Không tự rewrite passage, question stem hoặc choices.

---

## 8. Output bắt buộc

### `config.js`

Ví dụ:

```javascript
window.READING_CONFIG = {
  id: "ets2026-reading-t3",
  title: "ETS 2026 · Reading Test 3",
  storageKey: "ets2026-reading-t3",
  prototype: false
};
```

Title phải đúng Test.

Shared page phải đọc title từ `READING_CONFIG`, không hard-code mọi đề thành `ETS 2024 · Reading Test 1`.

---

### `data.js`

Cấu trúc chuẩn:

```javascript
window.READING_DATA = {

  part5: [
    {
      id: "p5-q101",
      part: 5,
      number: 101,
      prompt: "...",
      choices: ["...", "...", "...", "..."],
      answer: 1,
      explanation: "..."
    }
  ],

  part6: [
    {
      id: "p6-131-134",
      part: 6,
      label: "Questions 131–134",
      passageTitle: "...",
      passageHtml: `
        <div class="source-doc">
          ...
        </div>
      `,
      questions: [
        {
          number: 131,
          choices: ["...", "...", "...", "..."],
          answer: 3,
          explanation: "..."
        }
      ]
    }
  ],

  part7: [
    {
      id: "p7-147-148",
      part: 7,
      label: "Questions 147–148",
      passageTitle: "...",
      passageHtml: `
        <div class="source-doc">
          ...
        </div>
      `,
      questions: [
        {
          number: 147,
          prompt: "...",
          choices: ["...", "...", "...", "..."],
          answer: 1,
          explanation: "..."
        }
      ]
    }
  ]

};
```

Answer index mặc định:

```text
A = 0
B = 1
C = 2
D = 3
```

---

### `explanation-fixes.js`

```javascript
window.READING_EXPLANATION_FIXES = {};
```

Dùng để giáo viên sửa nhanh explanation mà không phải build lại toàn bộ `data.js`.

Shared app phải ưu tiên fix trong file này.

---

## 9. Chính sách assets Reading

Ưu tiên:

**Không dùng `assets/` nếu có thể dựng nội dung bằng HTML/text.**

Part 6/7 nên dựng trực tiếp trong `passageHtml`.

Dựng lại:

- email
- letter
- advertisement
- notice
- schedule
- text messages
- menu
- webpage
- table
- form
- article
- review
- memo

Chỉ dùng ảnh nếu yếu tố hình ảnh thật sự cần thiết.

---

## 10. Part 5 — Q101–130

- mỗi câu độc lập
- chọn đáp án
- chấm ngay
- hiện đúng/sai
- hiện đáp án đúng
- hiện Explanation ngay

Không cần Check theo set.

---

## 11. Part 6 — Q131–146

- passage trái / questions phải trên desktop
- làm đủ câu trong set
- bấm **Check**
- sau Check mới:
  - chấm
  - hiện đáp án
  - hiện explanation
- hai pane cuộn độc lập
- chọn đáp án không được làm pane câu hỏi nhảy lên đầu

---

## 12. Part 7 — Q147–200

- giữ single/double/triple passage
- desktop:
  - passage trái
  - questions phải
  - scroll độc lập
  - resizer nếu shared template có
- mobile: một cột
- làm đủ câu của set rồi Check
- sau Check mới hiện đáp án + explanation
- có:
  - Set trước
  - Set tiếp
  - Question Palette
  - Mark ★

Navigation ưu tiên:

```text
← Set trước     Questions 147–148     Set tiếp →
```

Không cần top set selector nếu shared template không dùng.

---

## 13. Giữ scroll

Part 6/7 phải giữ scroll sau khi chọn đáp án.

Shared implementation nên:

1. lưu `.set-questions.scrollTop`
2. lưu passage scroll nếu cần
3. render/update
4. restore bằng `requestAnimationFrame`

Không sửa riêng cho từng Test.

---

## 14. Explanation UI

Ưu tiên compact:

```html
<details>
  <summary>Explanation</summary>
  ...
</details>
```

Không để explanation dài chiếm toàn bộ layout trước khi Check.

---

## 15. Quy tắc explanation

### Nếu có file giải

Dùng file giải làm nguồn chính.

- giữ đúng reasoning
- được cleanup/format
- không âm thầm thay bằng kiến thức ngoài nguồn

### Nếu chỉ có answer key

Được phép tự viết explanation.

Part 5:

- grammar
- vocabulary
- collocation
- syntax
- word form

Part 6/7:

- giải thích bằng evidence trong passage
- chỉ ra câu/ý liên quan
- không bịa evidence

Key nguồn vẫn là chuẩn.

Nếu nghi key sai:

- không tự đổi
- giữ key
- báo riêng câu đáng nghi để giáo viên review

---

## 16. Source fidelity

Giữ nguyên:

- passage
- punctuation quan trọng
- names
- dates
- prices
- times
- addresses
- table values
- answer choices
- question stems
- passage order

Không tự "improve" source English.

Nếu buộc phải OCR:

- chỉ dùng khi text extraction không có
- đối chiếu lại với ảnh
- kiểm tra kỹ proper nouns, numbers, answer choices

---

## 17. Title tự động

Shared Reading header phải lấy:

```javascript
window.READING_CONFIG.title
```

Ví dụ:

```text
ETS 2024 · Reading Test 3
```

cho URL:

```text
?test=ets2024-t3
```

Không hard-code một title duy nhất trong `reading.html`.

Browser title có thể là:

```text
[READING_CONFIG.title] · TOEIC EVERYDAY
```

---

## 18. Shared Reading UI

Phải tương thích:

- Part 5 / 6 / 7 tabs
- Question Palette
- Mark ★
- Làm lại bài
- Trang chủ
- Đăng xuất
- localStorage
- independent scroll
- resizer
- responsive mobile
- compact Explanation
- source-doc rendering
- bottom set navigation

Không tạo UI riêng cho từng đề.

---

## 19. `tests.json`

Chỉ list Test đã publish.

Ví dụ:

```json
{
  "id": "ets2026-t3",
  "year": 2026,
  "test": 3,
  "listening": true,
  "reading": true
}
```

Không tạo placeholder nếu không được yêu cầu.

---

## 20. Loader/path

URL:

```text
/shared/reading/reading.html?test=ets2026-t3
```

Loader tìm:

```text
../../tests/ets2026-t3/reading/config.js
../../tests/ets2026-t3/reading/data.js
../../tests/ets2026-t3/reading/explanation-fixes.js
```

Không tạo:

```text
tests/ets2026-t3/ets2026-t3/reading/
```

Đúng:

```text
tests/ets2026-t3/reading/
```

---

## 21. Validation

Trước khi xuất phải kiểm tra:

- đúng năm
- đúng Test
- nguồn thật sự khớp năm/Test được yêu cầu
- đủ Q101–200
- không trùng số câu
- Part 5 = 30 câu
- Part 6 = 16 câu
- Part 7 = 54 câu
- grouping Part 6 đúng
- grouping Part 7 đúng
- choices đúng thứ tự
- answers đúng key
- passage đầy đủ
- không thiếu table/email/notice/message
- không assets thừa
- explanation đầy đủ khi cần
- explanation tự viết phải khớp key
- storageKey duy nhất
- title đúng
- tương thích `shared/reading`
- package không chứa shared files thừa

---

## 22. Kiểm tra mismatch nguồn

Trước khi build phải xác minh:

- booklet
- answer key
- solution file
- năm/Test được yêu cầu

có cùng một Test hay không.

Nếu nguồn thực tế là năm/Test khác:

- không âm thầm relabel
- phải báo mismatch
- chỉ build theo nguồn thật nếu giáo viên xác nhận
- nếu không thì yêu cầu nguồn đúng

---

## 23. Prompt ngắn chuẩn

```text
Tạo ETS 2026 Reading Test 3 theo ETS_READING_SPEC.md.

Nguồn đính kèm:
- đề
- answer key
- file giải nếu có

Yêu cầu:
- giữ nguyên English
- passage Part 6/7 dựng bằng HTML/text trong data.js
- không dùng assets nếu không cần
- nếu không có explanation thì tự viết explanation theo key
- kiểm tra đủ Q101–200

Tạo đúng:
tests/ets2026-t3/reading/

Không tạo lại shared/reading.
```

---

## 24. Quy tắc cuối

Nếu prompt là:

```text
ETS ... Reading Test ...
```

thì dùng Full ETS Reading spec này.

Không áp dụng Practice Unit, folder `units/` hoặc số Exercise linh hoạt.
