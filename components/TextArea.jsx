const { getModuleByDisplayName, React } = require('powercord/webpack')
const AsyncComponent = require('powercord/components/AsyncComponent')
const FormItem = require('powercord/components/settings/FormItem.jsx')

const Area = AsyncComponent.from(getModuleByDisplayName('TextArea'))
const Text = AsyncComponent.from(getModuleByDisplayName('Text'))

module.exports = class TextInput extends React.Component {
  render() {
    const { children: title, note } = this.props
    delete this.props.children

    return (
      <FormItem title={title} note={note}>
        <Area {...this.props} />
      </FormItem>
    )
  }
}
