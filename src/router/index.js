import React, { Fragment } from 'react';
import { HashRouter, Route, Switch, Redirect} from 'react-router-dom'
import App from '../App';
import Layout from '../layout';
import Upload from '../pages/upload';
import AllFiles from '../pages/allfiles';
import Gallery from '../pages/gallery';
import TrayPage from '../pages/traypage';
import Pdf from '../pages/pdf';
import Music from '../pages/music'

export default class ERouter extends React.Component {
  render() {
    return (
      <HashRouter>
        <App>
          <Switch>
            <Route path='/tray-page' component={TrayPage} />
            <Route path='/pdf-viewer' component={Pdf} />
            <Route path="/" render={() => 
              <Layout>
                <Switch>
                  <Route path="/setting" render={() => (
                    <Fragment>
                      <Route path='/setting/upload' component={Upload} />
                      <Route path='/setting/gallery' component={Gallery} />
                      <Route path='/setting/all-files' component={AllFiles} />
                      <Route path="/setting/music-viewer" component={Music} />
                    </Fragment>
                  )} />
                  <Redirect to="/setting/upload" />
                </Switch>
              </Layout>
            }/> 
          </Switch>
        </App>
      </HashRouter>
    )
  }
}