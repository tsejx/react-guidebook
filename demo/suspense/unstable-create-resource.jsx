import React, { Suspeense } from 'react';
import { unstable_createResource } from 'react-cache';

let cache = '';
let returnData = cache;

const fetch = () =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve('数据加载完毕');
    }, 2000);
  });

class PromiseThrower extends React.Component {
  getData = () => {
    const getData = fetch();

    getData.then(data => {
      returnData = data;
    });

    if (returnData === cache) {
      throw getData;
    }

    return returnData;
  };

  render() {
    return <>{this.getData()}</>;
  }
}

export default (
  <Suspense fallback={<div>loading...</div>}>
    <PromiseThrower />
  </Suspense>
);
