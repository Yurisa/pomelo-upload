import React from 'react';
import { HashRouter, Route, Switch, Redirect} from 'react-router-dom'
import App from '../App';
import Layout from '../layout';
import Upload from '../pages/upload';
import Gallery from '../pages/gallery';

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
                  <Route path='/gallery' component={Gallery}></Route>
                  <Redirect to="/upload" />
                </Switch>
              </Layout>
            }/> 
          </Switch>
        </App>
      </HashRouter>
    )
  }
}