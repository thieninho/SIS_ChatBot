### 1. What is RAG?
RAG (Retrieval-Augmented Generation) is a technique that combines **large language models (LLMs)** with **external data sources** to generate accurate, up-to-date, and reliable answers.  
Instead of relying solely on pre-trained knowledge, RAG enables AI to **retrieve relevant information** and use it to enhance the response.

### 2. How It Works
1. User asks a question.  
2. Retriever searches for relevant documents in the database (via vector search).  
3. Retrieved information is inserted into the prompt (augmentation).  
4. LLM generates an answer based on **context + original query**.  

### 3. Key Components
- **Vector Database** – Stores data in embedding format.  
- **Retriever** – Finds the most relevant text chunks.  
- **Prompt Augmentation** – Injects context into the prompt before sending to LLM.  
- **LLM Generator** – Produces a natural language answer for the user.  

### 4. Pros & Cons
- ✅ Pros: dynamic knowledge update, reduced hallucination, scalable.  
- ❌ Cons: more complex pipeline, dependent on retriever quality.  

### 5. Applications
- Product/service support chatbots.  
- Internal search assistants (FAQs, manuals, logs).  
- Frequently updated information (news, technical docs).  

### 6. Example Flow

Example:  
> "How to reset M220X device?"  
→ Retriever finds reset instructions in PDF.  
→ Augments into prompt.  
→ LLM answers: *"Hold button X for 10 seconds until the LED blinks."*  

### 7. When to Use RAG?
- When data must be **continuously updated**.  
- When you want **LLM to understand internal data** (manuals, logs, tickets).  
- When **answers must be grounded in sources**.  

---
