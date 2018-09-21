import React, { Component } from 'react'
import { Table, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col } from 'reactstrap'
import classnames from 'classnames'

import Utils from './utils'
import Countdown from './countdown'
import Standings from './standings'

const url = Utils.config.urlBase
const urlProblem = Utils.config.urlMain

class Problems extends Component {
  constructor (props) {
    super(props)
    this.state = {
      contestCode: this.props.contestCode,
      contestName: '',
      problems: [],
      activeTab: '1'
    }
  }

  toggle (tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      })
    }
  }

  componentDidMount () {
    const contestUrl = url + '/contests/' + this.state.contestCode
    var token = window.localStorage.access_token
    var what = this
    Utils.getSecureRequest(contestUrl, token, function (err, res) {
      if (!err) {
        var problems = res.problemsList
        process(0)

        function process (i) {
          if (i === problems.length) {
            what.setState({ contestName: res.name, contestCode: res.code, problems: problems })
            return
          }
          var curCode = problems[i].problemCode
          var curURL = url + '/contests/' +
            what.state.contestCode + '/problems/' + curCode

          if (!window.localStorage.getItem(curCode) || window.localStorage.getItem(curCode) === '') {
            Utils.getSecureRequest(curURL, token, function (err, res) {
              if (!err) {
                problems[i].problemName = res.problemName
                window.localStorage.setItem(curCode, res.problemName)
              }

              process(i + 1)
            })
          } else {
            problems[i].problemName = window.localStorage.getItem(curCode)
            process(i + 1)
          }
        }
      } else {
        window.alert(res)
      }
    })
  }

  render () {
    var items = null
    if (this.state.problems.length > 0) {
      items = this.state.problems.map(function (i) {
        return (
          <tr key={i.problemCode}>
            <td>
              <a target='_blank' href={urlProblem + '/' + i.contestCode + '/problems/' + i.problemCode}> {i.problemName} </a>
            </td>
            <td> {i.problemCode} </td>
            <td> {i.successfulSubmissions} </td>
            <td> {parseFloat(i.accuracy).toFixed(2)} </td>
          </tr>
        )
      })
    }

    var problemsView = <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
      <div>
        <Table bordered>
          <thead>
            <tr>
              <th> Name </th>
              <th> Code </th>
              <th> Successful submissions </th>
              <th> Accuracy </th>
            </tr>
          </thead>
          <tbody>
            {items}
          </tbody>
        </Table>
      </div>
      <div style={{ marginLeft: 20 }}>
        <Countdown style={{ justifyContent: 'center', textAlign: 'center' }} />
      </div>
    </div>

    var standingsView = <Standings
      problems={this.state.problems}
    />

    return (
      <div>
        <Nav tabs style={{ justifyContent: 'center', textAlign: 'center' }}>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '1' })}
              onClick={() => { this.toggle('1') }}
            >
              Problems
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => { this.toggle('2') }}
            >
              Standings
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId='1'>
            <Row>
              <Col>
                {problemsView}
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId='2'>
            <Row>
              <Col>
                {standingsView}
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    )
  }
}

export default Problems
