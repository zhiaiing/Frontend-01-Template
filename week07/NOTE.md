# 每周总结可以写在这里

### 排版(flex布局)
  收集元素进行
    根据主轴尺寸，把元素分进行
  计算主轴
    找出所有 flex 元素 把主轴方向的剩余尺寸按比例分配给这些元素若剩余空间为负数，所有 flex 元素为 0， 等比压缩剩余元素
  计算交叉轴
    根据每一行中最大元素尺寸计算行高
    根据行高 flex-align 和 item-align, 确定元素具体位置
    
### 绘制(images  npm install images)
    let viewport = images(800, 600);(画布)
    render(viewport, dom);(渲染dom)
    
## 重学CSS    
  CSS 语法的研究
    CSS 2.1 的语法
      https://www.w3.org/TR/css-syntax-3/
      https://www.w3.org/TR/CSS21/grammar.html#q25.0
    CSS 总体结构
      @charset
      @import
      rules
        @media
        @page
        rule
  CSS @规则
    @charset: https://www.w3.org/TR/css-syntax-3/
    @import: https://www.w3.org/TR/css-cascade-4/
    @media: https://www.w3.org/TR/css3-conditional/
    @page: https://www.w3.org/TR/css-page-3/
    @counter-style: https://www.w3.org/TR/css-counter-styles-3
    @keyframes: https://www.w3.org/TR/css-animations-1/
    @fontface: https://www.w3.org/TR/css-fonts-3/
    @supports: https://www.w3.org/TR/css3-conditional/
    @namespace: https://www.w3.org/TR/css-namespaces-3/
  CSS 规则的结构
    CSS 规则
      Selector
        https://www.w3.org/TR/selectors-3/
        https://www.w3.org/TR/selectors-4/
      Key
        Properties
        variables: https://www.w3.org/TR/css-variables/
      Value https://www.w3.org/TR/css-values-4/