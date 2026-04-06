const apiKey = 'AIzaSyBzypcV38ndsiHaw_uIiZJN99hxW66WXBU'; 
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
  method:'POST', 
  headers:{'Content-Type':'application/json'}, 
  body: JSON.stringify({
    contents:[{
      parts:[{
        text: 'Hãy tạo một bộ đề thi trắc nghiệm gồm 1 câu hỏi cho môn Toán, khối lớp 10. Yêu cầu trả về DUY NHẤT một mảng JSON các đối tượng có cấu trúc sau:\n{\n  "question_text": "nội dung câu hỏi",\n  "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],\n  "correct_option": "A",\n  "explanation": "giải thích"\n}\nĐảm bảo không thêm bất kỳ văn bản nào khác.'
      }]
    }]
  })
}).then(r => r.json()).then(d => {
  if (d.candidates && d.candidates[0]) {
    console.log("✅ Thành công:", d.candidates[0].content.parts[0].text);
  } else {
    console.log("❌ Lỗi API:", JSON.stringify(d, null, 2));
  }
}).catch(console.error);
