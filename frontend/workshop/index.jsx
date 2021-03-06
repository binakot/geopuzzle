'use strict';
import React from "react";
import InfiniteScroll from 'react-infinite-scroll-component';
import Loading from "../components/Loading/index";
import localization from "../localization";


class Workshop extends React.Component {
  constructor(props) {
    super(props);
    this.hasMore = true;
    this.state = {puzzles: [], page: 0, search: '', tag: 0};
  }

  componentDidMount() {
    this.fetchPage(1, false);
  }

  fetchPage(page, replace) {
    let url = `${location.pathname}items/?page=${page}`;
    if (this.state.search) {
      url += `&search=${this.state.search}`;
    }
    if (this.state.tag > 0) {
      url += `&tag=${this.state.tag}`;
    }
    fetch(url, {method: 'GET'})
      .then(response => response.json())
      .then(data => {
        this.hasMore = data.length === 24;
        if (replace) {
          this.setState({...this.state, puzzles: data, page: page});
        } else {
          let items = this.state.puzzles.concat(data);
          this.setState({...this.state, puzzles: items, page: page});
        }
      });
  }

  fetchNextPage = () => {
    this.fetchPage(this.state.page + 1, false);
  };

  onChange = (event) => {
    let value = event && event.target.value || '';
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {this.fetchPage(1, true)}, 300);
    this.setState({...this.state, search: value});
  };

  onChangeTag = (event) => {
    this.setState({...this.state, tag: Number(event.target.value)},
      () => this.fetchPage(1, true));
  };

  render_map(puzzle) {
    return  <div className="col-md-3 col-sm-4 col-xs-6 item-container" key={puzzle.url}>
      <a href={puzzle.url}>
        <img className="img-responsive img-rounded" src={puzzle.image} alt={puzzle.name}/>
      </a>
      <i className="created_by">by {puzzle.user}</i>
      <div className="text-center">{puzzle.name}</div>
    </div>;
  }

  render_controls() {
    return <div className="row">
      <div className="input-group col-sm-5">
        <span className="input-group-addon" id="search-label">{localization.search}:</span>
        <input type="text" className="form-control" maxLength="50" id="search-input" onChange={this.onChange} value={this.state.search} aria-describedby="basic-search-label"/>
      </div>
      <div className="input-group col-sm-5 col-sm-offset-2" style={{display: 'none'}}>
        <span className="input-group-addon" id="tag-label">{localization.tags}:</span>
        <select className="form-control" id="tag-input" onChange={this.onChangeTag} value={this.state.tag} aria-describedby="tag-label">
          <option value={0}>--</option>
          {window.__TAGS__.map(tag => <option value={tag[0]} key={tag[0]}>{tag[1]}</option>)}
        </select>
      </div>
    </div>;
  }

  render() {
    if (this.state.page === 0) {
      return <Loading text={localization.loading}/>;
    }
    let puzzles = this.state.puzzles;
    return <React.Fragment>
      {this.render_controls()}
      <InfiniteScroll dataLength={puzzles.length} children={puzzles} next={this.fetchNextPage}
                             hasMore={this.hasMore} loader={<Loading text={localization.loading}/>}>
        {puzzles.map(this.render_map)}
      </InfiniteScroll>
    </React.Fragment>;
  }
}

export default Workshop;
