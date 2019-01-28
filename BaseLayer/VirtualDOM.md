## VirtualDOM

> Virtual DOM 的本质是一个用来映射真实 DOM 的 JavaScript 对象

### 历史背景

DOM 是很慢的，其元素非常庞大，页面的性能问题鲜有由JS引起的，大部分都是由 DOM 操作引起的。如果对前端工作进行抽象的话，主要就是维护状态和更新视图；而更新视图和维护状态都需要 DOM 操作。其实近年来，前端的框架主要发展方向就是解放 DOM 操作的复杂性。

在 jQuery 出现以前，我们直接操作 DOM 结构，这种方法复杂度高，兼容性也较差；有了 jQuery 强大的选择器以及高度封装的 API，我们可以更方便的操作 DOM，jQuery 帮我们处理兼容性问题，同时也使 DOM 操作变得简单；但是聪明的程序员不可能满足于此，各种 MVVM 框架应运而生，有 AngularJS、Avalon、Vue.js等，MVVM 使用数据双向绑定，使得我们完全不需要操作 DOM 了，更新了状态视图会自动更新，更新了视图数据状态也会自动更新，可以说 MMVM 使得前端的开发效率大幅提升，但是其大量的事件绑定使得其在复杂场景下的执行性能堪忧；有没有一种兼顾开发效率和执行效率的方案呢？ReactJS 就是一种不错的方案，虽然其将 JavaScript 代码和 HTML 代码混合在一起的设计有不少争议，但是其引入的 Virtual DOM（虚拟 DOM）却是得到大家的一致认同的。

### 实现原理

虚拟的 DOM 的核心思想是：对复杂的文档 DOM 结构，提供一种方便的工具，进行最小化地 DOM 操作。这句话，也许过于抽象，却基本概况了虚拟 DOM 的设计思想。

使用 JavaScript 对象表示 DOM 信息和结构，当状态变更的时候，会重新渲染这个 JavaScript 的对象结构。

```js
const element = {
    tagName: 'ul',	// 节点标签名
    props: {		// DOM属性,用一个对象存储键值对
        id: 'list'
    },
    children: [		// 该节点的子节点
        {tagName: 'li', props: {class: 'item'}, children: ['Item 1']},
        {tagName: 'li', props: {class: 'item'}, children: ['Item 2']},
        {tagName: 'li', props: {class: 'item'}, children: ['Item 3']},
    ]
}
```

对应的 DOM 树中的 HTML 写法：

```html
<ul id="list">
    <li class="item">Item1</li>
    <li class="item">Item2</li>
    <li class="item">Item3</li>
</ul>
```

反之亦然，你亦可以根据 JavaScript 对象来构建真正的 DOM 树。

**Virtual DOM 算法实现步骤：**

1. 用 JavaScript 对象结构表示 DOM 树的结构；然后用这个树构建一个真正的 DOM 树，插到文档当中
2. 当状态变更的时候，重新构造一棵新的对象树。然后用新的树和旧的树进行比较，记录两棵树差异
3. 把步骤2所记录的差异应用到步骤1所构建的真正的DOM树上，视图就更新了

**功能拆分（React中实际方法函数）**

1. 一个生成虚拟 DOM 对象的 Javascript 函数（React.createElement）
2. 一个将虚拟 DOM 转换称真实 DOM 的函数
3. 一个解析模版节点的函数
4. 一个更新虚拟 DOM 新旧节点的函数
5. 一个对比虚拟 DOM 新旧节点的函数

### 算法实现

#### 模拟DOM树

用 JavaScript 来表示一个 DOM 节点是很简单的事情，你只需要记录它的节点类型、属性，还有子节点：

```js
// element.js
function Element (tagName, props, children) {
  this.tagName = tagName
  this.props = props
  this.children = children
}

module.exports = function (tagName, props, children) {
  return new Element(tagName, props, children)
}
```

例如上面的 DOM 结构就可以简单的表示：

```js
var el = require('./element')

var ul = el('ul', {id: 'list'}, [
  el('li', {class: 'item'}, ['Item 1']),
  el('li', {class: 'item'}, ['Item 2']),
  el('li', {class: 'item'}, ['Item 3'])
])
```

现在 `ul` 只是一个 JavaScript 对象表示的 DOM 结构，页面上并没有这个结构。我们可以根据这个 `ul` 构建真正的 `<ul>` 标签：

