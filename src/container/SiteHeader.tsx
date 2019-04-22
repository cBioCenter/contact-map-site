import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Header, Menu } from 'semantic-ui-react';

import { IContactMapSiteState } from '~contact-map-site~/reducer';

export interface ISiteHeaderProps {
  pathname: string;
}

export interface ISiteHeaderState {
  currentPageName: null | string;
}

export class UnconnectedSiteHeader extends React.Component<ISiteHeaderProps, ISiteHeaderState> {
  constructor(props: ISiteHeaderProps) {
    super(props);
    this.state = {
      currentPageName: null,
    };
  }

  public componentDidMount() {
    this.setState({
      currentPageName: this.props.pathname,
    });
  }

  public componentDidUpdate(prevProps: ISiteHeaderProps) {
    if (this.props.pathname && this.props.pathname !== this.state.currentPageName) {
      this.setState({
        currentPageName: this.props.pathname,
      });
    }
  }

  public render() {
    return (
      <Header>
        <Menu secondary={true} borderless={true} fluid={true} style={{ maxHeight: '40px', padding: '20px 0 0 0' }}>
          <Menu.Item fitted={'vertically'} position={'left'}>
            <Link to={'/'}>
              <img
                alt={'hca-dynamics-icon'}
                src={'assets/icons/bio-blocks-icon-2x.png'}
                style={{ height: '32px', width: '32px' }}
              />
              <span style={{ color: 'black', fontSize: '32px', fontWeight: 'bold' }}>
                ContactMap.org: 2D and 3D Visualization
              </span>
            </Link>
          </Menu.Item>
        </Menu>
        {this.renderNavMenu()}
      </Header>
    );
  }

  protected renderNavMenu = () => {
    const { currentPageName } = this.state;

    return (
      <Menu defaultActiveIndex={-1} secondary={true}>
        <Menu.Item key={'home'}>
          <Link
            to={'/'}
            style={{ color: 'black', fontSize: '18px', fontWeight: currentPageName === '/' ? 'bold' : 'normal' }}
          >
            Home
          </Link>
        </Menu.Item>
        <Menu.Item key={'manuscript'}>
          <Link
            to={'/manuscript'}
            style={{
              color: 'black',
              fontSize: '18px',
              fontWeight: currentPageName === '/manuscript' ? 'bold' : 'normal',
            }}
          >
            Manuscripts
          </Link>
        </Menu.Item>
      </Menu>
    );
  };
}

const mapStateToProps = (state: IContactMapSiteState) => ({
  pathname: state.router.location.pathname,
});

export const SiteHeader = connect(mapStateToProps)(UnconnectedSiteHeader);
