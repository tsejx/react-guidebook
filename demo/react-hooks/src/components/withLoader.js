const { Renderer } = require("electron")

import React from 'react'
import axios from 'axios'

const withLoader = (WrapperComponent) => {
  return class LoaderComponent extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        data: null,
        isLoading: false
      }
    }
    componentDidMout () {
      this.setState({
        isLoading: true
      })
      axios.get(url).then(result => {
        this.setState({
          data: result.data,
          isLoading: false
        })
      })
    }
    render () {
      const { data, isLoading } = this.props
      return (
        <>
          {
            (isLoading || !data) ? <p>data is loading</p> :
              <WrapperComponent {...this.props} data={data} isLoading={isLoading} />
          }
        </>
      )
    }
  }
}

export default withLoader