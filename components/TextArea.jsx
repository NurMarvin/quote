const { getModuleByDisplayName, React } = require('powercord/webpack')
const AsyncComponent = require('powercord/components/AsyncComponent')
const FormItem = require('powercord/components/settings/FormItem.jsx')

const Area = AsyncComponent.from(getModuleByDisplayName('TextArea'))
const Text = AsyncComponent.from(getModuleByDisplayName('Text'))

module.exports = class TextInput extends React.Component {
  render () {
    const { children: title, note, error } = this.props
    delete this.props.children

    return (
      <FormItem title={title} note={note}>
        <Area {...this.props} />
        {(error || error === '') && (
          <Text
            className={'error-chiOuv marginTop8-1DLZ1n pc-error pc-marginTop8'}
            color={'statusRed-21U8Tp'}
            size={'small-29zrCQ size12-3R0845 height16-2Lv3qA'}
          />
        )}
      </FormItem>
    )
  }
}
