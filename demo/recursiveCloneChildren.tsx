function recursiveCloneChildren(children: React.ReactElement[], newProps: any) {
  return React.Children.map(children, (child: React.ReactElement) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    // 字符串没有 props
    if (child.props) {
      newProps.children = recursiveCloneChildren(child.props.children, newProps);
      return React.cloneElement(child, newProps);
    }

    return child;
  });
}

export default recursiveCloneChildren;
