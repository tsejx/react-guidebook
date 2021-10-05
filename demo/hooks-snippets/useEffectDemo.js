import React from 'react'

function useEffectDemo () {
  const initData = async () => {
    // 发起请求并执行
  }

  // 执行初始化操作，需要注意的是，如果你只是想在渲染的时候初始化一次数据，那么第二个参数必须传空数组
  useEffect(() => {
    initData()
  }, [])

  return (<div></div>)
}

function QRCode (url, userId) {
  // 根据 userId 查询扫描状态
  const pollingQueryingStatus = async () => { }

  // 取消轮询
  const stopPollingQueryStatus = async () => { }

  useEffect(() => {
    pollingQueryingStatus()

    return stopPollingQueryStatus
  }, [userId])

  // 根据 URL 生成二维码
  return (<div></div>)
}