import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/coinActions'
import { Link } from 'react-router-dom'

import helpers from '../../helpers'

import Announcements from '../Announcements'
import Legend from '../Legend'
import Loading from '../Loading'
import RatingDropdown from './RatingDropdown'
import SortSymbol from './SortSymbol'
import Paginate from './Paginate'

import { Sparklines, SparklinesLine } from 'react-sparklines';
import axios from 'axios'
import { Button, Table, Nav, NavItem, NavLink, Row, Col } from 'reactstrap'
import classnames from 'classnames'

class FullList extends Component {
  state = {
    ratingRender: 'main',
    sortId: 'rank',
    sortAsc: true,
    fetching: true,
    page: 1,
    viewGraph: false,
    viewAll: false
  }

  async componentDidMount() {
    let page = this.props.match.params.page
    if (page === "all") this.setState({ viewAll: true })
    if (page === undefined && page !== "all") page = 1

    let data = await this.props.fetchCoins(page)
    this.setState({
      fetching: data.fetching,
      page: Number.parseInt(page, 10)
    })
  }

  mappedCoins = () => {
    return this.props.coins
      .filter(coin => coin.rank)
      .sort((a, b) => {
        if (this.state.sortId !== "name") return helpers.sortNumber(this.state.sortAsc, a, b, this.state.sortId)
        if (this.state.sortId === "name") return helpers.sortString(this.state.sortAsc, a, b, 'name')
        else return this.state.sortAsc ? a.rank - b.rank : b.rank - a.rank
      })
      .map((coin, i) => {
        const { _id, rank, logo, name, market_cap_usd, price_usd, percent_change_1h, percent_change_24h, percent_change_7d, symbol, rating } = coin

        return (
          <tr className="rating-list-table" key={i}>
            <td>{ rank }</td>
            <td>{ this.renderRating(rating, _id, symbol) }</td>

            {/* NAME */}
            <td>
              <Link to={`/info/${symbol}`}>
                <img className="coin-list-logo" src={logo} alt=""/>
                { ` ${name} (${symbol})` }
              </Link>
            </td>

            <td className="list-marketcap">{ helpers.stringToUSD(market_cap_usd).split('.')[0] }</td>
            <td>{ helpers.stringToUSD(price_usd) }</td>

            {this.state.viewGraph ?
              <td style={{padding: '5px'}}>
                <Sparklines data={[0, 9153.92, 9223.92, 9323.92, 9123.92, 9523.92, 9723.92]} height={50}>
                  <SparklinesLine color="blue" />
                </Sparklines>
              </td> :
              [
                <td key="1h" className={`list-1h ${helpers.colorChange(percent_change_1h)}`}>{ `${percent_change_1h}%` }</td>,
                <td key="24h" className={`list-24h ${helpers.colorChange(percent_change_24h)}`}>{ `${percent_change_24h}%` }</td>,
                <td key="7d" className={`list-7d ${helpers.colorChange(percent_change_7d)}`}>{ `${percent_change_7d}%` }</td>
              ]
            }
          </tr>
        )
      })
  }

  renderRating = (rating, id, symbol) => {
    let user = this.props.user ? this.props.user._id : ''
    let devId = '5aa825ea429914ba0cf5fe0d'
    let prodId = '5aa8276f2383e20014458794'

    switch (this.state.ratingRender) {
      case 'main':
        return (
          (user === devId || user === prodId) ?
          <RatingDropdown rating={rating} coinId={id}/> :
          <span className={`grade-box ${helpers.renderRatingBox(rating)}`}>
            {rating}
          </span>
        )
      case 'user':
        return (
          (user !== devId && user !== prodId) ?
          <RatingDropdown coinId={id} symbol={symbol} userId={user}/> :
          <span className={`grade-box ${helpers.renderRatingBox(rating)}`}>
            {rating}
          </span>
        )
      default:
        return (
          <span className={`grade-box ${helpers.renderRatingBox(rating)}`}>
            {rating}
          </span>
        )
    }
  }





  toggleTab = tab => {
    if (this.state.ratingRender !== tab) {
      this.setState({ ratingRender: tab })
    }
  }

