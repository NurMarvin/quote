const { React, getModuleByDisplayName, getModule } = require("powercord/webpack")
const AsyncComponent = require('powercord/components/AsyncComponent')

const Card = AsyncComponent.from(getModuleByDisplayName('Card'))
const ConnectedMessageGroup = AsyncComponent.from(getModuleByDisplayName('FluxContainer(ConnectedMessageGroup)'))

const TextArea = require("./TextArea")

module.exports = class QuoteSettings extends React.Component {
	constructor() {
		super()
	}

	render() {
		const { default: Channel } = getModule(['isGuildReadableType'], false);
		const { createMessage } = getModule(['createMessage'], false);
		const { create } = getModule(['lookupMember', 'create'], false);
		const channel = new Channel({ id: '69' });

		const messages = [
			create({ ...createMessage(channel.id, 'emma and flexy are **cute** :hibiscus:'), state: 'SENT' })
		]

		messages.forEach(message => {
			message.content = this.props.formatMessage(channel, message);
		})

		return (
			<div>
				<Card
					className="preview-2nSL_2"
					editable={false}
					outline={true}
					type="cardPrimary"
				>
					<ConnectedMessageGroup
						channel={channel}
						messages={messages}
						enableInteraction={false}
					/>
				</Card>
				<div className="marginTop40-i-78cZ">
					<TextArea
						autoCorrect="off"
						note={
							<div>
								<p>Variables:</p>
								<p className="quote-variables">
									[userMention] - Mentions the quoted user<br></br>
									[userDisplayName] - The quoted user's display name<br></br>
									[username] - The quoted user's username<br></br>
									[userID] - The quoted user's ID<br></br>
									[userDiscriminator] - The quoted user's discriminator<br></br>
									[userTag] - The quoted user's tag (Name#0000)<br></br>
									[channelMention] - Mentions the channel of the channel of the quoted message<br></br>
									[channelID] - The ID of the channel of the quoted message<br></br>
									[channelName] - The name of the channel of the quoted message<br></br>
									[guildID] - The ID of the guild of the quoted message<br></br>
									[message] - The quoted message<br></br>
									[messageURL] - URL to the quoted message<br></br>
									[messageDate] - The date when the quoted message was posted<br></br>
									[messageTime] - The time when the quoted message was posted<br></br>
									[messageTimestamp] - The timestamp (unformatted date and time) when the quoted message was posted<br></br>
									[auto] - Insert something pretty
							</p>
							</div>
						}
						value={this.props.getSetting(
							"format",
							"[auto]"
						)}
						rows={6}
						onChange={val => this.props.updateSetting("format", val)}
					>
						Quote Message Format
				</TextArea>
				</div>
			</div>
		)
	}
}
