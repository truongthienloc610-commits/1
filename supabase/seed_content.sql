-- Seed data for EduAI Roadmaps and Steps
-- Execute this in your Supabase SQL Editor

-- 1. Insert Roadmaps
INSERT INTO edu_roadmaps (id, title, description, role_type) VALUES
  ('4b1842f4-7e9b-449e-8c8c-1e663a8a3c01', 'Lập trình là gì?', 'Dành cho người mới bắt đầu từ con số 0.', 'basics'),
  ('4b1842f4-7e9b-449e-8c8c-1e663a8a3c02', 'Frontend Developer', 'Xây dựng giao diện web đẹp mắt với HTML/CSS/JS.', 'frontend'),
  ('4b1842f4-7e9b-449e-8c8c-1e663a8a3c03', 'Backend Developer', 'Xử lý logic, database và server-side.', 'backend'),
  ('4b1842f4-7e9b-449e-8c8c-1e663a8a3c04', 'Data Analyst', 'Phân tích dữ liệu và tìm kiếm thông tin hữu ích.', 'data')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  role_type = EXCLUDED.role_type;

-- 2. Insert Steps for "Basics"
INSERT INTO edu_roadmap_steps (id, roadmap_id, title, description, theory_markdown, video_url, order_index) VALUES
  (gen_random_uuid(), '4b1842f4-7e9b-449e-8c8c-1e663a8a3c01', 'Tổng quan về lập trình', 'Hiểu lập trình là gì và tại sao nó lại quan trọng.', 
  '### Lập trình là gì?
Lập trình là quá trình tạo ra các hướng dẫn để máy tính thực hiện. Nó giống như việc viết một bản hướng dẫn nấu ăn, nhưng thay vì cho người, bạn đang viết cho máy tính.

**Tại sao nên học lập trình?**
1. **Giải quyết vấn đề**: Giúp bạn có tư duy logic tốt hơn.
2. **Cơ hội nghề nghiệp**: Nhu cầu nhân lực ngành IT luôn rất cao.
3. **Sáng tạo**: Bạn có thể tự tay tạo ra website, ứng dụng của riêng mình.

> [!TIP]
> Đừng cố gắng hiểu tất cả mọi thứ ngay từ đầu. Hãy bắt đầu bằng sự tò mò và kiên trì.', 
  'zshC8pXp8M0', 1),

  (gen_random_uuid(), '4b1842f4-7e9b-449e-8c8c-1e663a8a3c01', 'Cài đặt môi trường', 'Chuẩn bị "vũ khí" để bắt đầu chiến đấu.', 
  '### Công cụ cần thiết
Để lập trình website, bạn cần 2 thứ cơ bản nhất:
1. **Trình duyệt (Browser)**: Chrome, Edge hoặc Firefox để xem kết quả.
2. **Trình soạn thảo mã nguồn (Code Editor)**: **Visual Studio Code (VS Code)** là lựa chọn số 1 hiện nay.

**Các bước cài đặt VS Code:**
1. Truy cập [code.visualstudio.com](https://code.visualstudio.com/).
2. Tải bản phù hợp với máy tính của bạn (Windows/Mac).
3. Cài đặt và mở nó lên.

**Extension khuyên dùng:**
- Vietnamese Language Pack (nếu bạn muốn dùng tiếng Việt).
- Live Server (để xem thay đổi ngay lập tức).', 
  'Vv_7X_uIDiM', 2),

  (gen_random_uuid(), '4b1842f4-7e9b-449e-8c8c-1e663a8a3c01', 'HTML - Khung xương Website', 'Bài học về thẻ và cấu trúc trang web.', 
  '### HTML là gì?
HTML (HyperText Markup Language) không phải là ngôn ngữ lập trình, nó là **ngôn ngữ đánh dấu văn bản**.

**Cấu trúc một thẻ HTML:**
`<tagname>Nội dung</tagname>`

**Các thẻ quan trọng:**
- `<h1>` đến `<h6>`: Tiêu đề.
- `<p>`: Đoạn văn bản.
- `<a>`: Đường dẫn (Link).
- `<img>`: Hình ảnh.
- `<div>`: Khối nội dung.

> [!IMPORTANT]
> Mọi trang web trên thế giới đều bắt đầu từ HTML.', 
  '8mKZSjI079A', 3);

-- 3. Insert Steps for "Frontend"
INSERT INTO edu_roadmap_steps (id, roadmap_id, title, description, theory_markdown, video_url, order_index) VALUES
  (gen_random_uuid(), '4b1842f4-7e9b-449e-8c8c-1e663a8a3c02', 'Lộ trình Frontend 2024', 'Hướng đi cho người muốn trở thành Frontend chuyên nghiệp.', 
  '### Frontend là gì?
Frontend là tất cả những gì người dùng nhìn thấy và tương tác trên website: màu sắc, nút bấm, menu, hiệu ứng...

**Ba chân kiềng của Frontend:**
1. **HTML**: Nội dung.
2. **CSS**: Giao diện.
3. **JavaScript**: Logic & tương tác.

Trong lộ trình này, EduAI sẽ dẫn dắt bạn đi từ cơ bản đến khi làm chủ các Framework hiện đại như React.', 
  'jE_tnt1l76s', 1),

  (gen_random_uuid(), '4b1842f4-7e9b-449e-8c8c-1e663a8a3c02', 'CSS Flexbox & Grid', 'Làm chủ bố cục website hiện đại.', 
  '### Tại sao cần Flexbox & Grid?
Ngày xưa, việc căn chỉnh các phần tử rất khó khăn. Hiện nay, chúng ta có 2 "siêu vũ khí":
- **Flexbox**: Tốt cho việc sắp xếp các phần tử thành hàng hoặc cột (1 chiều).
- **Grid**: Tốt cho việc xây dựng bố cục toàn trang phức tạp (2 chiều).

**Thuộc tính Flexbox cơ bản:**
- `display: flex;`
- `justify-content: center;` (Căn giữa ngang)
- `align-items: center;` (Căn giữa dọc)', 
  '7X9A5E2XfA4', 2);
