# 每周总结可以写在这里
找出 JavaScript 标准里所有的对象，分析有哪些对象是我们无法实现出来的，这些对象都有哪些特性？

Array 
    newLength > length 用空扩充数组
    newLength < length 截取数组

String 
    string的length是non-writable 和non-configurable的。

Arguments 
    [[callee]] 视为函数参数对对象，伪数组 caller

Function
    [[call]] 视为函数Function
    [[Construct]] 可以被new 操作符调用，根据new的规则返回对象

Object
    [[Get]] property被访问时调用 get
    [[Set]] property被赋值时调用 set
    [[GetPrototypeOf]] 对应getPrototypeOf方法 获取对象原型
    [[SetPrototypeOf]] 对应setPrototypeOf方法 设置对象原型
    [[GetOwnProperty]] getOwnPropertyDescriptor 获取对象私有属性的描述列表
    [[HasProperty]] hasOwnProperty 私有属性判断
    [[IsExtensible]] isExtensible对象是否可扩展
    [[PreventExtensions]] preventExtension控制对象是否可以添加属性
    [[DefineOwnProperty]] defineProperty 定义对象属性
    [[Delete]] delete 操作符
    [[OwnPropertyKeys]] Object.keys() Object.entries() Object.values()
    [[Call]] 能够调用call

Module Namespece
    [[Module]] 视为一个引入的模块 
    [[Exports]] 视为一个导出的模块