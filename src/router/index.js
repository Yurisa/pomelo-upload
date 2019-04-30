import React, { Fragment } from 'react';
import { HashRouter, Route, Switch, Redirect} from 'react-router-dom'
import App from '../App';
import Layout from '../layout';
import Upload from '../pages/upload';
import AllFiles from '../pages/allfiles';
import Gallery from '../pages/gallery';
import TrayPage from '../pages/traypage';
import Pdf from '../pages/pdf';
import Music from '../pages/music';
import Video from '../pages/video';
import Text from '../pages/text';

export default class ERouter extends React.Component {
  render() {
    return (
      <HashRouter>
        <App>
          <Switch>
            <Route path='/tray-page' component={TrayPage} />
            <Route path='/pdf-viewer' component={Pdf} />
            <Route path="/music-player" component={Music} />
            <Route path="/video-player" component={Video} />
            <Route path="/text-viewer" component={Text} />
            <Route path="/" render={() => 
              <Layout>
                <Switch>
                  <Route path="/setting" render={() => (
                    <Fragment>
                      <Route path='/setting/upload' component={Upload} />
                      <Route path='/setting/gallery' component={Gallery} />
                      <Route path='/setting/all-files' component={AllFiles} />
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