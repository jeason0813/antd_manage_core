import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Icon } from 'antd';
import { getPredicates } from '../conditions-utils';
import ConditionPredicateSelect from './condition-predicate-select';
const FormItem = Form.Item;

class ConditionCustomItem extends React.Component {

  static propTypes = {
    text: PropTypes.string,
    value: PropTypes.any,
    values: PropTypes.array,
    form: PropTypes.object,
    predicate: PropTypes.string,
    uuid: PropTypes.string,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    predicateOnChange: PropTypes.func,
    excludePredicates: PropTypes.array,
    render: PropTypes.func
  };

  componentWillMount() {
    const { excludePredicates } = this.props;
    this.predicates = getPredicates(excludePredicates);
  }

  onChangeProxy(e) {
    const { uuid, onChange } = this.props;
    onChange({ value: e.value, uuid });
  }

  onDeleteProxy() {
    const { uuid, onDelete } = this.props;
    onDelete({ uuid });
  }

  render() {
    const { text, predicate, predicateOnChange, uuid } = this.props;
    const customRender = this.props.render;

    return (
      <Form layout={'inline'} >
        <FormItem label={text} >
          <ConditionPredicateSelect
            uuid={uuid}
            predicate={predicate}
            predicates={this.predicates}
            predicateOnChange={predicateOnChange}
          />
        </FormItem>
        <FormItem>
          {customRender(this)}
        </FormItem>
        <Button onClick={::this.onDeleteProxy} shape="circle" ><Icon type="delete" /></Button>
      </Form>
    );
  }
}

export default Form.create()(ConditionCustomItem);
