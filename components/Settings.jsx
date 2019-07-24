const { React } = require('powercord/webpack')
const { SwitchItem } = require('powercord/components/settings')

const TextArea = require('./TextArea')

module.exports = class QuoteSettings extends React.Component {
  constructor () {
    super()
  }

  render () {
    return (
      <div>
        <TextArea
          note={
            <div>
              <p>Variables:</p>
              <p>
                {'{userMention} - Mentions the quoted user'}
                <br />
                {
                  "{userNick} - The quoted user's nickname (if not set falls back to username)"
                }
                <br />
                {"{userId} - The quoted user's id"}
                <br />
                {"{userName} - The quoted user's username"}
                <br />
                {"{userDiscriminator} - The quoted user's discriminator"}
                <br />
                {"{userDiscordTag} - The quoted user's discord tag (Name#0000)"}
                <br />
                {
                  '{channelMention} - Mentions the channel of the channel of the quoted message'
                }
                <br />
                {'{channelId} - The id of the channel of the quoted message'}
                <br />
                {
                  '{channelName} - The name of the channel of the quoted message'
                }
                <br />
                {'{message} - The quoted message '}
                <b>(This message will already have a > in every line)</b>
                <br />
                {
                  '{messageTimestampDate} - The date when the quoted message was posted'
                }
                <br />
                {
                  '{messageTimestampTime} - The time when the quoted message was posted'
                }
                <br />
              </p>
            </div>
          }
          value={this.props.getSetting(
            'format',
            '>{userMention} said at {messageDate}:\n{message}'
          )}
          rows={6}
          onChange={val => this.props.updateSetting('format', val)}
        >
          Quote Message Format
        </TextArea>

        {
          // Kind of not needed but might add later
          /* <SwitchItem
          note={
            <div>
              {
                'Should a new line be appended at the end of the above designed message? '
              }
              <b>(RECOMMENDED)</b>
            </div>
          }
          value={this.props.getSetting('appendNewLine', true)}
          onChange={() => this.props.toggleSetting('appendNewLine')}
        >
          Append New Line
        </SwitchItem> */
        }
      </div>
    )
  }
}
