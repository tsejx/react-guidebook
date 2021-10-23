/**
 * title: 修改渲染
 * desc: 在高阶组件内部根据返回情况，修改最终渲染的结果
 */
import React, { useState } from 'react';

class ChildComponent extends React.Component<{ value: string }> {
  render() {
    const { value } = this.props;
    return <input type="text" value={value} />;
  }
}

const HighOrderComponent = (WrappedComponent) => {
  return class extends WrappedComponent {
    render() {
      const elementsTree = super.render();
      let newProps = {};
      console.log('elementsTree', elementsTree);
      if (elementsTree && elementsTree.type === 'input') {
        newProps = { value: 'Hello world!' };
      }
      const props = Object.assign({}, elementsTree.props, newProps);
      const newElementsTree = React.cloneElement(elementsTree, props, elementsTree.props.children);
      return newElementsTree;
    }
  };
};

const Content = HighOrderComponent(ChildComponent);

const App = () => {
  return (
    <>
      <Content />
    </>
  );
};

export default () => <App />;
