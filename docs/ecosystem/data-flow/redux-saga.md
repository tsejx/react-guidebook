---
nav:
  title: 生态
  order: 3
group:
  title: 数据流
  order: 3
title: React Saga
order: 4
---

# Redux Saga

Redux Saga 是一个 Redux 中间件，用来帮你管理程序的副作用。或者更直接一点，主要是用来处理异步 action。

Redux 中间件说白了就是在 action 被传递到 reducer 之前新进行了一次拦截，然后启动异步任务，等异步任务执行完成后再发送一个新的 action，调用 reducer 修改状态数据。

左边的蓝圈圈里就是一堆 saga，它们需要和外部进行异步 I/O 交互，等交互完成后再修改 Store 中的状态数据。redux-saga 就是一个帮你管理这堆 saga 的管家，那么它跟其他的中间件实现有什么不同呢？它使用了 ES6 中 Generator 函数语法。

可以看到，Generator 函数的写法基本上和同步调用完全一样了，唯一的区别是 function 后面有个星号，另外函数调用之前需要加上一个 yield 关键字。

---

**参考资料：**

- [redux-saga 化异步为同步](https://mp.weixin.qq.com/s?__biz=MzA4NjcyMDYzMg==&mid=2451805550&idx=1&sn=84c84d73789b960f845515d701a6e0d2&chksm=88135c79bf64d56fb27009192ec3d724645a1d375b9006b7c09bad0a2aa1a3446f823e90d928&scene=0&xtrack=1)

https://chenyitian.gitbooks.io/redux-saga/content/

https://redux-saga-in-chinese.js.org/

https://www.bookstack.cn/read/redux-saga-in-chinese/README.md
