'use strict';
import {
    GET_INFOBOX_DONE, INIT_PUZZLE_DONE, INIT_QUIZ_DONE, QUIZ_GIVEUP,
    DRAG_END_POLYGON, DRAG_END_POLYGON_FAIL, CHECK_QUIZ_SUCCESS,
    PUZZLE_GIVEUP, prepareInfobox
} from "../actions";


function moveTo(paths, latLng) {
    let polygon = new google.maps.Polygon({geodesic: true, paths: paths});
    polygon.moveTo(latLng);
    return polygon.getPaths();
}


function extractForPuzzle(countries) {
    return countries.map(country => {
        let paths = country.polygon.map(polygon => (google.maps.geometry.encoding.decodePath(polygon)));
        return {
            id: country.id,
            draggable: true,
            isSolved: false,
            infobox: {name: country.name, loaded: false},
            paths: moveTo(
                paths,
                new google.maps.LatLng(country.default_position[1], country.default_position[0])),
        }
    }).sort((one, another) => {
        return one.infobox.name > another.infobox.name ? 1 : -1
    });
}

function extractForQuiz(polygons) {
    return polygons.map(polygon => {
        return {
            id: polygon.id,
            draggable: true,
            isSolved: false,
            infobox: {name: polygon.name, loaded: false},
            paths: []
        }
    }).sort((one, another) => {
        return one.infobox.name > another.infobox.name ? 1 : -1
    });
}

function decodePolygon(polygon) {
    return polygon.map(polygon => (google.maps.geometry.encoding.decodePath(polygon)));
}

const polygons = (state = [], action) => {
    switch (action.type) {
        case GET_INFOBOX_DONE:
            return state.map((country) => {
                if (country.id === action.id) {
                    return {...country, infobox: {...action.data, loaded: true}};
                }
                return country
            });
        case CHECK_QUIZ_SUCCESS:
        case QUIZ_GIVEUP:
            let infobox = prepareInfobox(action.infobox);
            return state.map((polygon) => {
                if (polygon.id === action.id) {
                    return {
                        draggable: false,
                        id: action.id,
                        isSolved: action.type === CHECK_QUIZ_SUCCESS,
                        infobox: {...infobox, loaded: true},
                        paths: action.polygon.map(polygon => (google.maps.geometry.encoding.decodePath(polygon)))
                    };
                }
                return polygon
            });
        case INIT_PUZZLE_DONE:
            return extractForPuzzle(action.countries);
        case INIT_QUIZ_DONE:
            return extractForQuiz(action.questions);
        case PUZZLE_GIVEUP:
            return state.map((polygon) => {
                if (!polygon.isSolved) {
                    let solve = action.solves[polygon.id];
                    return {
                        ...polygon,
                        draggable: false,
                        infobox: solve.infobox,
                        paths: decodePolygon(solve.polygon),
                    };
                }
                return polygon
            });
        case DRAG_END_POLYGON_FAIL:
            return state.map((polygon) => {
                if (polygon.id === action.id) {
                    return {...polygon, paths: action.paths};
                }
                return polygon
            });
        case DRAG_END_POLYGON:
            return state.map((polygon) => {
                if (polygon.id === action.id) {
                    return {
                        ...polygon,
                        draggable: false,
                        isSolved: true,
                        infobox: action.infobox,
                        paths: decodePolygon(action.polygon),
                    };
                }
                return polygon
            });
        default:
            return state
    }
};


export default polygons