  toggleSort = event => {
    let id = event.currentTarget.id

    if (this.state.sortId === id) {
      this.setState({ sortAsc: !this.state.sortAsc })
    } else {
      this.setState({ sortId: id, sortAsc: true })
    }
  }



  toggleGraphPercentView = () => {
    this.setState({
      viewGraph: !this.state.viewGraph
    })
  }

  handleReset = () => {
    axios.post('/api/coin/master-reset', { userId: this.props.user._id })
  }



  render() {
    const { page, sortId, sortAsc, ratingRender, fetching, viewAll } = this.state
    let devId = '5aa825ea429914ba0cf5fe0d'
    let prodId = '5aa8276f2383e20014458794'

    return (
      <div className="home">
        <Announcements />
        <Legend />
        <Row>
          <Col>
            {this.props.user &&
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={`rating-tab ${classnames({ active: ratingRender === 'main' })}`}
                    onClick={() => { this.toggleTab('main'); }}
                  >
                    Main
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={`rating-tab ${classnames({ active: ratingRender === 'user' })}`}
                    onClick={() => { this.toggleTab('user'); }}
                  >
                    Yours
                  </NavLink>
                </NavItem>
              </Nav>}
          </Col>

          {/* MASTER RESET BUTTON */}
          {this.props.user && (this.props.user._id === devId || this.props.user._id === prodId) &&
          <Col style={{textAlign: "center"}}>
            <Button style={{marginTop: "13px"}} color="danger" size="sm" onClick={this.handleReset}>RESET</Button>
          </Col>}


          {/* GRAPH COLUMN */}
          {/*!viewAll &&
            <Col style={{textAlign: "center"}}>
              {!viewGraph ?
                <Button style={{marginTop: "13px"}} outline size="sm" onClick={this.toggleGraphPercentView}>Graph View</Button> :
                <Button style={{marginTop: "13px"}} outline size="sm" onClick={this.toggleGraphPercentView}>Percent View</Button>
              }
            </Col>
          */}

          <Col>
            <Paginate page={page} viewAll={viewAll} />
          </Col>
        </Row>





        <Table striped hover className="list-table">
          <thead>
            <tr>
              <th id="rank" className="list-sort" onClick={this.toggleSort}>
                # <SortSymbol sortId={sortId} sortAsc={sortAsc} divId="rank"/>
              </th>
              <th>Rating</th>
              <th id="name" className="list-sort" onClick={this.toggleSort}>
                Name <SortSymbol sortId={sortId} sortAsc={sortAsc} divId="name"/>
              </th>
              <th id="market_cap_usd" className="list-marketcap list-sort" onClick={this.toggleSort}>
                Market Cap <SortSymbol sortId={sortId} sortAsc={sortAsc} divId="market_cap_usd"/>
              </th>
              <th id="price_usd" className="list-sort" onClick={this.toggleSort}>
                Price <SortSymbol sortId={sortId} sortAsc={sortAsc} divId="price_usd"/>
              </th>

              {this.state.viewGraph ?
                <th>7 day Graph</th> :
                [
                  <th key="1h" id="percent_change_1h" className="list-sort" onClick={this.toggleSort}>
                    % 1h <SortSymbol sortId={sortId} sortAsc={sortAsc} divId="percent_change_1h"/>
                  </th>,
                  <th key="24h" id="percent_change_24h" className="list-24h list-sort" onClick={this.toggleSort}>
                    % 24h <SortSymbol sortId={sortId} sortAsc={sortAsc} divId="percent_change_24h"/>
                  </th>,
                  <th key="7d" id="percent_change_7d" className="list-7d list-sort" onClick={this.toggleSort}>
                    % 7d <SortSymbol sortId={sortId} sortAsc={sortAsc} divId="percent_change_7d"/>
                  </th>
                ]
              }
            </tr>
          </thead>
          <tbody>
            {!fetching &&
              this.mappedCoins()
            }
          </tbody>
        </Table>

        { fetching && <Loading /> }

        <Paginate page={page} viewAll={viewAll} />
        <hr />
      </div>
    )
  }
}

function mapStateToProps({ user, coins }) {
  return { user, coins }
}

export default connect(mapStateToProps, actions)(FullList)
