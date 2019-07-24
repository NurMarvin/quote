const { resolve } = require("path")
const { Plugin } = require("powercord/entities")
const { forceUpdateElement, getOwnerInstance } = require("powercord/util")
const { inject, uninject } = require("powercord/injector")
const { React, getModuleByDisplayName } = require("powercord/webpack")

const Settings = require('./components/Settings')

Number.prototype.padLeft = function (base, chr) {
  var len = String(base || 10).length - String(this).length + 1
  return len > 0 ? new Array(len).join(chr || '0') + this : this
}

module.exports = class Quote extends Plugin {
	async startPlugin () {
		this.loadCSS(resolve(__dirname, "style.css"))
		this.registerSettings('quote', 'Quote', Settings)
		
		const MessageContent = await getModuleByDisplayName("MessageContent")
		
		const getSettings = (key, defaultValue) => {
			return this.settings.get(key, defaultValue)
		}

		inject(
			"quote-contents",
			MessageContent.prototype,
			"render",
			function (args) {
				const { renderButtons } = this.props
				if (!this.props.patchedQuote && renderButtons) {
					this.props.patchedQuote = true
					this.props.renderButtons = e => {
						const res = renderButtons(e)
						if (res.props.children) {
							res.props.children.props.children.unshift(
								React.createElement("img", {
									src: "https://image.flaticon.com/icons/svg/25/25418.svg",
									alt: "Quote",
									className: "quote-btn",
									onClick: () => {
										let contentLines = e.message.content.split("\n")
										
										let displayName = e.message.nick || e.message.author.username || e.message.author.id
										let timestamp = e.message.timestamp
										let displayTime = timestamp.format("LT")
										let isoDate = timestamp.format("YYYY-MM-DD")

										let format = getSettings('format', '{message}')

										let quotedMessage = format
										.replace(
											'{userMention}',
											`@${e.message.author.username}#${
											e.message.author.discriminator
											}`
										)
										.replace(
											'{userDisplayName}',
											e.message.nick || e.message.author.username || e.message.author.id
											? e.message.nick
											: e.message.author.username
										)
										.replace('{userID}', e.message.author.id)
										.replace('{username}', e.message.author.username)
										.replace(
											'{userDiscriminator}',
											e.message.author.discriminator
										)
										.replace(
											'{userTag}',
											`${e.message.author.username}#${
											e.message.author.discriminator
											}`
										)
										.replace('{channelMention}', `#${e.channel.name}`)
										.replace('{channelId}', e.channel.id)
										.replace('{channelName}', e.channel.name)
										.replace('{message}', quotedMessage)
										.replace('{messageTime}', timestamp)
										.replace('{messageDate}', isoDate)

										/*if (contentLines.length == 1) {
											var quotedMessage = `> [${displayTime}] ${displayName}: ${e.message.content}\n`
										} else {
											var quotedMessage =
												`> *${displayName} at ${displayTime}​:*\n`
												+contentLines.map(line => `> ${line}\n`).join("")
										}*/
										
										let chatbox = document.querySelector("textarea.textArea-2Spzkt.scrollbar-3dvm_9")
										
										if (chatbox) {
											if (chatbox.value !== "") {
												chatbox.value = quotedMessage + chatbox.value
											} else {
												chatbox.value = quotedMessage
											}
											
											getOwnerInstance(chatbox).handleChange({currentTarget: chatbox})
										}

										chatbox.focus()
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
		uninject("quote-contents")
		forceUpdateElement(".pc-message", true)
	}
}
