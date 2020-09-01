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

`redux-saga` 是一个用于管理 Redux 应用异步操作（Side Effects 异步操作）的中间件。`redux-saga` 通过创建 Sagas 将所有的异步操作逻辑收集在一个地方集中处理，可以用来代替 `redux-thunk` 中间件。

这意味着应用的逻辑会存在两个地方：

- Reducers 负责处理 `action` 的 `state` 更新
- Sagas 负责协调那些复杂或异步的操作

Sagas 是通过 Generator 函数来创建的。如果你还不熟悉 Generator，可以在这里找到 一些有用的链接。

Sagas 不同于 Thunks，Thunks 是在 `action` 被创建时调用，而 Sagas 只会在应用启动时调用（但初始启动的 Sagas 可能会动态调用其他 Sagas）。 Sagas 可以被看作是在后台运行的进程。Sagas 监听发起的 `action`，然后决定基于这个 `action` 来做什么：是发起一个异步调用（比如一个 AJAX 请求），还是发起其他的 `action` 到 Store，甚至是调用其他的 Sagas。

在 `redux-saga` 的世界里，所有的任务都通用 `yield` Effects 来完成（译注：Effect 可以看作是 `redux-saga` 的任务单元）。Effects 都是简单的 Javascript 对象，包含了要被 Saga `middleware` 执行的信息（打个比方，你可以看到 Redux `action` 其实是一个个包含执行信息的对象）。`redux-saga` 为各项任务提供了各种 Effect 创建器，比如调用一个异步函数，发起一个 `action` 到 Store，启动一个后台任务或者等待一个满足某些条件的未来的 `action`。

因为使用了 Generator，`redux-saga` 让你可以用 **同步的方式写异步代码**。就像你可以使用 `async/await` 函数所能做的一样。但 Generator 可以让你做一些 `async` 函数做不到的事情。

事实上 Sagas `yield` 普通对象的方式让你能容易地测试 Generator 里所有的业务逻辑，可以通过简单地迭代 `yield` 过的对象进行简单的单元测试。

此外，`redux-saga `启动的任务可以在任何时候通过手动取消，也可以把任务和其他的 Effects 放到 `race` 方法里以自动取消。

## 基本用法

1. 使用 `createSagaMiddleware` 方法创建 Saga 的 Middleware，然后在创建的 Redux 的 Store 时，使用 `applyMiddleware` 函数将创建的 Saga Middleware 实例绑定到 Store 上，最后可以调用 Saga Middleware 的 `run` 函数来执行某个或者某些 Middleware

2. 在 Saga 的 Middleware 中，可以使用 `takeEvery` 或者 `takeLatest` 等 API 来监听某个 `action`，当某个 `action` 触发后，`saga` 可以使用 `call` 发起异步操作，操作完成后使用 `put` 函数触发 `action`，同步更新 `state`，从而完成整个 State 的更新

**sagas.js**

```js
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import Api from './api'

// Worker Saga：将 USER_FETCH_REQUESTED action 被 dispatch 时调用
function * fetchUser(action) {
  try {
    const user = yield call(Api.fetchUser, action.payload.userId)
    yield put({ type: 'USER_FETCH_SUCCEEDED', user: user })
  } catch (err) {
    yield put({ type: 'USER_FETCH_FAILED, message: e.message' })
  }
}

// 在每个 USER_FETCH_REQUESTED action 被 dispatch 时调用 fetchUser
// 允许并发（即同时处理多个相同的 action）
function * saga () {
  yield takeEvery('USER_FETCH_REQUESTED', fetchUser);
}

// 也可以使用 takeLatest
// 不允许并发，disaptch 一个 USER_FETCH_REQUESTED action 时
// 如果在这之前已经有一个 USER_FETCH_REQUESTED action 在处理中
// 那么处理中的 action 会被取消，只会执行当前的
function * saga () {
  yield takeLatest('USER_FETCH_REQUESTED', fetchUser);
}

export default saga;
```

**main.js**

```js
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'

import reducer from './reducers'
import saga from './sagas'

// 创建 Redux Saga 中间件
const sagaMiddleware = createSagaMiddleware()

// 挂载在 Redux Store 上
const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleware)
)

// 执行 Saga
sagaMiddleware.run(saga)

// 渲染应用
```

## Effect

Sagas 都是 Generator 函数实现，可以用 `yield` 对 JavaScript 对象来表达 Saga 的逻辑，这些对象就是 Effect。

1. Sagas 都是用 Generator 函数实现的
2. 在 Generator 函数中，`yield` 右边的任何表达式都会被求值，结果会被 `yield` 给调用者
3. 用 `yield` 对 Effect（简单对象），进行解释执行
4. Effect 是一个简单的对象，这个对象包含了一些给 `middleware` 解释执行的信息。 你可以把 Effect 看作是发送给 `middleware` 的指令以执行某些操作（调用某些异步函数，发起一个 `action` 到 `store` 等等）

