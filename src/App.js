import React, { Component } from 'react'
import Contest from './components/contest'
import Utils from './components/utils'
import { Jumbotron, Container, Button } from 'reactstrap'

var config = require('./config-dev.json')
const url = config.urlBase

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      logged: false,
      localStorageSupported: true,
      userInfo: null
    }
  }

  componentDidMount () {
    var what = this
    Utils.checkLocalStorage(function (res) {
      if (!res) {
        what.setState({ localStorageSupported: false })
      } else {
        const refreshToken = window.localStorage.getItem('refreshToken')
        if (refreshToken && refreshToken !== '') {
          what.setState({ logged: true })
          what.handleInfoUser()
        }
      }
    })
  }

  handleInfoUser () {
    var what = this
    const userURL = url + config.urlUser
    var token = window.localStorage.getItem('access_token')
    Utils.getSecureRequest(userURL, token, function (err, data) {
      if (!err) {
        what.setState({ userInfo: data })
        window.localStorage.user = data.username
      } else {
        console.log('Error: ', err)
        Utils.logout()
      }
    })
  }

  render () {
    var user = (this.state.userInfo
      ? <p className='text-success'
        style={{ fontWeight: 'bold', margin: 0 }}>
        Welcome: {this.state.userInfo.username}
      </p>
      : <p className='text-warning'> Anonymous </p>)

    var loginButton = (!this.state.logged ? <Button
      color='primary'
      onClick={() => {
        const callbackURL = url + config.urlAuthorize + '?response_type=code&client_id=' +
          config.clientId + '&state=xyz&redirect_uri=' + config.urlRedirect

        window.location = callbackURL
        Utils.moveTo(callbackURL)
      }}
    >
      Login
    </Button>
      : null)

    var home = <div>
      <div style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Jumbotron fluid style={{ textAlign: 'center', padding: 15 }}>
          <Container fluid>
            <h1>Codechef Virtual Contest</h1>
            <p>Run past contests of Codechef in virtual mode</p>
            {user}
            {loginButton}
          </Container>
        </Jumbotron>
      </div>
      <Contest />
    </div >

    var errorPage = <div> <h2> LocalStorage not supported! </h2> </div>

    return (
      (this.state.localStorageSupported ? home : errorPage)
    )
  }
}

export default App
