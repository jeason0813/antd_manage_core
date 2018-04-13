import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import qs from 'qs';
import { Row, Button, Card, Col, Icon } from 'antd';
import DI from '../../../di';
import OfflineStorge from '../../../services/offline-storge';
import {
  checkInputConditions,
  arrayToStateConditions,
  conditionsToResult,
  conditionsToQueryString,
  parseInputConditions,
  injectItemComponent,
  conditionsValueToNull,
  checkConditionsHasValue,
  valueNotNull
} from '../../condition-editor/conditions-utils';
import { queryInjectCondition } from '../../../utils/common';
import { generateNewCondition } from '../tablex-utils/tablex-utils';
import ConditionHistory from '../table-condition-history/table-condition-history';
import ConditionControlBoard from '../condition-control-board/condition-control-board';
import styles from '../../condition-editor/condition-search.styl';


export default class TablexCondition extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    conditions: PropTypes.any,
    fieldConfigs: PropTypes.object,
    userConditions: PropTypes.any,
    userFieldConfigs: PropTypes.object,
    formatConditionQuery: PropTypes.func,
    qsFormatSearchQuery: PropTypes.func,
    resetQueryString: PropTypes.func,
    realTime: PropTypes.bool,
    searchStr: PropTypes.string
  };

  static defaultProps = {
    conditions: [],
    fieldConfigs: {},
    userConditions: [],
    userFieldConfigs: {},
    onSearch: _.noop,
    realTime: true
  };

  state = {
    conditions: [],
    userConditions: [],
    visible: false,
    userSectionToggle: false,
    offlineItems: []
  };

  componentWillMount() {
    const { conditions, userConditions, searchStr } = this.props;
    if (searchStr) {
      const locationQueryObject = qs.parse(searchStr);
      queryInjectCondition(locationQueryObject, conditions);
      this.onSearch();
    }
    this.prevConditionsString = '';
    this.prevUserConditionsString = '';
    this.setInputConditions(conditions, userConditions);
    this.initStateCondition();
  }

  componentWillReceiveProps(nextProps) {
    const { conditions, searchStr } = this.props;
    if (nextProps.searchStr !== searchStr) {
      const locationQueryObject = qs.parse(searchStr);
      queryInjectCondition(locationQueryObject, conditions);
      this.onSearch();
    }
  }

  onShow() {
    this.setState({
      visible: true
    });
  }

  onSearch() {
    const { resetQueryString } = this.props;
    const { conditions, userConditions } = this.state;
    const conditionResult = conditionsToResult(conditions);

    let userConditionResult = '';
    if (userConditions.length > 1) {
      userConditionResult = conditionsToResult(userConditions);
    }
    const type = 'ConditionSearch';

    if (conditionResult.length || userConditionResult.length) {
      this.refs.conditionHistory.addConditions(conditionResult, type, userConditionResult);
    }

    const conditionQuery = conditionsToQueryString(conditionResult);
    const userConditionQuery = conditionsToQueryString(userConditionResult, true);
    const conditionQueryString =
      this.generateConditionQueryString(conditionQuery, conditionResult);
    const userConditionQueryString = this.generateConditionQueryString(
      userConditionQuery,
      userConditionResult,
      'userConditions'
    );
    const queryString = this.generateQueryString(conditionQueryString, userConditionQueryString);
    if (_.isFunction(resetQueryString)) {
      resetQueryString(queryString);
    }
  }

  onUse(e) {
    const { conditions, type, userConditions } = e.value;

    // stateConditions只会有一层
    if (type === 'ConditionSearch') {
      const stateConditions = this.injectHistoryConditions(conditions, this.state.conditions);
      const stateUserConditions =
        this.injectHistoryConditions(userConditions, this.state.userConditions);
      this.setConditions(stateConditions, stateUserConditions);
    }
  }

  onClear() {
    const { conditions, userConditions } = this.state;
    conditionsValueToNull(conditions);
    conditionsValueToNull(userConditions);
    this.prevConditionsString = '';
    this.prevUserConditionsString = '';
    this.setState({
      conditions,
      userConditions
    }, () => {
      this.onSearch();
    });
  }

  onToggleIcon() {
    this.setState({
      userSectionToggle: !this.state.userSectionToggle
    });
  }
  setConditions(conditions, userConditions) {
    const { realTime } = this.props;
    let emitCondition = true;

    const conditionsString = this.transformPredicateAndValueString(conditions);
    const userConditionsString = this.transformPredicateAndValueString(userConditions);

    if ((conditions.length === 1 || this.prevConditionsString === conditionsString)
      && (userConditions.length === 1 || this.userConditionsString === userConditionsString)) {
      emitCondition = false;
    }

    this.prevConditionsString = conditionsString;
    this.prevUserConditionsString = userConditionsString;

    this.setState({
      conditions,
      userConditions
    }, () => {
      if (realTime && emitCondition) {
        this.onSearch();
      }
    });
  }

  setInputConditions(inputConditions, inputUserConditions) {
    if (inputConditions && inputUserConditions) {
      const conditions =
        arrayToStateConditions(this.parseInputConditions(inputConditions), this, false);
      const userConditions =
        arrayToStateConditions(this.parseInputConditions(inputUserConditions), this, true);
      this.setState({
        conditions,
        userConditions
      });
    } else if (inputConditions) {
      this.setState({
        conditions: arrayToStateConditions(this.parseInputConditions(inputConditions), this, false)
      });
    }
  }

  getConditionsComponents = (userConditions) => (
    _.map(
      _.take(userConditions, userConditions.length - 1),
      (condition) => (
        <div key={`${condition.value}_${condition.uuid}`} >
          <Col
            xs={24}
            sm={12}
            md={12}
            lg={12}
            className={styles.item}
          >
            {injectItemComponent(condition).component}
          </Col>
        </div>
      )
    )
  );

  injectHistoryConditions(conditionHistroy, conditions) {
    _.each(conditionHistroy, (condition) => {
      if (valueNotNull(condition)) {
        const cloneCondition = _.clone(condition);
        const value = cloneCondition.value;
        const predicate = cloneCondition.predicate;
        delete cloneCondition.value;
        delete cloneCondition.predicate;
        const stateCondition = _.find(conditions, cloneCondition);
        if (stateCondition) {
          stateCondition.value = value;
          stateCondition.predicate = predicate;
        }
      }
    });
    return conditions;
  }

  parseInputConditions(inputConditions) {
    let conditions;
    try {
      conditions = parseInputConditions(inputConditions);
      checkInputConditions(conditions, this);
    } catch (e) {
      // console.warn('parseInputConditions error: ', e);
      conditions = [];
    }
    return conditions;
  }

  // conditions => $lt=3&$gt=4
  transformPredicateAndValueString(conditions) {
    const stringItems = [];
    const lastIndex = conditions.length - 1;
    _.each(conditions, (condition, index) => {
      if (valueNotNull(condition) && index < lastIndex) {
        stringItems.push(`${condition.predicate}=${condition.value}`);
      }
    });
    return stringItems.join('&');
  }

  generateQueryString(conditionQuery, userConditionQuery) {
    if (userConditionQuery && conditionQuery) {
      return `${conditionQuery}&${userConditionQuery}`;
    } else if (conditionQuery) {
      return conditionQuery;
    }
    return userConditionQuery;
  }

  generateConditionQueryString(query, result, queryKey) {
    let key = queryKey;
    if (!queryKey) {
      key = 'conditions';
    }

    const { qsFormatSearchQuery, formatConditionQuery } = this.props;
    let conditionQuery = query || '';
    if (formatConditionQuery && qsFormatSearchQuery) {
      conditionQuery = formatConditionQuery(result, key);
      conditionQuery = `${conditionQuery}&${this.qsFormatSearchQuery(result, key)}`;
    } else if (qsFormatSearchQuery) {
      conditionQuery = this.qsFormatSearchQuery(result, key);
    } else if (formatConditionQuery) {
      conditionQuery = formatConditionQuery(result, key, query);
    }
    return conditionQuery;
  }

  qsFormatSearchQuery(queryObj, queryKey) {
    return `${queryKey}=${encodeURIComponent(qs.stringify({ conditions: queryObj }))}`;
  }

  initStateCondition() {
    const { name, conditions, fieldConfigs } = this.props;
    const conditionItems = _.filter(conditions, (item) => (item.operationValue));
    let offlineItems = [];
    this.offlineStorgeOfConditionConfig = new OfflineStorge(
      DI.get('config').get('core.conditionEditor.configStorageName')
    );
    _.each(conditionItems, (value) => {
      offlineItems.push({
        title: fieldConfigs[value.operationValue].text
      });
    });

    this.offlineStorgeOfConditionConfig.get(name)
      .then((offlineConfigs) => {
        offlineItems = generateNewCondition(offlineItems, offlineConfigs);
        this.offlineStorgeOfConditionConfig.add(name, offlineItems);
        this.setState({ offlineItems });
      });
  }

  filterConditionByOrder(conditions) {
    const filterConditions = [];
    const { offlineItems } = this.state;
    _.each(offlineItems, (value) => {
      if (!value.hide) {
        filterConditions.push(_.find(conditions, (item) => (item.text === value.title)));
      }
    });
    filterConditions.push(_.find(conditions, (item) => (item.uuid)));
    return filterConditions;
  }

  resetConditionConfig(resetConditionItems, reset) {
    const { name, conditions, fieldConfigs } = this.props;
    let offlineItems;
    if (!reset) {
      offlineItems = resetConditionItems;
    } else {
      offlineItems = [];
      const conditionItems = _.filter(conditions, (item) => (item.operationValue));
      _.each(conditionItems, (value) => {
        offlineItems.push({
          title: fieldConfigs[value.operationValue].text
        });
      });
    }
    this.offlineStorgeOfConditionConfig.add(name, offlineItems);
    this.setState({ offlineItems });
  }

  render() {
    const {
      conditions, userConditions, userSectionToggle, offlineItems
    } = this.state;
    const {
      fieldConfigs, userFieldConfigs, name, realTime
    } = this.props;
    let components;
    let userConditionsComponents;
    let searchInputCoponent;
    let toggleIcon;
    let userSectionClassName;
    if (userSectionToggle) {
      toggleIcon = (<Icon
        type="up-circle-o"
        className={`${styles.toggleIcon} ${styles.toggleIconActive}`}
        onClick={::this.onToggleIcon}
      />);
      userSectionClassName = '';
    } else {
      toggleIcon = (
        <Icon type="down-circle-o" className={styles.toggleIcon} onClick={::this.onToggleIcon} />
      );
      userSectionClassName = styles.userSearchToggle;
    }

    components = this.getConditionsComponents(this.filterConditionByOrder(conditions));
    userConditionsComponents = this.getConditionsComponents(userConditions);
    if (conditions.length > 0 && userConditions.length > 0) {
      searchInputCoponent = (
        <div>
          <section className={styles.userSearch}>
            <div className={styles.userSearchTitle}>
              基础维度
            </div>
            <Row className={styles.forms} gutter={16} >
              {components}
            </Row>
          </section>
          <section className={styles.userSearch}>
            <div className={styles.userSearchTitle}>
              用户维度
            </div>
            <Row className={`${styles.forms} ${userSectionClassName}`} gutter={16} >
              {userConditionsComponents}
            </Row>
            {toggleIcon}
          </section>
        </div>
      );
    } else if (conditions.length > 0) {
      searchInputCoponent = (
        <Row className={styles.forms} gutter={16} >
          {components}
        </Row>
      );
    }

    let extra;
    extra = ((
      <div>
        <ConditionControlBoard
          offlineItems={offlineItems}
          resetConditionConfig={::this.resetConditionConfig}
        />
        <ConditionHistory
          onUse={::this.onUse}
          fieldConfigs={fieldConfigs}
          userFieldConfigs={userFieldConfigs}
          name={name}
          ref="conditionHistory"
          key="conditionHistory"
        />
      </div>
    ));

    let searchButton;
    if (!realTime) {
      searchButton = (<Button type="primary" onClick={::this.onSearch} >搜索</Button>);
    }

    let clearButton;
    if (checkConditionsHasValue(conditions) || checkConditionsHasValue(userConditions)) {
      clearButton = (<Button onClick={::this.onClear} >清空条件</Button>);
    }
    return (
      <div className={styles.container} >
        <Card title="搜索" extra={extra} >
          {searchInputCoponent}
          <Row>
            <div className={styles.action} >
              {searchButton}
              {clearButton}
            </div>
          </Row>
        </Card>
      </div>
    );
  }

}

