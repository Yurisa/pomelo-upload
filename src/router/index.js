import React from 'react';
import { HashRouter, Route, Switch, Redirect} from 'react-router-dom'
import App from '../App';
import Layout from '../layout/index';
import Upload from '../pages/upload/index';

export default class ERouter extends React.Component {
  render() {
    return (
      <HashRouter>
        <App>
          <Switch>
            <Route path="/" render={() => 
              <Layout>
                <Switch>
                  <Route path='/upload' component={Upload}></Route>
                </Switch>
              </Layout>
            }/> 
          </Switch>
        </App>
      </HashRouter>
    )
  }
}