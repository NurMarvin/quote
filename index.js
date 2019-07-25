const { resolve } = require("path")
const { Plugin } = require("powercord/entities")
const { forceUpdateElement, getOwnerInstance } = require("powercord/util")
const { inject, uninject } = require("powercord/injector")
const { React, getModule, getModuleByDisplayName } = require("powercord/webpack")

const Settings = require("./components/Settings")

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

Number.prototype.padLeft = function (base, chr) {
  var len = String(base || 10).length - String(this).length + 1
  return len > 0 ? new Array(len).join(chr || "0") + this : this
}

function escapeMarkdown(text) {
	text = text.replace(/\\(\*|_|`|~|\\)/g, "$1").replace(/(\*|_|`|~|\\)/g, "\\$1")
	return text
}

function fixContent(text) {
	return text.replace(/<a?:(\w+):\d+>/g, ":$1:").replace(/(https?:\/\/\S+)/g, "<$1>")
}

module.exports = class Quote extends Plugin {
	escapeMentions(text) {
		return text.replace(/<@!?(\d+)>/g, (_, userID) => {
			return "@​"+this.getUser(userID).tag
		})
	}

	async startPlugin () {
		this.loadCSS(resolve(__dirname, "style.css"))
		this.registerSettings("quote", "Quote", Settings)
		
		const MessageContent = await getModuleByDisplayName("MessageContent")
		this.getUser = (await getModule(["getUser"])).getUser
		
		const getSettings = (key, defaultValue) => {
			return this.settings.get(key, defaultValue)
		}

		const _this = this

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
										e.message.content = _this.escapeMentions(fixContent(e.message.content))
										let contentLines = e.message.content.split("\n")
										
										let guildID = e.channel.guild_id;
										let channelID = e.channel.id;
										let messageID = e.message.id;

										let timestamp = e.message.timestamp
										let displayTime = timestamp.format("LT")
										let date = new Date(timestamp)
										let datePretty = monthNames[date.getMonth()] + " " + timestamp.format("DD, YYYY")
										let displayName = _this.escapeMentions(escapeMarkdown(e.message.nick || e.message.author.username || e.message.author.id))
										let tag = _this.escapeMentions(escapeMarkdown(e.message.author.username+"#"+e.message.author.discriminator))
										let channelName = _this.escapeMentions(escapeMarkdown(e.channel.name))

										let format = getSettings("format", "[auto]")

										if (contentLines.length == 1) {
											var quotedMessage = `> [${displayTime}] ${displayName}: ${e.message.content}\n`
										} else {
											var quotedMessage =
												`> *${displayName} at ${displayTime}​:*\n`
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
										.replace("[username]", _this.escapeMentions(escapeMarkdown(e.message.author.username)))
										.replace(
											"[userDiscriminator]",
											e.message.author.discriminator
										)
										.replace(
											"[userTag]",
											tag
										)
										.replace("[channelMention]", guildID !== null ? `#${channelName}` : `<#${channelID}>`)
										.replace("[channelID]", channelID)
										.replace("[channelName]", channelName)
										.replace("[guildID]", guildID)
										.replace("[messageID]", messageID)
										.replace("[messageTimestamp]", timestamp)
										.replace("[messageTime]", displayTime)
										.replace("[messageDate]", datePretty)
										.replace("[messageURL]", `https://discordapp.com/channels${guildID !== null ? `/${guildID}` : "/@me"}/${channelID}/${messageID}`)
										.replace("[auto]", quotedMessage)
										.replace("[message]", contentLines.map(line => `> ${line}\n`).join(""))
										
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
