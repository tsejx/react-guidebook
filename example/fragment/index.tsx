/**
 * title: 标签属性
 * desc: 可为 <code>React.Fragment</code> 传入 <code>key</code> props
 */
import React from 'react';

function Glossary(props) {
  return (
    <dl>
      {props.items.map((item) => (
        // 没有 key，将会触发一个 key 警告
        <React.Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

const App = () => {
  const items = [
    {
      id: 1,
      term: 'React：',
      description: 'Good!',
    },
    {
      id: 2,
      term: 'Vue：',
      description: 'Very Good!',
    },
    {
      id: 3,
      term: 'Angular：',
      description: 'Good!Good!Good!',
    },
  ];
  return <Glossary items={items}></Glossary>;
};

export default () => <App />;
