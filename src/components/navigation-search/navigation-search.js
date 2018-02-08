import React from 'react';
import { Select } from 'antd';
import DI from '../../di';
import HashHistory from '../../router/hash-history';
import _ from 'lodash';
import styles from './navigation-search.styl';

const { Option, OptGroup } = Select;
export default class NavigationSearch extends React.Component {
  state = {
    configs: [],
    value: undefined
  };

  componentWillMount() {
    DI.get('navigation')
      .getConfigs()
      .then((configs) => this.processNavigation(configs));
  }

  getAllNavigation(configs, title) {
    _.map(configs, (c) => {
      const nextTitle = title ? `${title}-${c.name}` : c.name;
      if (c.component && c.path) {
        this.nav.push({ ...c, title: nextTitle });
      }
      if (c.child) {
        this.getAllNavigation(c.child, nextTitle);
      }
    });
  }

  nav = [];
  processNavigation(configs) {
    this.getAllNavigation(configs);
    const searchableNav = _.filter(this.nav, (n) => (
      n.path.indexOf('/:') < 0) && (n.title.indexOf('首页') < 0
    ));
    const configGroup = {};
    _.map(searchableNav, (nav) => {
      const name = nav.title;
      if (name.indexOf('-') < 0) {
        configGroup[name] = [nav];
      } else {
        const group = name.split('-')[0];
        if (!configGroup[group]) {
          configGroup[group] = [];
        }
        configGroup[group].push({
          ...nav,
          title: nav.title.replace(`${group}-`, '')
        });
      }
    });
    this.setState({ configs: configGroup });
  }

  handleChange(value) {
    HashHistory.push(value);
  }

  render() {
    const { value, configs } = this.state;
    const options = _.map(configs, (conf, key) => (
      <OptGroup label={key} key={key}>
        {conf.map(d => <Option key={d.title} value={d.path}>{d.title}</Option>)}
      </OptGroup>
    ));
    return (
      <div className={styles.container}>
        <Select
          ref="search"
          showSearch
          style={{ width: 250, marginTop: '-5px' }}
          placeholder="搜索..."
          optionFilterProp="children"
          onChange={::this.handleChange}
          value={value}
          filterOption={
            (input, option) =>
              (option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0)
          }
        >
          {options}
        </Select>
      </div>
    );
  }
}
