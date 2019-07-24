const { resolve } = require("path")
const { Plugin } = require("powercord/entities")
const { forceUpdateElement, getOwnerInstance } = require("powercord/util")
const { inject, uninject } = require("powercord/injector")
const { React, getModuleByDisplayName } = require("powercord/webpack")

const Settings = require("./components/Settings")

Number.prototype.padLeft = function (base, chr) {
  var len = String(base || 10).length - String(this).length + 1
  return len > 0 ? new Array(len).join(chr || "0") + this : this
}

function escapeMarkdown(text) {
	text.replace(/\\(\*|_|`|~|\\)/g, "$1").replace(/(\*|_|`|~|\\)/g, "\\$1");
}

module.exports = class Quote extends Plugin {
	async startPlugin () {
		this.loadCSS(resolve(__dirname, "style.css"))
		this.registerSettings("quote", "Quote", Settings)
		
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
										
										let timestamp = e.message.timestamp
										let displayTime = timestamp.format("LT")
										let isoDate = timestamp.format("YYYY-MM-DD")
										let displayName = escapeMarkdown(e.message.nick || e.message.author.username || e.message.author.id)
										let tag = escapeMarkdown(e.message.author.username+"#"+e.message.author.discriminator)

										let format = getSettings("format", "[auto]")

										if (contentLines.length == 1) {
											var quotedMessage = `> [${displayTime}] ${displayName}: ${e.message.content}\n`
										} else {
											var quotedMessage =
												`>*${displayName} at ${displayTime}​:*\n`
												+contentLines.map(line => `> ${line}\n`).join("")
										}

										let message = format
										.replace(
											"[userMention]",
											"@"+tag
										)
										.replace(
											"[userDisplayName]",
											displayName
										)
										.replace("[userID]", e.message.author.id)
										.replace("[username]", escapeMarkdown(e.message.author.username))
										.replace(
											"[userDiscriminator]",
											e.message.author.discriminator
										)
										.replace(
											"[userTag]",
											tag
										)
										.replace("[channelMention]", `#${e.channel.name}`)
										.replace("[channelID]", e.channel.id)
										.replace("[channelName]", escapeMarkdown(e.channel.name))
										.replace("[message]", contentLines.map(line => `>${line}\n`).join(""))
										.replace("[messageTime]", timestamp)
										.replace("[messageDate]", isoDate)
										.replace("[auto]", quotedMessage)
										
										let chatbox = document.querySelector("textarea.textArea-2Spzkt.scrollbar-3dvm_9")
										
										if (chatbox) {
											if (chatbox.value !== "") {
												chatbox.value = message + chatbox.value
											} else {
												chatbox.value = message
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
