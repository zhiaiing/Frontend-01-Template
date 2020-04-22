# 每周总结可以写在这里

### 乔姆斯基谱系

- 0型 无限制语法

- 1型 上下文相关文法

- 2型 上下文无关文法

- 3型 正则文法

###  产生式（BNF）

    用尖括号括起来的名称来表示语法结构名
    语法结构分成基础结构和需要用其他语法结构定义的复合结构
    基础结构称终结符
    复合结构称非终结符
    引号和中间的字符表示终结符
    可以有括号
    *表示重复多次
    |表示或
    +表示至少一次

### 图灵完备性

    图灵完备性
        命令式——图灵机
            goto 
            if 和 while
        声明式——lambda
        递归

### 动态语言与静态语言
    动态语言：
        在用户的设备/在线服务器上
        产品实际运行时
        Run time
    静态语言：
        在程序员的设备上
        产品开发时
        Compile time

### 类型系统
    动态类型系统与静态类型系统
    强类型与弱类型

### 一般命令式编程语言构成
    Atom
        Identifier
        Literal
    Expression
        Atom
        Operator
        Punctuator
    Statement
        Expression
        Keyword
    Structure
        Function
        Class
        Process
        Namespace
    Program
        Mould
        Package
        Library