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
import MusicList from '../pages/musicList';
import DocumentList from '../pages/documetList';
import VideoList from '../pages/videoList';
import Zip from '../pages/zip';

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
            <Route path="/zip-viewer" component={Zip} />
            <Route path="/" render={() => 
              <Layout>
                <Switch>
                  <Route path="/setting" render={() => (
                    <Fragment>
                      <Route path='/setting/upload' component={Upload} />
                      <Route path='/setting/gallery' component={Gallery} />
                      <Route path='/setting/all-files' component={AllFiles} />
                      <Route path='/setting/music-list' component={MusicList} />
                      <Route path='/setting/document-list' component={DocumentList} />
                      <Route path='/setting/video-list' component={VideoList} />
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