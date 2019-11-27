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
			return "@​" + this.getUser(userID).tag
		})
	}

	async startPlugin() {
		this.loadCSS(resolve(__dirname, "style.css"))

		const formatMessage = (channel, message) => {
			return this.formatMessage(channel, message)
		}

		this.registerSettings("quote", "Quote", (props) =>
			React.createElement(Settings, {
				...props,
				formatMessage
			})
		)

		const MessageContent = await getModuleByDisplayName("MessageContent")
		this.getUser = (await getModule(["getUser"])).getUser

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
									draggable: false,
									onClick: () => {
										let message = formatMessage(e.channel, e.message)

										let chatbox = document.querySelector("textarea.textArea-2Spzkt.scrollbar-3dvm_9")

										if (chatbox === null) {
											chatbox = document.querySelector("div.textArea-2Spzkt");

											if (!chatbox) return

											((msg) => {
												const { deserialize } = require('powercord/webpack').getModule(['deserialize'], false)
												const inst = require('powercord/util').getOwnerInstance(document.querySelector('.form-2fGMdU'));
												inst.setState({ textValue: msg, richValue: deserialize(msg) })
												document.querySelector('.slateTextArea-1bp44y').click()
											})(message)

											chatbox.focus()
										} else {
											if (chatbox.value !== "") {
												chatbox.value = message + chatbox.value
											} else {
												chatbox.value = message
											}

											getOwnerInstance(chatbox).handleChange({ currentTarget: chatbox })

											chatbox.focus()
										}
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

	formatMessage(channel, message) {
		let content = this.escapeMentions(fixContent(message.content))
		let contentLines = content.split("\n")

		let guildID = channel.guild_id;
		let channelID = channel.id;
		let messageID = message.id;

		let timestamp = message.timestamp
		let displayTime = timestamp.format("LT")
		let date = new Date(timestamp)
		let datePretty = monthNames[date.getMonth()] + " " + timestamp.format("DD, YYYY")
		let displayName = this.escapeMentions(escapeMarkdown(message.nick || message.author.username || message.author.id))
		let tag = this.escapeMentions(escapeMarkdown(message.author.username + "#" + message.author.discriminator))
		let channelName = this.escapeMentions(escapeMarkdown(channel.name))

		let format = this.settings.get("format", "[auto]")

		if (contentLines.length == 1) {
			var quotedMessage = `> [${displayTime}] ${displayName}: ${content}\n`
		} else {
			var quotedMessage =
				`> *${displayName} at ${displayTime}​:*\n`
				+ contentLines.map(line => `> ${line}`).join("\n")
		}

		return format
			.replace(
				"[userMention]",
				"@" + tag
			)
			.replace(
				"[userDisplayName]",
				displayName
			)
			.replace("[userID]", message.author.id)
			.replace("[username]", this.escapeMentions(escapeMarkdown(message.author.username)))
			.replace(
				"[userDiscriminator]",
				message.author.discriminator
			)
			.replace(
				"[userTag]",
				tag
			)
			.replace("[channelMention]", `<#${channelID}>`)
			.replace("[channelID]", channelID)
			.replace("[channelName]", channelName)
			.replace("[guildID]", guildID)
			.replace("[messageID]", messageID)
			.replace("[messageTimestamp]", timestamp)
			.replace("[messageTime]", displayTime)
			.replace("[messageDate]", datePretty)
			.replace("[messageURL]", `https://discordapp.com/channels${guildID !== null ? `/${guildID}` : "/@me"}/${channelID}/${messageID}`)
			.replace("[auto]", quotedMessage)
			.replace("[message]", contentLines.map(line => `> ${line}`).join("\n"))
	}

	pluginWillUnload() {
		uninject("quote-contents")
		forceUpdateElement(".pc-message", true)
	}
}
