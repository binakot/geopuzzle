'use strict';

import React from "react";
import {render} from "react-dom";
import {Provider} from "react-redux";
import configureStore from './store';
import Map from './components/Map';
import Loading from './components/Loading';
import Infobox from './components/Infobox';
import Toolbox from './components/Toolbox';
import {INIT_LOAD, INIT_LOAD_FAIL, INIT_PUZZLE_DONE} from './actions';
import Congratulation from './components/Congratulation';


class Puzzle extends React.Component {
    mapInit = this.mapInit.bind(this);
    mapClick = this.mapClick.bind(this);

    mapInit() {
        return (dispatch) => {
            dispatch({type: INIT_LOAD});
            return fetch(location.pathname.replace('/maps/', '/maps/questions/') + location.search)
                .then(response => response.json())
                .then(countries => dispatch({type: INIT_PUZZLE_DONE, countries}))
                .catch(response => dispatch({type: INIT_LOAD_FAIL}));
        }
    }

    mapClick(e) {}

    render() {
        return (
            <div>
                <Loading/>
                <Map initCallback={this.mapInit} mapClick={this.mapClick}/>
                <Infobox/>
                <Toolbox showButtons={true}/>
                <Congratulation/>
            </div>
        )
    };
}


let store = configureStore();

render(
    <Provider store={store}>
        <Puzzle />
    </Provider>,
    document.getElementById('puzzle')
);