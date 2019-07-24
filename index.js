const { resolve } = require('path')
const { Plugin } = require('powercord/entities')
const { forceUpdateElement } = require('powercord/util')
const { inject, uninject } = require('powercord/injector')
const { React, getModuleByDisplayName } = require('powercord/webpack')

const Settings = require('./components/Settings')

Number.prototype.padLeft = function (base, chr) {
  var len = String(base || 10).length - String(this).length + 1
  return len > 0 ? new Array(len).join(chr || '0') + this : this
}

module.exports = class Quote extends Plugin {
  async startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.css'))
    this.registerSettings('quote', 'Quote', Settings)

    const MessageContent = await getModuleByDisplayName('MessageContent')

    const getSettings = (key, defaultValue) => {
      return this.settings.get(key, defaultValue)
    }

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

                    for (var i = 0; i < contentLines.length; i++) {
                      quotedMessage += `>${contentLines[i]}\n`
                    }

                    var format = getSettings('format', '{message}')
                    var timestamp = new Date(e.message.timestamp)

                    var timeFormat = [
                      timestamp.getHours().padLeft(),
                      timestamp.getMinutes().padLeft(),
                      timestamp.getSeconds().padLeft()
                    ].join(':')

                    var dateFormat = [
                      timestamp.getDate().padLeft(),
                      (timestamp.getMonth() + 1).padLeft(),
                      timestamp.getFullYear()
                    ].join('/')

                    var message = format
                      .replace(
                        '{userMention}',
                        `@${e.message.author.username}#${
                          e.message.author.discriminator
                        }`
                      )
                      .replace(
                        '{userNick}',
                        e.message.nick
                          ? e.message.nick
                          : e.message.author.username
                      )
                      .replace('{userId}', e.message.author.id)
                      .replace('{userName}', e.message.author.username)
                      .replace(
                        '{userDiscriminator}',
                        e.message.author.discriminator
                      )
                      .replace(
                        '{userDiscordTag}',
                        `${e.message.author.username}#${
                          e.message.author.discriminator
                        }`
                      )
                      .replace('{channelMention}', `#${e.channel.name}`)
                      .replace('{channelId}', e.channel.id)
                      .replace('{channelName}', e.channel.name)
                      .replace('{message}', quotedMessage)
                      .replace('{messageTimestampDate}', dateFormat)
                      .replace('{messageTimestampTime}', timeFormat)

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

                    chatbox.value = message

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
    uninject('quote-contents')
    forceUpdateElement('.pc-message', true)
  }
}
