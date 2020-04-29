# 写一个正则表达式 匹配所有 Number 直接量

### 最终结果:
    /^[-+]?(\.\d+|(0|[1-9]\d*)\.?\d*?)([eE][-\+]?\d+)?$|^[-+]?0[bB][01]+$|^[-+]?0[oO][0-7]+$|^[-+]?0[xX][0-9a-fA-F]+$/

#### 二进制
    /^0[bB][01]+$/

### 八进制
    /^0[oO][0-7]+$/

### 十进制
    /^(0|[1-9]\d*?)([eE][-\+]?\d+)?$/

### 十六进制
    /^0[xX][0-9a-fA-F]+$/

### 浮点数
    /^(\.\d+|(0|[1-9]\d*)\.?\d*?)(\d+)?$/