import React from 'react';
import PropTypes from 'prop-types';
import { injectItemComponent } from '../conditions-utils';
import styles from './condition-tree-item.styl';

class ConditionTreeItem extends React.Component {

  static propTypes = {
    condition: PropTypes.object,
    path: PropTypes.string,
    conditionSortableRef: PropTypes.func
  };

  render() {
    const { condition, conditionSortableRef } = this.props;

    injectItemComponent(condition);

    const classNames = `draggable-condition ${styles.container}`;

    return (
      <div
        data-name={condition.name}
        data-uuid={condition.uuid}
        className={classNames}
        ref={conditionSortableRef}
      >
        {condition.component}
      </div>
    );
  }
}

export default ConditionTreeItem;
