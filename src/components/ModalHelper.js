import bus from '@/event-bus'

class Modal {
  constructor() {
    bus.on('/OKOnlyModal_Ok', () => {
      alert('ok')
    })
    bus.on('/OKOnlyModal_Cancel', () => {
      alert('cancel')
    })
  }
  static install(app) {
    app.config.globalProperties.$Modal = new Modal()
  }

  ShowOKModal(title, content, title_variant = 'primary') {
    this.props = {
      title: title,
      content: content,
      title_variant: title_variant,
    }
    bus.emit('/ShowOKOnlyModal', this.props)
  }
}

export default Modal
