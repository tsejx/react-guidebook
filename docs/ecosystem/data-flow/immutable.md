---
nav:
  title: 生态
  order: 3
group:
  title: 数据流
  order: 3
title: Immutable
order: 7
---

# Immutable

Immutable，不可改变的，在计算机中，即指一旦创建，就不能再被更改的数据

对 Immutable 对象的任何修改或添加删除操作都会返回一个新的 Immutable 对象

Immutable 实现的原理是 Persistent Data Structure（持久化数据结构）:

- 用一种数据结构来保存数据
- 当数据被修改时，会返回一个对象，但是新的对象会尽可能的利用之前的数据结构而不会对内存造成浪费

也就是使用旧数据创建新数据时，要保证旧数据同时可用且不变，同时为了避免 deepCopy 把所有节点都复制一遍带来的性能损耗，Immutable 使用了 Structural Sharing（结构共享）

如果对象树中一个节点发生变化，只修改这个节点和受它影响的父节点，其它节点则进行共享。
