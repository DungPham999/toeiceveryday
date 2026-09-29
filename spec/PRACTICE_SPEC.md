# TOEIC EVERYDAY — PRACTICE UNIT SPEC

## 1. Mục đích

File này là quy chuẩn chính thức để tạo **PRACTICE UNIT** cho TOEIC EVERYDAY.

PRACTICE UNIT **không phải Full ETS Test**.

Practice dùng cho các bài luyện linh hoạt theo Unit, ví dụ:

- `Pre_Lis 1`
- `Pre_Lis 2`
- `A_Lis 1`
- `A_Read 1`
- `A_Read 2`

Practice phải theo hướng **data-driven**: shared template ổn định; khi thêm/sửa Unit mới chủ yếu chỉ thay `data.js` và assets cần thiết.

---

## 2. Phân biệt với Full ETS

Practice Unit luôn nằm trong:

```text
units/
```

Full ETS luôn nằm trong:

```text
tests/
```

Practice Unit:

- không cố định số Exercise
- không cố định số câu
- không cố định thứ tự Part
- có thể có nhiều Exercise cùng một Part
- số câu theo đúng nguồn
- không ép cấu trúc 100 câu Listening hoặc 100 câu Reading
- không sửa shared template cho từng Unit nếu không thật sự cần

---

## 3. Shared Practice template

```text
shared/
├── auth/
│   └── auth.js
├── practice-listening/
│   ├── practice.html
│   ├── loader.js
│   ├── app.js
│   └── style.css
└── practice-reading/
    ├── practice.html
    ├── loader.js
    ├── app.js
    └── style.css
```

Khi tạo Unit mới:

**Không tạo lại hoặc ghi đè shared template, trừ khi giáo viên yêu cầu thay đổi template.**

---

## 4. Authentication

Practice dùng chung hệ thống mật khẩu hiện tại của TOEIC EVERYDAY.

Không tạo password riêng cho Practice.

Shared Practice page phải dùng cùng `shared/auth/auth.js`.

---

# A. PRACTICE LISTENING

## 5. Cấu trúc tổng quát

Một Unit có thể có nhiều Exercise.

Ví dụ:

```text
A_Lis 1

Exercise 1 → Part 1
Exercise 2 → Part 1
Exercise 3 → Part 3
Exercise 4 → Part 3
```

Mỗi Exercise có thể có **1 file audio riêng chứa nhiều câu hoặc nhiều set**.

Ví dụ:

```text
units/
└── a-lis-1/
    ├── data.js
    └── assets/
        ├── audio/
        │   ├── ex01.mp3
        │   ├── ex02.mp3
        │   └── ex03.mp3
        └── images/
            ├── q01.jpg
            ├── q02.jpg
            └── ...
```

Không tự chia audio thành nhiều file nhỏ nếu không cần.

---

## 6. Nguồn đầu vào Listening

Có thể gồm:

- đề PDF / Word / ảnh
- answer key
- tapescript
- explanation
- audio của từng Exercise
- graphic/ảnh đã nằm trong đề

Tapescript và explanation có thể nằm chung trong một file.

Nếu graphic/ảnh đã có trong đề, tự lấy từ đề khi cần; không yêu cầu giáo viên gửi lại ảnh riêng.

---

## 7. Output Listening

Thông thường:

```text
units/[UNIT-ID]/
├── data.js
└── assets/
    ├── audio/
    └── images/   # chỉ khi cần
```

Quy ước:

- không tạo `config.js` nếu không cần
- không tạo `audio-times.js` riêng
- timestamp nằm trực tiếp trong `data.js`
- không tạo title/subtitle phức tạp nếu không cần
- `storageKey`: `practice-[UNIT-ID]`

Ví dụ:

```text
practice-a-lis-1
```

---

## 8. Listening Part 1

- mỗi câu xử lý riêng
- mỗi câu phát đúng đoạn audio của câu đó bằng timestamp
- có Play/Pause
- có thanh seek/progress
- có nút quay lại 3 giây
- có chỉnh tốc độ
- hiện ảnh câu hỏi
- chọn đáp án xong chấm ngay
- hiện đúng/sai ngay
- hiện đáp án đúng
- hiện tapescript
- hiện explanation nếu có
- vẫn cho nghe lại sau khi trả lời

Không giả định Part 1 luôn có 6 câu.

---

## 9. Listening Part 2

- mỗi câu xử lý riêng
- mỗi câu phát đúng đoạn audio bằng timestamp
- có Play/Pause
- có seek/progress
- có quay lại 3 giây
- có chỉnh tốc độ
- thường có A/B/C nhưng theo đúng nguồn
- chọn đáp án xong chấm ngay
- hiện đáp án đúng
- hiện tapescript
- hiện explanation nếu có

Không giả định Part 2 luôn có 25 câu.

---

## 10. Listening Part 3