```js
// 官方例子
import { takeEvery } from 'redux-saga/effects'
import Api from './path/to/api'

// 监听如果有一个调用 PRODUCTS_REQUESTED 的 action 的话,就会匹配到第二个参数所代表的 effect
function* watchFetchProducts() {
  yield takeEvery('PRODUCTS_REQUESTED', fetchProducts)
}

// 执行，获取数据
// 使用 Generator 调用了 Api.fetch，在 Generator 函数中，yield 右面的任何表达式都会被求值，结果会被 yield 给调用者
function* fetchProducts() {
  const products = yield Api.fetch('/products')
  console.log(products)
}

// 第二种方式
import { call } from 'redux-saga/effects'
// call(fn, ...args) 这个函数。与前面的例子不同的是，现在我们不立即执行异步调用
// 相反，call 创建了一条描述结果的信息就像在 Redux 里你使用 action 创建器，创建一个将被 Store 执行的、描述 action 的纯文本对象
// call 创建一个纯文本对象描述函数调用。redux-saga middleware 确保执行函数调用并在响应被 resolve 时恢复 generator
function* fetchProducts() {
  const products = yield call(Api.fetch, '/products')
  // do something
}
```

## API

- Middleware API
  - `createSagaMiddleware(...sagas)`：创建 Redux 中间件，将 Sagas 与 Redux Store 简历连接
  - `middleware.run(saga, ...args)`：动态执行 Saga，用于 `applyMiddleware` 阶段之后执行 Sagas
- Saga Helpers 辅助函数（在 Effect 创建器的基础之上构建）
  - `takeEvery(pattern, saga, ...args)`：在发起 `action` 与 `pattern` 匹配时派生指定的 `saga`
  - `takeLatest(pattern, saga, ..args)`：在发起 `action` 与 `pattern` 匹配时派生指定的 `saga`，并且自动取消之前启动的所有 `saga` 任务（如果在执行中）
- Effect creators 创建器
  - `take(pattern)`：创建一条 Effect 描述信息，指示 middleware 等待 Store 上指定的 action。Generator 会暂停，知道一个与 `pattern` 匹配的 `action` 被发起
  - `put(action)`：指示 middleware 发起一个 `action` 到 Store
  - `call(fn, ...args)`：指定 middleware 调用 `fn` 函数并以 `args` 为参数
  - `call([context, fn], ...args)`：同上，但是支持 `fn` 指定 `this` 上下文
  - `apply(context, fn, args)`：同上，参数为数组
  - `cps(fn, ...args)`：指示 middleware 以 Node 风格掉哟功能 `fn` 函数
  - `cps([context, fn], ...args)`：支持为 `fn` 指定 `this` 上下文（调用对象方法）
  - `fork(fn, ...args)`：指示 middleware 以 **无阻塞调用** 方式执行 `fn`
  - `fork([context, fn], ...args)`：同上，但是支持 `fn` 指定上下文
  - `join(task)`：指示 middleware 等待之前的 `fork` 任务返回结果
  - `cancel(task)`：指示 middlware 取消之前的 `fork` 任务
  - `select(selector, ...args)`：指示 middleware 调用提供的选择器获取 Store state 上的数据
- Effect combinators
  - `race(effects)`：指示 middleware 在多个 Effect 之间执行一个 `race` 的操作
  - `[...effects] (aka parallel effects)`：指示 middleware 并行执行多个 Effect，并等待所有 Effect 完成
- Interfaces
  - `Task`
    - `task.isRunning()`：如果任务还未返回或跑出了一个错误则返回 `true`
    - `task.result()`：任务的返回值，如果任务正在执行中则返回 `undefined`
    - `task.error()`：任务抛出的错误，如果任务正在执行中则返回 `undefined`
    - `task.done`：Promise（以任务的返回值 `resolve`、以任务抛出的错误 `reject`）
    - `task.cancel()`：取消任务（如果任务还在执行中）
- External API
  - `runSaga(iterator, {subscribe, dispatch, getState}, [monitor])`：允许在 Redux middleware 环境外部启动 sagas。当你想将 Saga 连接至外部的输入和输出时，而不是 Store 的 action，会很有用。

---

**参考资料：**

- [Redux-Saga 中文文档](https://chenyitian.gitbooks.io/redux-saga/content/)
- [redux-saga 化异步为同步](https://mp.weixin.qq.com/s?__biz=MzA4NjcyMDYzMg==&mid=2451805550&idx=1&sn=84c84d73789b960f845515d701a6e0d2&chksm=88135c79bf64d56fb27009192ec3d724645a1d375b9006b7c09bad0a2aa1a3446f823e90d928&scene=0&xtrack=1)
