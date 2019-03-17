import React, { Component } from 'react';

function hoc(ComponentClass) {
  return class Hoc extends Component {

    componentDidMount() {
      console.log('高阶组件挂载');
      this.disableDragEvent();
    }

    componentWillUnmount() {
      window.removeEventListener('dragenter', this.disableDrag, false)
      window.removeEventListener('dragover', this.disableDrag)
      window.removeEventListener('drop', this.disableDrag)
    }

    disableDragEvent =  () =>  {
      window.addEventListener('dragenter', this.disableDrag, false)
      window.addEventListener('dragover', this.disableDrag)
      window.addEventListener('drop', this.disableDrag)
    }

    disableDrag = (e) => {
      const dropzone = document.getElementById('upload-area')
      if (dropzone === null || !dropzone.contains(e.target)) {
        e.preventDefault()
        e.dataTransfer.effectAllowed = 'none'
        e.dataTransfer.dropEffect = 'none'
      }
    }

    render() {
      return <ComponentClass disableDragEvent={this.disableDragEvent} />
    }
  }
}

export default hoc;