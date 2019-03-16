// 引入createStore创建store，引入applyMiddleware 来使用中间件
import { createStore } from 'redux';
// 引入所有的reducer
import reducer from './../reducer';
// import db from '../../datastore';

const initialState = {
  menuName: '',
}
const configureStore = () => createStore(reducer, initialState);

export default configureStore;