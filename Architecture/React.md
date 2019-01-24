## React

### 专注视图层

* 非完整 MVC / MVVM 框架
* 不仅包括专注于 View 层的问题，又是一个包括 View 和 Controller 的库
* 没有提供复杂的 API，以 Minimal API Interface 为目标

### Virtual DOM

每次数据更新后，重新计算 Virtual DOM，并和上一次生成的 Virtual DOM 做对比，对发生变化的部分做**批量更新**。React 也提供了直观的 **shouldComponentUpdate** 生命周期回调，来减少数据变化后不必要的 Virtual DOM 对比过程，以保证性能。 

### 函数式编程

`命令式 => 声明式编程（函数式编程）`

