/**
 * title: 基本用法
 * desc: 除了可以用 JSX 编写代码，也可以用 <code>React.createElement</code> 的形式
 */
import React from 'react';

const one = React.createElement('li', null, 'one');
const two = React.createElement('li', null, 'two');

// 第三个参数可以分开也可以写成数组
const content = React.createElement('ul', { className: 'list' }, one, two);

const App = () => content;

export default () => <App />;
