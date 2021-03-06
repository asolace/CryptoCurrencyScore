import React from 'react';
import axios from 'axios'
import { connect } from 'react-redux'
import helpers from '../../helpers'

import { ButtonDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';

class RatingDropdown extends React.Component {
  state = {
    url: '/api/coin-update',
    dropdownOpen: false,
  }

  async componentDidMount() {
    let user = this.props.user._id || ''
    let devId = '5aa825ea429914ba0cf5fe0d'
    let prodId = '5aa8276f2383e20014458794'
    var url = '/api/coin-update'

    // Sets API Endpoint URL
    if (user === devId || user === prodId) {
      url = "/api/coin/master-coin-update"
    } else {
      url = "/api/coin-update"
    }

    this.setState({
      url: url
    })
  }

  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    })
  }


  changeRating = event => {
    let value = event.target.innerHTML

    axios.post(this.state.url, {
      userId: this.props.user._id,
      coinId: this.props.coinId,
      coinRatingUpdate: value
    })

    this.setState({
      dropdownOpen: false,
      rating: value
     })
  }

  render() {
    let rating = this.state.rating || this.props.rating
    return (
      <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle className={`btn-grade-dropdown gb-sm ${helpers.renderRatingBox(rating)}`} caret>
          {rating}
        </DropdownToggle>
        <DropdownMenu className="change-list-container">
          <ul className="change-list">
            <li className="grade-box gb-a gb-sm" onClick={this.changeRating}>A</li>
            <li className="grade-box gb-b gb-sm" onClick={this.changeRating}>B</li>
            <li className="grade-box gb-c gb-sm" onClick={this.changeRating}>C</li>
            <li className="grade-box gb-d gb-sm" onClick={this.changeRating}>D</li>
            <li className="grade-box gb-f gb-sm" onClick={this.changeRating}>F</li>
            <li className="grade-box gb-n gb-sm" onClick={this.changeRating}>N</li>
          </ul>
        </DropdownMenu>
      </ButtonDropdown>
    )
  }
}

function mapStateToProps({ user }) {
  return { user }
}

export default connect(mapStateToProps)(RatingDropdown)
