/**
 * title: 基本用法
 * desc: 使用 <code>React.memo</code> 封装函数子组件，使用 <code>useCallback</code> 封装作为 <code>props</code> 传递给子组件的回调函数 ，只有当依赖数据变更时，传递的回调函数才会视为变更，子组件才会驱动引发重新渲染，这有助于优化性能
 */
import React, { useState, useCallback } from 'react';

let Showcase = ({ text, value }) => {
  console.log(`Rendering ${text} showcase`)
  return (
    <div>
      {text}：{value}
    </div>
  );
};

let Button = ({ text, onChange }) => {
  console.log(`Rendering ${text} button`)
  return <button onClick={onChange}>Increment {text}</button>;
};

Showcase = React.memo(Showcase);
Button = React.memo(Button);

const App = () => {
  const [age, setAge] = useState(0);
  const [count, setCount] = useState(0);

  const incrementAge = useCallback(() => {
    setAge(age + 1);
  }, [age]);

  const incrementCount = useCallback(() => {
    setCount(count + 1);
  }, [count]);

  return (
    <div>
      <Showcase text="Age" value={age}></Showcase>
      <Button text="Age" onChange={incrementAge}></Button>
      <br />
      {/* 使用了 useCallback */}
      <Showcase text="Count" value={count}></Showcase>
      <Button text="Count" onChange={incrementCount}></Button>
    </div>
  );
};

export default () => <App />;
