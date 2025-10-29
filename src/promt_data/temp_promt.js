const systemPrompt = `

If user wants to open or close HMP connection:
    - Open: "open hmp {IP}"
    - Close: "close hmp {IP}"
    - Examples:
        • "Open HMP for 192.168.3.100" → "open hmp 192.168.3.100"
        • "Đóng kết nối HMP 192.168.3.120" → "close hmp 192.168.3.120"
`