---
nav:
  title: 基础
  order: 1
group:
  title: 核心架构
  order: 3
title: 合成事件
order: 5
---

# 合成事件

在 React 事件调用时，React 传递给事件处理程序是一个合成事件对象的实例。SyntheticEvent 对象是通过合并得到的。 这意味着在事件回调被调用后，SyntheticEvent 对象将被重用并且所有属性都将被取消。 这是出于性能原因。 因此，您无法以异步方式访问该事件。

```js
// React无法异步访问事件对象
function onClick(event) {
  console.log(event); // => nullified object.
  console.log(event.type); // => "click"
  const eventType = event.type; // => "click"

  setTimeout(function() {
    console.log(event.type); // => null
    console.log(eventType); // => "click"
  }, 0);

  // 不能工作。 this.state.click 事件只包含空值。
  this.setState({ clickEvent: event });

  // 您仍然可以导出事件属性。
  this.setState({ eventType: event.type });
}
```

- 方法一：调用合成事件对象 `persist()` 方法
- 方法二：深拷贝事件对象

```js
function debounce(fn, delay = 1200) {
  // 定时器变量
  let timeout;
  return function(event) {
    // 每次触发时先清除上一次的定时器，然后重新计时
    window.clearTimeout(timeout);
    // 保留对事件的引用
    event.persist && event.persist();
    timeout = setTimeout(fn(event), delay);
  };
}

class Test extends React.Component {
  handleChange = debounce(e => console.log(e), 1200);
  render() {
    return (
      <div>
        <input onChange={this.handleChange} />
      </div>
    );
  }
}
```

Vue

```js
<div id="app">
    <input type="text" @keydown="handleChange">
</div>

<script>
function debounce(func, wait = 500) {
  let timeout; // 定时器变量
  return function(event) {
    clearTimeout(timeout); // 每次触发时先清除上一次的定时器,然后重新计时
    timeout = setTimeout(() => {
      console.log(123, this);
      func.call(this, event);
    }, wait); // 指定 xx ms 后触发真正想进行的操作 handler
  };
}
new Vue({
  el: '#app',
  methods: {
    handleChange: debounce(function(e) {
      console.log(e);
      console.log(this);
    }),
  },
});
</script>
```

小程序

```js
<input bindinput="change" style="border:1px solid #000;" />;

function debounce(func, wait = 500) {
  let timeout;
  return function(event) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.call(this, event);
    }, wait);
  };
}

Page({
  change: debounce(function(e) {
    console.log(e);
    console.log(this);
  }),
});
```
