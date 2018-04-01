'use strict';
import React from "react";
import Game from "./base";
import {decodePolygon, moveTo, prepareInfobox} from "../utils";
import localization from "../localization";


import Button from "react-bootstrap/es/Button";


class Puzzle extends Game {
    GAME_NAME = 'puzzle';

    static extractData(polygons, solved) {
        return polygons.map(country => {
            let paths = decodePolygon(country.polygon);
            return {
                id: country.id,
                draggable: true,
                isSolved: false,
                infobox: {name: country.name, loaded: false},
                paths: moveTo(
                    paths,
                    new google.maps.LatLng(country.center[1], country.center[0]),
                    new google.maps.LatLng(country.default_position[1], country.default_position[0]))
            }
        }).concat(solved.map(region => {
            return {
                id: region.id,
                draggable: false,
                isSolved: true,
                infobox: region.infobox,
                paths: decodePolygon(region.polygon)
            }
        })).sort((one, another) => {
            return one.infobox.name > another.infobox.name ? 1 : -1
        });
    }

    dispatchMessage = (event) => {
        let data = JSON.parse(event.data);
        let regions = this.state.regions;
        let infobox = this.state.infobox;
        switch(data.type) {
            case 'PUZZLE_CHECK_SUCCESS':
                regions = regions.map((region) => {
                    if (region.id === data.id) {
                        return {
                            ...region,
                            draggable: false,
                            isSolved: true,
                            infobox: {...prepareInfobox(data.infobox), loaded: true},
                            paths: decodePolygon(data.polygon),
                        };
                    } else {
                        return region;
                    }
                });
                infobox = data.infobox;
                break;
            case 'PUZZLE_GIVEUP_DONE':
                regions = regions.map((polygon) => {
                    if (!polygon.isSolved) {
                        let solve = data.solves[polygon.id];
                        return {
                            ...polygon,
                            draggable: false,
                            infobox: {...prepareInfobox(solve.infobox), loaded: true},
                            paths: decodePolygon(solve.polygon),
                        };
                    } else {
                        return polygon;
                    }
                });
                break;
        }
        this.setState({...this.state, regions: regions, infobox: infobox});
    };

    mapInit = () => {
        fetch(location.pathname.replace('/puzzle/', '/puzzle/questions/') + location.search)
            .then(response => response.json())
            .then(data => {
                this.startGame({regions: Puzzle.extractData(data.questions, data.solved)});
            })
            .catch(response => {
                console.log(response);
                this.setState({...this.state, isLoaded: false})
            });
    };

    giveUp = () => {
        let ids = this.state.regions.filter(obj => (!obj.isSolved)).map(polygon => (polygon.id));
        return this.ws.json({ids: ids, type: 'PUZZLE_GIVEUP'});
    };

    onDragEnd = (coords, id) => {
        this.ws.json({type: 'PUZZLE_CHECK', coords: coords, id: id, zoom: window.__MAP__.zoom});
    };

    render_question() {
        return <Button bsStyle="success" onClick={this.giveUp}>
            {localization.give_up}
        </Button>;
    }
}


export default Puzzle;