- giữ đúng set conversation của nguồn
- thường 3 câu/set nhưng không hard-code nếu nguồn khác
- mỗi set phát đúng đoạn audio của set bằng timestamp
- có Play/Pause, seek, quay lại 3 giây, speed
- nếu set có graphic thì hiển thị graphic
- học viên làm đủ câu trong set
- sau đó bấm **Check**
- chỉ sau Check mới:
  - chấm set
  - hiện đáp án
  - hiện tapescript
  - hiện explanation

Không chấm từng câu ngay trước khi Check.

---

## 11. Listening Part 4

Giống Part 3:

- giữ đúng set talk của nguồn
- audio theo set
- graphic nếu có
- làm đủ câu rồi bấm Check
- sau Check mới hiện đáp án, tapescript, explanation

Không giả định số set cố định.

---

## 12. Timestamp

Mỗi Exercise có thể dùng một file audio dài.

Timestamp phải nằm trong `data.js`.

Ví dụ Part 1:

```javascript
{
  number: 1,
  start: 3.20,
  end: 12.85,
  image: "assets/images/q01.jpg",
  choices: ["A", "B", "C", "D"],
  answer: 1,
  script: [
    "(A) ...",
    "(B) ...",
    "(C) ...",
    "(D) ..."
  ],
  explanation: "..."
}
```

Ví dụ Part 3:

```javascript
{
  id: "set-01",
  start: 4.10,
  end: 37.80,
  script: [
    "M: ...",
    "W: ...",
    "M: ..."
  ],
  questions: [
    {
      number: 1,
      prompt: "Why is the man calling?",
      choices: ["...", "...", "...", "..."],
      answer: 1,
      explanation: "..."
    }
  ]
}
```

Phải kiểm tra timestamp với audio thật.

---

## 13. Data model Listening

```javascript
window.PRACTICE_DATA = {

  storageKey: "practice-a-lis-1",

  sections: [

    {
      label: "Part 1",
      exercises: [
        {
          id: "exercise-1",
          label: "Exercise 1",
          part: 1,
          audio: "assets/audio/ex01.mp3",
          questions: [
            // ...
          ]
        }
      ]
    },

    {
      label: "Part 3",
      exercises: [
        {
          id: "exercise-2",
          label: "Exercise 2",
          part: 3,
          audio: "assets/audio/ex02.mp3",
          sets: [
            // ...
          ]
        }
      ]
    }

  ]

};
```

Template phải dựa vào `part` để tự chọn cách hiển thị/chấm.

---

## 14. Tapescript và explanation Listening

- tapescript là nội dung ưu tiên nếu nguồn có
- explanation không bắt buộc
- nếu tapescript và explanation ở chung file, tách đúng phần
- giữ nguyên English của tapescript
- không tự bịa tapescript
- nếu nguồn không có explanation thì có thể chỉ hiện tapescript sau khi chấm

---

# B. PRACTICE READING

## 15. Cấu trúc tổng quát

Ví dụ:

```text
A_Read 2

Exercise 1 → Part 5 → Active / Passive
Exercise 2 → Part 5 → Active / Passive
Exercise 3 → Part 7 → Single Passage
Exercise 4 → Part 7 → Double Passage
```

Số Exercise và số câu theo đúng nguồn.

---

## 16. Nguồn đầu vào Reading

Có thể gồm:

- đề PDF / Word / ảnh
- answer key
- file explanation nếu có

Nếu không có explanation, được phép tự viết explanation theo quy tắc bên dưới.

---

## 17. Output Reading

Thông thường:

```text
units/[UNIT-ID]/
└── data.js
```

Ưu tiên **không dùng assets cho Reading**.

Part 6/7 nên dựng trực tiếp bằng HTML/text trong `data.js`:

- email
- notice
- ad
- schedule
- text message
- form
- menu
- webpage
- table
- letter
- article

Chỉ dùng ảnh khi yếu tố hình ảnh thật sự cần thiết và không thể dựng hợp lý bằng HTML/text.

---

## 18. Reading Part 5

- mỗi câu độc lập
- chọn đáp án xong chấm ngay
- hiện đúng/sai
- hiện đáp án đúng
- hiện explanation ngay

Không ép đúng 30 câu.

---

## 19. Reading Part 6

- giữ đúng passage và grouping của nguồn
- học viên làm đủ câu trong set
- bấm **Check**
- sau Check mới:
  - chấm set
  - hiện đáp án
  - hiện explanation
- không làm mất vị trí scroll khi chọn đáp án

Không ép đúng 4 set.

---

## 20. Reading Part 7

- giữ đúng single/double/triple passage
- desktop:
  - passage trái
  - questions phải
  - hai bên cuộn độc lập
  - thanh kéo chỉnh độ rộng nếu template có
- mobile: một cột responsive
- làm đủ câu của set rồi Check
- sau Check mới hiện đáp án và explanation
- có:
  - Set trước
  - Set tiếp
  - Question Palette
  - Mark ★
