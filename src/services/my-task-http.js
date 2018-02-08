import BaseHttp from './base-http';
import { injectable } from '../decorators';
import manageApi from '../decorators/manage-api';

@injectable()
export default class MyTaskHttp extends BaseHttp {

  @manageApi('/v1/myTask') api;

}
