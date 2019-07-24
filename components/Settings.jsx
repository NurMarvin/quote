const { React } = require("powercord/webpack")
const { SwitchItem } = require("powercord/components/settings")

const TextArea = require("./TextArea")

module.exports = class QuoteSettings extends React.Component {
	constructor() {
		super()
	}

	render() {
		return (
			<div>
				<TextArea
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
		)
	}
}