- chọn đáp án không được làm pane câu hỏi nhảy lên đầu

---

## 21. Quy tắc explanation Reading

### Nếu có file giải

Ưu tiên explanation từ file giải.

- giữ đúng lập luận của nguồn
- được rút gọn/format lại nhưng không đổi nghĩa

### Nếu chỉ có answer key

Được phép tự viết explanation bằng kiến thức tiếng Anh chuyên nghiệp.

Part 5 có thể giải thích:

- word form
- part of speech
- tense
- active/passive
- subject–verb agreement
- preposition
- conjunction
- relative clause
- pronoun
- comparison
- collocation
- vocabulary
- sentence structure

Part 6/7:

- dựa vào bằng chứng trong passage
- chỉ ra câu/ý liên quan
- không bịa bằng chứng

Answer key giáo viên cung cấp là chuẩn.

Nếu nghi key có vấn đề:

- không tự đổi key
- vẫn giữ key trong data
- báo riêng câu đáng nghi để giáo viên kiểm tra

---

## 22. Data model Reading

```javascript
window.PRACTICE_DATA = {

  storageKey: "practice-a-read-2",

  sections: [

    {
      label: "Active / Passive",

      exercises: [
        {
          id: "exercise-1",
          label: "Exercise 1",
          part: 5,

          questions: [
            {
              number: 1,
              prompt: "...",
              choices: ["...", "...", "...", "..."],
              answer: 1,
              explanation: "..."
            }
          ]
        }
      ]
    },

    {
      label: "Part 7",

      exercises: [
        {
          id: "exercise-2",
          label: "Exercise 2",
          part: 7,

          sets: [
            {
              id: "set-01",
              passageHtml: `
                <div class="source-doc">
                  ...
                </div>
              `,
              questions: [
                {
                  number: 10,
                  prompt: "...",
                  choices: ["...", "...", "...", "..."],
                  answer: 2,
                  explanation: "..."
                }
              ]
            }
          ]
        }
      ]
    }

  ]

};
```

---

# C. SHARED PRACTICE UX

## 23. Tính năng chung

Practice template nên có:

- Question Palette
- Mark Question ★
- Reset / Làm lại
- Trang chủ
- Đăng xuất
- lưu tiến độ bằng `localStorage`
- responsive desktop/mobile
- không hard-code title Unit
- không giả định số câu cố định
- giữ scroll khi chọn đáp án
- hiển thị đúng nội dung nguồn

---

## 24. Title và label

Giữ đơn giản.

Có thể dùng:

```javascript
label: "Exercise 1"
```

hoặc:

```javascript
label: "Active / Passive"
```

Nếu không có title/subtitle thì trang vẫn phải chạy.

Không tạo thêm config chỉ để trang trí tiêu đề.

---

## 25. Validation trước khi xuất

Phải kiểm tra:

- đủ tất cả Exercise
- đúng Part của từng Exercise
- không thiếu câu
- không trùng câu
- choices đúng thứ tự nguồn
- key đúng
- Part 1/2 dùng timestamp theo từng câu
- Part 3/4 dùng timestamp theo từng set
- audio path hợp lệ
- timestamp không vượt duration
- image/graphic cần thiết có đủ
- tapescript đúng nguồn
- explanation theo nguồn nếu có
- explanation tự viết Reading phải khớp key
- passage Reading đầy đủ
- không có assets thừa
- storageKey không trùng Unit khác

---

## 26. Prompt ngắn — Listening Practice

```text
Tạo PRACTICE UNIT LISTENING: Pre_Lis 2

Unit ID: pre-lis-2

Cấu trúc:
- Exercise 1: Part 2
- Exercise 2: Part 2
- Exercise 3: Part 2

Nguồn đính kèm:
- Đề
- Key + tapescript/giải thích
- Audio Exercise 1–3

Làm theo PRACTICE_SPEC.md hiện tại.
Tạo data.js và assets cần thiết để tôi upload lên web.
```

---

## 27. Prompt ngắn — Reading Practice

```text
Tạo PRACTICE UNIT READING: A_Read 2

Unit ID: a-read-2

Cấu trúc:
- Exercise 1: Part 5 – Active/Passive
- Exercise 2: Part 5 – Active/Passive
- Exercise 3: Part 7

Nguồn đính kèm:
- Đề
- Answer key
- File giải thích (nếu có)

Làm theo PRACTICE_SPEC.md hiện tại.
Nếu nguồn không có explanation, tự viết explanation dựa trên key và kiến thức tiếng Anh chuyên nghiệp.
Tạo data.js để tôi upload lên web.
```

---

## 28. Quy tắc cuối

Nếu prompt bắt đầu bằng:

```text
Tạo PRACTICE UNIT ...
```

thì xử lý theo file này.

Không áp dụng số câu cố định, cấu trúc Full ETS hoặc folder `tests/`.
