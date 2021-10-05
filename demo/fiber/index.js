/**
 * https://www.bilibili.com/video/BV1D54y1m7N8/
 */
let container = document.getElementById('root')
const PLACEMENT = 'PLACEMENT' // 插入


// 下个工作单元
// Fiber 其实也就是一个普通的 JS 对象
let nextUnitOfWork = {
  stateNode: container, // 此 Fiber 对应的 DOM 节点
  props: {
    children: [element] // Fiber 的属性
  }
  // child,
  // return,
  // sibling
}

function workLoop (deadline) {
  // 如果有当前的工作单元，就执行它，并返回一个工作单元
  while (nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  if (!nextUnitOfWork) {
    commitRoot()
  }
}

function commitRoot () {
  let currentFiber = workingInProgressFiber.firstEffect
  while (currentFiber) {
    console.log('commitRoot', currentFiber.props.id)
    if (currentFiber.effectTag === PLACEMENT) {
      currentFiber.return.stateNode.appendChild(currentFiber.stateNode)
    }
    currentFiber = currentFiber.nextEffect
  }
  workingInProgressFiber = null
}

/**
 * beginWork 1. 创建此 Fiber 的真实 DOM，通过虚拟 DOM 创建 Fiber 树结构
 * @param {*} workingInProgressFiber
 */
function performUnitOfWork (workingInProgressFiber) {
  // 创建真实 DOM，并没有挂载 2. 创建 Fiber 子树
  beginWork(workingInProgressFiber)

  // 如果有子节点，返回子节点
  if (workingInProgressFiber.child) {
    return workingInProgressFiber.child
  }

  while (workingInProgressFiber) {
    // 如果没有节点当前节点其实就结束完成了
    completeUnitOfWork(workingInProgressFiber)

    // 如果有弟弟节点，返回弟弟节点
    if (workingInProgressFiber.sibling) {
      return workingInProgressFiber.sibling
    }
  }
}

function beginWork (workingInProgressFiber) {
  console.log('completeUnitOfWork', workingInProgressFiber.prop.id)

  if (!workingInProgressFiber.stateNode) {
    workingInProgressFiber.stateNode = document.createElement(workingInProgressFiber.type)

    for (let key in workingInProgressFiber.props) {
      if (key !== 'children') {
        workingInProgressFiber.stateNode[key] = workingInProgressFiber.props[key]
      }
    }
  }// 在 beiginWork 里面是不会挂载的

  // 创建子 Fiber
  let previousFiber
  // children 是 VirtualDOM 的数组
  if (Array.isArray(workingInProgressFiber.props.children)) {
    workingInProgressFiber.props.children.forEach((child, index) => {
      let childFiber = {
        type: child.type, // DOM 节点类型 div、p、span
        props: child.props,
        return: workingInProgressFiber,
        effectTag: 'PLACEMENT' // 此 Fiber 对应的 DOM 节点需要被插入到页面中父 DOM 中去
      }
    })
  }
}

function completeUnitOfWork (workingInProgressFiber) {
  console.log('completeUnitOfWork', workingInProgressFiber.props.id)
  // 构建副作用链（因为更新并非所有节点都需要参与）
  let returnFiber = workingInProgressFiber.return // A1
  if (returnFiber) {
    // 把当前 Fiber 的有副作用子链表挂载到父节点上
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = workingInProgressFiber.firstEffect
    }
    if (workingInProgressFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = workingInProgressFiber.firstEffect
      }
      returnFiber.lastEffect = workingInProgressFiber.lastEffect
    }
    // 再把自己挂载副作用链上
    if (workingInProgressFiber.effectTag) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = workingInProgressFiber
      } else {
        returnFiber.firstEffect = workingInProgressFiber
      }
      returnFiber.lastEffect = workingInProgressFiber
    }
  }
}

// 告诉浏览器在空闲的时间执行 workLoop
requestIdleCallback(workLoop)