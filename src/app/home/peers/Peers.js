import React, { Component } from 'react';
import { connect } from "react-redux";
import { withRouter } from 'react-router';
import DotSpinner from '../../common/ui/dot-spinner/DotSpinner';
import randomColor from 'randomcolor';
import pickColor from 'pick-a-good-color';
import { peersChanged } from '../../utils/blockchainUtils';

import './Peers.css';

class Peers extends Component {
  componentDidMount() {
    window.$('.peer-slick').on('init', () => {
      let { peers } = this.props;

      if (peers.length) {
        setTimeout(() => {
          this.repopulateCarousel(peers);
        }, 1000)
      }
    });

    window.$('.peer-slick').slick({
      dots: true,
      infinite: false,
      slidesToShow: 4,
      slidesToScroll: 4,
      accessibility: false,
      responsive: [
        {
          breakpoint: 1025,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
          }
        },
        {
          breakpoint: 769,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 481,
          settings: {
            dots: false,
            slidesToShow: 1,
            slidesToScroll: 1
          }
        },
      ]
    });
  }

  repopulateCarousel(peers) {
    // clear the carousel first (for simiplicity)
    window.$('.peer-slick').slick('slickRemove', null, null, true);

    // populate it again
    for (let peer of peers) {
      let background = randomColor();
      let color = pickColor(['#000000', '#ffffff'], { background });

      window.$('.peer-slick').slick('slickAdd', 
        `<div class="Peer">` + 
          `<div class="peer-icon font-tiny" style="background-color: ${background}; color: ${color}">` +
            `${peer.type === 'full' ? 'fullnode' : 'thinnode'}` +
          `</div>` +
          `<div class="peer-item peer-uuid font-small text-truncate">` +
            `${peer.uuid}` +
          `</div>` +
          `<div class="peer-item font-small text-truncate">` +
            `${peer.remoteAddr}` +
          `</div>` +
        `</div>`
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let { peers: prevPeers } = prevProps;
    let { peers } = this.props;

    if (peersChanged(prevPeers, peers)) {
      this.repopulateCarousel(peers);
    }
  }

  render() {
    let { peers } = this.props;

    return (
      <div className="Peers">
        <h1 className="ps-head">Connected Peers</h1>
        <div className="ps-body">
          <div className="peer-slick"></div>
          {!peers.length && (
            <div className="ps-spinner-container">
              <DotSpinner />
              <div>
                Loading peers... please wait
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(connect(
  state => ({
    peers: state.blockchain.peers
  }),
  dispatch => ({})
)(Peers));
