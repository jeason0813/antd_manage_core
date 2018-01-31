import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Radio, Form, Button, Icon } from 'antd';
import ConditionPredicateSelect from './condition-predicate-select';
import {
  $LIKE,
  $GT,
  $GTE,
  $IN,
  $NOT_IN,
  $LT,
  $LTE,
  $IS_NOT_NULL,
  $IS_NULL
} from '../condition-constants';
import { getPredicates } from '../conditions-utils';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

class ConditionRadio extends React.Component {

  static propTypes = {
    text: PropTypes.string,
    value: PropTypes.string,
    values: PropTypes.array,
    predicate: PropTypes.string,
    form: PropTypes.object,
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
    $IN,
    $NOT_IN,
    $LT,
    $LTE,
    $IS_NOT_NULL,
    $IS_NULL
  ];

  componentWillMount() {
    const { excludePredicates } = this.props;
    this.predicates = getPredicates(
      _.union(
        ConditionRadio.defaultExcludePredicates,
        excludePredicates
      )
    );
  }

  onDeleteProxy() {
    const { uuid, onDelete } = this.props;
    onDelete({ uuid });
  }

  onChangeProxy(e) {
    const { uuid, onChange } = this.props;
    onChange({ value: e.target.value, uuid });
  }

  render() {
    const { value, text, values, form, predicate, predicateOnChange, uuid } = this.props;

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
          {form.getFieldDecorator(uuid, {
            initialValue: value
          })(
            <RadioGroup onChange={::this.onChangeProxy} >
              {_.map(values, (item) => (
                <RadioButton
                  key={item.value}
                  value={item.value}
                >
                  {item.text}
                </RadioButton>
              ))}
            </RadioGroup>
          )}
        </FormItem>
        <Button onClick={::this.onDeleteProxy} shape="circle" ><Icon type="delete" /></Button>
      </Form>
    );
  }
}

export default Form.create()(ConditionRadio);
