const { resolve } = require('path')
const { Plugin } = require('powercord/entities')
const { forceUpdateElement } = require('powercord/util')
const { inject, uninject } = require('powercord/injector')
const { React, getModuleByDisplayName } = require('powercord/webpack')

module.exports = class Quote extends Plugin {
  async startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.css'))

    const MessageContent = await getModuleByDisplayName('MessageContent')

    inject(
      'quote-contents',
      MessageContent.prototype,
      'render',
      function (args) {
        const { renderButtons } = this.props
        if (!this.props.patched && renderButtons) {
          this.props.patched = true
          this.props.renderButtons = e => {
            const res = renderButtons(e)
            if (res.props.children) {
              res.props.children.props.children.unshift(
                React.createElement('img', {
                  src: 'https://image.flaticon.com/icons/svg/25/25418.svg',
                  alt: 'Quote',
                  className: 'quote-btn',
                  onClick: () => {
                    var contentLines = e.message.content.split('\n')

                    var quotedMessage = ''

                    for (var line of contentLines) {
                      quotedMessage += `>${line}\n`
                    }

                    // TODO: Find a better solution than this because this is awfully done, please no bully
                    var classes = 'pc-textArea pc-scrollbar'.split(' ')

                    var possibleElements = document.getElementsByClassName(
                      classes[0]
                    )

                    var chatbox

                    for (var elements of possibleElements) {
                      var correct = true
                      for (var clazz of classes) {
                        if (elements.className.includes(clazz)) {
                          chatbox = elements
                          correct = false
                          break
                        }
                      }

                      if (correct) break
                    }

                    if (chatbox.value !== '') {
                      chatbox.value += '\n' + quotedMessage
                    } else {
                      chatbox.value = quotedMessage
                    }

                    chatbox.style.height = `${chatbox.value.split('\n').length *
                      20}px`
                  }
                })
              )
            }
            return res
          }
        }
        return args
      },
      true
    )
  }

  pluginWillUnload () {
    uninject('star-contents')
    forceUpdateElement('.pc-message', true)
  }
}
