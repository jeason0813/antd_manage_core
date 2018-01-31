import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Select, Form, Button, Icon } from 'antd';
import {
  $LIKE,
  $GT,
  $GTE,
  $IN,
  $LT,
  $LTE,
  $NOT_IN,
  $IS_NOT_NULL,
  $IS_NULL
} from '../condition-constants';
import { getPredicates } from '../conditions-utils';
import ConditionPredicateSelect from './condition-predicate-select';
const FormItem = Form.Item;
const Option = Select.Option;

class ConditionSelect extends React.Component {

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
    excludePredicates: PropTypes.array
  };

  static defaultExcludePredicates = [
    $LIKE,
    $GT,
    $GTE,
    $LT,
    $LTE,
    $IS_NOT_NULL,
    $IS_NULL
  ];

  componentWillMount() {
    const { excludePredicates } = this.props;
    this.predicates = getPredicates(
      _.union(
        ConditionSelect.defaultExcludePredicates,
        excludePredicates
      )
    );
  }

  onDeleteProxy() {
    const { uuid, onDelete } = this.props;
    onDelete({ uuid });
  }

  onBlurProxy(value) {
    const { uuid, onChange } = this.props;
    onChange({ value, uuid });
  }

  render() {
    const { text, value, values, predicate, predicateOnChange, uuid } = this.props;
    const selectStyle = {
      width: '100%',
      minWidth: '140px'
    };

    let multiple = false;
    if (predicate === $IN || predicate === $NOT_IN) {
      multiple = true;
    } else {
      if (_.isArray(value)) {
        setTimeout(() => {
          this.onBlurProxy(undefined);
        });
      }
    }

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
          <Select
            onBlur={::this.onBlurProxy}
            multiple={multiple}
            style={selectStyle}
            defaultValue={value}
          >
            {_.map(values, (item) => (
              <Option key={`${item.name}-${item.value}`} value={item.value} >{item.name}</Option>
            ))}
          </Select>
        </FormItem>
        <Button onClick={::this.onDeleteProxy} shape="circle" ><Icon type="delete" /></Button>
      </Form>
    );
  }
}

export default Form.create()(ConditionSelect);