```js
Element.prototype.render = function(){
    var el = document.creatElement(this.tagName)	// 根据tagName构建
    var props = this.props

    for(var propName in props){		// 设置节点的DOM属性
        var propValue = props[propName]
        el.setAttribute(propName, propValue)
    }

    var children = this.children || []

    children.forEach(function(child){
        var childEl = (child instanceof Element)
        	? child.render()					// 如果子节点也是虚拟DOM,递归构建DOM节点
        	: document.createTextNode(child)	// 如果字符串,只构建文本节点
        el.appendChild(childEl)
    })

    return el
}
```

`render()` 方法会根据 `tagName` 构建一个真正的 DOM 节点，然后设置这个节点的属性，最后递归地把自己的子节点也构建起来。所以只需要：

```js
var ulRoot = ul.render()
document.body.appendChild(ulRoot)
```

`ulRoot` 是真正的 DOM 节点，把它塞入文档中，这样的 `<body>` 里面就有了真正的 `<ul>` 的 DOM 结构。

```html
<ul id="list">
    <li class="item">Item1</li>
    <li class="item">Item2</li>
    <li class="item">Item3</li>
</ul>
```

完整代码可见 [element.js](https://github.com/livoras/simple-virtual-dom/blob/master/lib/element.js)

#### 判断差异

既然我们已经通过 JavaScript 来模拟实现了 DOM，那么接下来的难点就在于如何判断旧的对象和新的对象之间的差异。

DOM 是多叉树的结构，如果需要完整的对比两颗树的差异，那么需要的时间复杂度会是 O(n ^ 3)，这个复杂度肯定是不能接受的。于是 React 团队优化了算法，实现了 O(n) 的复杂度来对比差异。

实现 O(n) 复杂度的关键就是只对比同层的节点，而不是跨层对比，这也是考虑到在实际业务中很少会去跨层的移动 DOM 元素。

所以判断差异的算法就分为了两步

- 首先从上至下，从左往右遍历对象，也就是树的深度优先遍历，这一步中会给每个节点添加索引，便于最后渲染差异（同层节点进行比较的常用方法）
- 一旦节点有子元素，就去判断子元素是否有不同

 ![VirtualDOM：同层级元素比对](../Screenshots/virtual_dom_1.jpg)

![深度优先遍历，记录差异](../Screenshots/virtual_dom_2.jpg)

##### 树的递归

首先我们来实现树的递归算法，在实现该算法前，先来考虑下两个节点对比会有几种情况

1. 新的节点的 `tagName` 或者 `key` 和旧的不同，这种情况代表需要替换旧的节点，并且也不再需要遍历新旧节点的子元素了，因为整个旧节点都被删掉了
2. 新的节点的 `tagName` 和 `key`（可能都没有）和旧的相同，开始遍历子树
3. 没有新的节点，那么什么都不用做

```js
import { stateEnums, isString, move } from './util'
import Element from './element'

export default function diff(olaDOMTree, newDOMTree){
    // 用于记录差异
    let patches = {}
    // 一开始的索引为0
    dfs(oldDOMTree, newDOMTree, 0, patches)
    return patches
}

function dfs(oldNode, newNode, index, patches){
    // 用于保存子树的更改
    let currentPatches = []
    // 需要判断三种情况
    // 1. 没有新的节点，那么什么都不做
    // 2. 新的节点的 tagName 和 `key` 和旧的不同，就替换
    // 3. 新的节点的 tagName 和 key（可能都没有）和旧的相同，开始遍历子树
    if (!newNode){
    }else if (newNode && newNode.tag === oldNode.tag && newNode.key === oldNode.key){
		// 判断属性是否变更
        let props = diffProps(oldNode.props, newNode.props)
        if (props.length){
            currentPatches.push({ type: StateEnums.ChangeProps, props })
        }
        diffChildren(oldNode.children, newNode.children, index, patches)
    } else {
        // 节点不同，需要替换
        currentPatches.push({ type: StateEnums.Replace, node: newNode })
    }

    if (currentPathces.length){
        if (patches[index]){
            patches[index] = patches[index].concat(currentPathces)
        } else {
            patches[index] = currentPatches
        }
    }
}
```

##### 判断属性的更改

判断属性的更改也分为三个步骤：

1. 遍历旧的属性列表，查看每个属性是否还存在于新的属性列表中
2. 遍历新的属性列表，判断两个列表中都存在的属性的值是否有变化
3. 在第二步中同时查看是否有属性不存在与旧的属性列表中

```js
function diffProps(oldProps, newProps){
	// 判断 Props 分以下三步骤
  	// 先遍历 oldProps 查看是否存在删除的属性
  	// 然后遍历 newProps 查看是否有属性值被修改
  	// 最后查看是否有属性新增
    let change = []
    for (const key in oldProps){
        if (oldProps.hasOwnProperty(key) && !newProps[key]){
            change.push({
                prop: key
            })
        }
    }
    for (const key in newProps){
        if (oldProps.hasOwnProperty(key)){
            const prop = newProps[key]
            if (oldProps[key] && oldProps[key] !== newProps[key]){
                change.push({
                    props: key,
                    value: newProps[key]
                })
            } else if (!oldProps[key]) {
                change.push({
                    prop.key,
                    value: newProps[key]
                })
            }
        }
    }
    return change
}
```

##### 判断列表差异算法实现

这个算法是整个 Virtual Dom 中最核心的算法，且让我一一为你道来。 这里的主要步骤其实和判断属性差异是类似的，也是分为三步

1. 遍历旧的节点列表，查看每个节点是否还存在于新的节点列表中
2. 遍历新的节点列表，判断是否有新的节点
3. 在第二步中同时判断节点是否有移动

PS：该算法只对有 `key` 的节点做处理

 ```js
function listDiff(oldList, newList, index, patches) {
  // 为了遍历方便，先取出两个 list 的所有 keys
  let oldKeys = getKeys(oldList)
  let newKeys = getKeys(newList)
  let changes = []

  // 用于保存变更后的节点数据
  // 使用该数组保存有以下好处
  // 1.可以正确获得被删除节点索引
  // 2.交换节点位置只需要操作一遍 DOM
  // 3.用于 `diffChildren` 函数中的判断，只需要遍历
  // 两个树中都存在的节点，而对于新增或者删除的节点来说，完全没必要
  // 再去判断一遍
  let list = []
  oldList &&
    oldList.forEach(item => {
      let key = item.key
      if (isString(item)) {
        key = item
      }
      // 寻找新的 children 中是否含有当前节点
      // 没有的话需要删除
      let index = newKeys.indexOf(key)
      if (index === -1) {
        list.push(null)
      } else list.push(key)
    })
  // 遍历变更后的数组
  let length = list.length
  // 因为删除数组元素是会更改索引的
  // 所有从后往前删可以保证索引不变
  for (let i = length - 1; i >= 0; i--) {
    // 判断当前元素是否为空，为空表示需要删除
    if (!list[i]) {
      list.splice(i, 1)
      changes.push({
        type: StateEnums.Remove,
        index: i
      })
    }
  }
  // 遍历新的 list，判断是否有节点新增或移动
  // 同时也对 `list` 做节点新增和移动节点的操作
  newList &&
    newList.forEach((item, i) => {
      let key = item.key
      if (isString(item)) {
        key = item
      }
      // 寻找旧的 children 中是否含有当前节点
      let index = list.indexOf(key)
      // 没找到代表新节点，需要插入
      if (index === -1  || key == null) {
        changes.push({
          type: StateEnums.Insert,
          node: item,
          index: i
        })
        list.splice(i, 0, key)
      } else {
        // 找到了，需要判断是否需要移动
        if (index !== i) {
          changes.push({
            type: StateEnums.Move,
            from: index,
            to: i
          })
          move(list, index, i)
        }
      }
    })
  return { changes, list }
}

function getKeys(list) {
  let keys = []
  let text
  list &&
    list.forEach(item => {
      let key
      if (isString(item)) {
        key = [item]
      } else if (item instanceof Element) {
        key = item.key
      }
      keys.push(key)
    })
  return keys
}
 ```

##### 遍历子元素打标识

对于这个函数来说，主要功能就两个

1. 判断两个列表差异
2. 给节点打上标记

总体来说，该函数实现的功能很简单

```js
function diffChildren(oldChild, newChild, index, patches) {
  let { changes, list } = listDiff(oldChild, newChild, index, patches)
  if (changes.length) {
    if (patches[index]) {
      patches[index] = patches[index].concat(changes)
    } else {
      patches[index] = changes
    }
  }
  // 记录上一个遍历过的节点
  let last = null
  oldChild &&
    oldChild.forEach((item, i) => {
      let child = item && item.children
      if (child) {
        index =
          last && last.children ? index + last.children.length + 1 : index + 1
        let keyIndex = list.indexOf(item.key)
        let node = newChild[keyIndex]
        // 只遍历新旧中都存在的节点，其他新增或者删除的没必要遍历
        if (node) {
          dfs(item, node, index, patches)
        }
      } else index += 1
      last = item
    })
}
```

##### 渲染差异

通过之前的算法，我们已经可以得出两个树的差异了。既然知道了差异，就需要局部去更新 DOM 了，下面就让我们来看看 Virtual Dom 算法的最后一步骤

这个函数主要两个功能

1. 深度遍历树，将需要做变更操作的取出来
2. 局部更新 DOM

整体来说这部分代码还是很好理解的

 ```js
let index = 0
export default function patch(node, patchs) {
  let changes = patchs[index]
  let childNodes = node && node.childNodes
  // 这里的深度遍历和 diff 中是一样的
  if (!childNodes) index += 1
  if (changes && changes.length && patchs[index]) {
    changeDom(node, changes)
  }
  let last = null
  if (childNodes && childNodes.length) {
    childNodes.forEach((item, i) => {
      index =
        last && last.children ? index + last.children.length + 1 : index + 1
      patch(item, patchs)
      last = item
    })
  }
}

function changeDom(node, changes, noChild) {
  changes &&
    changes.forEach(change => {
      let { type } = change
      switch (type) {
        case StateEnums.ChangeProps:
          let { props } = change
          props.forEach(item => {
            if (item.value) {
              node.setAttribute(item.prop, item.value)
            } else {
              node.removeAttribute(item.prop)
            }
          })
          break
        case StateEnums.Remove:
          node.childNodes[change.index].remove()
          break
        case StateEnums.Insert:
          let dom
          if (isString(change.node)) {
            dom = document.createTextNode(change.node)
          } else if (change.node instanceof Element) {
            dom = change.node.create()
          }
          node.insertBefore(dom, node.childNodes[change.index])
          break
        case StateEnums.Replace:
          node.parentNode.replaceChild(change.node.create(), node)
          break
        case StateEnums.Move:
          let fromNode = node.childNodes[change.from]
          let toNode = node.childNodes[change.to]
          let cloneFromNode = fromNode.cloneNode(true)
          let cloenToNode = toNode.cloneNode(true)
          node.replaceChild(cloneFromNode, toNode)
          node.replaceChild(cloenToNode, fromNode)
          break
        default:
          break
      }
    })
}
 ```

#### 算法实现总结总结

Virtual DOM 算法主要是实现上面步骤的三个函数：[element](https://link.zhihu.com/?target=https%3A//github.com/livoras/simple-virtual-dom/blob/master/lib/element.js)，[diff](https://link.zhihu.com/?target=https%3A//github.com/livoras/simple-virtual-dom/blob/master/lib/diff.js)，[patch](https://link.zhihu.com/?target=https%3A//github.com/livoras/simple-virtual-dom/blob/master/lib/patch.js)。然后就可以实际的进行使用：

```js
// 1. 构建虚拟DOM
var tree = el('div', {'id': 'container'}, [
    el('h1', {style: 'color: blue'}, ['simple virtal dom']),
    el('p', ['Hello, virtual-dom']),
    el('ul', [el('li')])
])

// 2. 通过虚拟DOM构建真正的DOM
var root = tree.render()
document.body.appendChild(root)

// 3. 生成新的虚拟DOM
var newTree = el('div', {'id': 'container'}, [
    el('h1', {style: 'color: red'}, ['simple virtal dom']),
    el('p', ['Hello, virtual-dom']),
    el('ul', [el('li'), el('li')])
])

// 4. 比较两棵虚拟DOM树的不同
var patches = diff(tree, newTree)

// 5. 在真正的DOM元素上应用变更
patch(root, patches)
```

当然这是非常粗糙的实践，实际中还需要处理事件监听等；生成虚拟 DOM 的时候也可以加入 JSX 语法。这些事情都做了的话，就可以构造一个简单的ReactJS了。

本文所实现的完整代码存放在 [Github](https://link.zhihu.com/?target=https%3A//github.com/livoras/simple-virtual-dom)，仅供学习。

### 虚拟DOM特点

优点：最终表现在 DOM 上的修改只是变更的部分，可以保证非常高效的渲染。

缺点：首次渲染大量 DOM 时，由于多了一层虚拟 DOM 的计算，会比 innerHTML 插入慢。

---

一些轻量级 Virtual DOM 的实现：

- [hoz](https://github.com/HolyZheng/holyZheng-blog/issues/14)
- [Yifeng Wang](http://ewind.us/2017/nano-vdom/)

---

**深入理解：**

- [知乎：如何理解虚拟DOM?](https://www.zhihu.com/question/29504639?sort=created)
- [掘金：深入研究 Virtual DOM](https://juejin.im/entry/5857482a61ff4b0063c80d4d)
- [掘金：深入框架本源系列](https://juejin.im/post/5b10dd36e51d4506e04cf802#heading-3)
- [网易云：从零开始创建VirtualDOM](https://sq.163yun.com/blog/article/183677505940332544)
- [React‘s diff algorithm](https://calendar.perfplanet.com/2013/diff/)