# 每周总结可以写在这里


## Animation
- animation-name 时间曲线
- animation-duration 动画的时长
- animation-timing-function 动画的时间曲线
- animation-delay 动画开始前的延迟
- animation-iteration-count 动画播放次数
- animation-direction 动画方向

## Transition
- transition-property 要变换的属性
- transition-duration 变换的时长
- transition-timing-function 时间曲线
- transition-delay 延迟

## 操作DOM

- appendChild
- insertBefore
- removeChild
- replaceChild

所有的 DOM 元素默认只有一个父元素，不能两次被插入到 DOM trees 中，同一个节点先插入到 DOM trees 中 A 位置，再插入到 B 位置，会默认从 A 位置 remove 掉。

childNodes 是一个 living Collection，执行 removeChild 或者其他修改操作后，childNodes 会实时改变。

- compareDocumentPosition 是一个用于比较两个节点中关系的函数。
- contains 检查一个节点是否包含另一个节点的函数。
- isEqualNode 检查两个节点是否完全相同。
- isSameNode 检查两个节点是否是同一个节点.
- cloneNode 复制一个节点，如果传入参数为 true时，则会连同子元素做深拷贝。


## Events
- addEventListener  添加时间监听
  
  参数:
    event: 字符串，指定事件名。
    function: 指定要事件触发时执行的函数,也可以是个  具有 handleEvent 方法的JavaScript对象。
    useCapture: 指定事件是否在捕获或冒泡阶段执行。 true - 事件句柄在捕获阶段执行  false - 默认。事件句柄在冒泡阶段执行。