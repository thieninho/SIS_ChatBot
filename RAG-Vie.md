# 📘 Retrieval-Augmented Generation (RAG)

---

## 🇻🇳 Giới thiệu (Tiếng Việt)

### 1. RAG là gì?
RAG (Retrieval-Augmented Generation) là kỹ thuật kết hợp **mô hình ngôn ngữ lớn (LLM)** với **cơ sở dữ liệu ngoài** để tạo ra câu trả lời chính xác, cập nhật và đáng tin cậy.  
Thay vì chỉ dựa vào kiến thức đã được huấn luyện, RAG cho phép AI **tìm kiếm thông tin liên quan** và sử dụng nó để bổ sung cho câu trả lời.

### 2. Cách hoạt động
1. Người dùng đặt câu hỏi.  
2. Retriever tìm các tài liệu liên quan trong cơ sở dữ liệu (thường dùng vector search).  
3. Thông tin tìm được được ghép vào prompt (augmentation).  
4. LLM sinh câu trả lời dựa trên **context + câu hỏi gốc**.  

### 3. Thành phần chính
- **Vector Database** – Lưu trữ dữ liệu dưới dạng embedding.  
- **Retriever** – Tìm kiếm đoạn văn bản phù hợp nhất.  
- **Prompt Augmentation** – Ghép context vào prompt trước khi gửi cho LLM.  
- **LLM Generator** – Sinh câu trả lời tự nhiên cho người dùng.  

### 4. Ưu và nhược điểm
- ✅ Ưu điểm: cập nhật kiến thức động, giảm bịa đặt, dễ mở rộng.  
- ❌ Nhược điểm: pipeline phức tạp hơn, phụ thuộc vào chất lượng retriever.  

### 5. Ứng dụng
- Chatbot tư vấn sản phẩm/dịch vụ.  
- Trợ lý tìm kiếm nội bộ (FAQ, hướng dẫn, log).  
- Thông tin thay đổi thường xuyên (tin tức, tài liệu kỹ thuật).  

### 6. Ví dụ Flow
> "Làm sao reset thiết bị M220X?"  
→ Retriever tìm hướng dẫn trong tài liệu PDF.  
→ Augment vào prompt.  
→ LLM trả lời: *"Nhấn giữ nút X trong 10 giây cho đến khi đèn LED nhấp nháy."*  

### 7. Khi nào nên dùng RAG?
- Khi dữ liệu cần **liên tục cập nhật**.  
- Khi muốn **LLM hiểu dữ liệu nội bộ** (manual, log, ticket).  
- Khi cần **câu trả lời có nguồn gốc rõ ràng**.