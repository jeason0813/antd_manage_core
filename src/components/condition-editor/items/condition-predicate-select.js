import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Select, Form } from 'antd';
const Option = Select.Option;

class ConditionPredicateSelect extends React.Component {

  static propTypes = {
    predicate: PropTypes.string,
    predicates: PropTypes.object,
    form: PropTypes.object,
    predicateOnChange: PropTypes.func,
    uuid: PropTypes.string
  };

  predicateOnChangeProxy(value) {
    const { predicateOnChange, uuid } = this.props;
    predicateOnChange({ predicate: value, uuid });
  }

  render() {
    const { form, predicate, predicates } = this.props;
    const selectStyle = {
      width: '80px'
    };
    let selectFieldDisabled = false;
    if (Object.keys(predicates).length === 1 && '$eq' in predicates) {
      selectFieldDisabled = true;
    }
    return form.getFieldDecorator('predicate', {
      initialValue: predicate
    })(
      <Select
        style={selectStyle}
        onChange={::this.predicateOnChangeProxy}
        disabled={selectFieldDisabled}
      >
        {_.map(predicates, (key, value) => (
          <Option key={key} value={value} >{key}</Option>
        ))}
      </Select>
    );
  }
}

export default Form.create()(ConditionPredicateSelect);
