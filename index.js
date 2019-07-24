const { resolve } = require("path")
const { Plugin } = require("powercord/entities")
const { forceUpdateElement, getOwnerInstance } = require("powercord/util")
const { inject, uninject } = require("powercord/injector")
const { React, getModuleByDisplayName } = require("powercord/webpack")

module.exports = class Quote extends Plugin {
	async startPlugin () {
		this.loadCSS(resolve(__dirname, "style.css"))
		
		const MessageContent = await getModuleByDisplayName("MessageContent")
		
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
										console.log(e)

										let contentLines = e.message.content.split("\n")
										
										let displayName = e.message.nick || e.message.author.username || e.message.author.id
										let timestamp = e.message.timestamp
										let displayTime = timestamp.format("LT")

										if (contentLines.length == 1) {
											var quotedMessage = `> [${displayTime}] ${displayName}: ${e.message.content}\n`
										} else {
											var quotedMessage =
												`> *${displayName} at ${displayTime}​:*\n`
												+contentLines.map(line => `> ${line}\n`).join("")
										}
										
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
