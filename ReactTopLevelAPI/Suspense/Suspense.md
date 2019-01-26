## React.Suspense 代码拆分

`React.Suspense` 是一种虚拟组件（类似于 Fragment，仅用作类型标识）。

### 使用指南

🌰 **示例：**

```jsx
// This component is loaded dynamically
const OtherComponent = React.lazy(() => import('./OtherComponent'))

function MyComponent() {
    return (
    	// Displays <Spinner> until OtherComponent loads
        <React.Suspense fallback={<div>loading...</div>}>
        	<div>
            	<OtherComponent />
            </div>
        </React.Suspense>
    )
}
```

Suspense 子树中之遥存在还没返回的 Lazy 组件，就返回 `fallback` 指定的内容。

Suspense 组件可以放在（组件树中）Lazy 组件上方的人以位置，并且下方可以有多个 Lazy 组件。

对应到 loading 场景，就是这两种能力：

* 支持 loading 提升
* 支持 loading 聚合

⚠️ **没被 Suspense 包裹的 Lazy 组件会报错。**

### 建设初衷

初衷是为 logading 场景提供优雅的通用解决方案，允许组件树挂起等待（即延迟渲染）异步数据，意义在于：

- 符合最佳用户体验：
  - 避免布局抖动（数据回来之后冒出来一块内容），当然，这是加 loading 或 skeleton（骨架屏）的好处，与 Suspense 关系不很大
  - 区别对待不同网络环境（数据返回快的话压根不会出现 loading）
- 优雅：不用再为了加子树 loading 而提升相关状态和逻辑，从状态提升与组件封装性的抑郁中解脱了
- 灵活：loading 组件与异步组件（依赖异步数据的组件）之间没有组件层级关系上的强关联，能够灵活控制 loading 粒度
- 通用：支持等待异步数据时显示降级组件（loading 只是一种最常见的降级策略，fallback到缓存数据甚至广告也不是不可以）

---

**参考资料：**

* [React Suspense](http://www.ayqy.net/blog/react-suspense/)

