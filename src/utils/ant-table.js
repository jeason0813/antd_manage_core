import _ from 'lodash';
import DI from '../di';
import { stringToUnderlineCase, stringToCamelCase } from './common'

export const transformOrder = (sorter) => (
   `${(sorter.order === 'ascend' ? '' : '-')}${transformSorterField(sorter)}`
);

export const transformSorterField = (sorter) => {
  let {
    field,
    column: { sorterType }
  } = sorter;
  if (sorterType === 'underline') {
    field = stringToUnderlineCase(field);
  } else if (sorterType === 'camel') {
    field = stringToCamelCase(field);
  }
  return field;
}

// @todo filters
export const generateQuery = ({ pagination = {}, sorter } = {}) => {
  const query = {
    limit: pagination.pageSize || DI.get('config').get('core.pagination.pageSize'),
    offset: (pagination.current - 1) * pagination.pageSize || 0
  };

  if (!_.isEmpty(sorter)) {
    query.order = transformOrder(sorter);
  }

  return query;
};

export const generatePagination = (pagination = {}, pageSizeChanger = false) => {
  const total = pagination.total || 0;
  const current = (pagination.offset / pagination.limit + 1) || 1;
  const showSizeChanger = pageSizeChanger;
  const pageSizeOptions = showSizeChanger ? ['5', '10', '20', '30'] : [];
  return _.merge({}, DI.get('config').get('core.pagination'), {
    total,
    showSizeChanger,
    pageSizeOptions,
    current,
    pageSize: pagination.limit
  });
};
