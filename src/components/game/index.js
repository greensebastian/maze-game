import React, { useState, useEffect } from 'react';
import { CONSTANT_STRINGS } from '../../resources';
import './Game.scss';

const cycleTimeMs = 1000 / 60;
const pollingTimeMs = cycleTimeMs / 5;
const targetSpeed = 300; // px per second

const Game = (props) => {
    const [keyState, setKeyState] = useState({});
    const [state, setState] = useState({
        x: 0,
        y: 0,
        lastUpdated: Date.now()
    });

    // Initialize interval used for main loop
    useEffect(() => {
        let updateLoop = setInterval(() => {
            let updateTime = shouldUpdate(state.lastUpdated)
            if (updateTime !== state.lastUpdated) {
                setState(state => update(state, keyState, updateTime));
            }
        }, pollingTimeMs);
        return () => clearInterval(updateLoop);
    }, []);

    return (
        <div id="game"
            tabIndex="0"
            onKeyDown={(event) => handleKeyEvent(event, setKeyState, true)}
            onKeyUp={(event) => handleKeyEvent(event, setKeyState, false)}
            style={{
                top: Math.floor(state.y),
                left: Math.floor(state.x)
            }}
        >
            <h1>Move me with WASD</h1>
        </div>
    );
}

// Main game loop
const update = (state, keyState, updateTime) => {
    const elapsedTime = (updateTime - state.lastUpdated) / 1000;
    let moveDistance = targetSpeed * elapsedTime;

    state.lastUpdated = updateTime;
    let changed = false;
    if (keyState[CONSTANT_STRINGS.KEY_UP] === true) {
        state.y -= moveDistance;
        changed = true;
    }
    if (keyState[CONSTANT_STRINGS.KEY_DOWN] === true) {
        state.y += moveDistance;
        changed = true;
    }
    if (keyState[CONSTANT_STRINGS.KEY_RIGHT] === true) {
        state.x += moveDistance;
        changed = true;
    }
    if (keyState[CONSTANT_STRINGS.KEY_LEFT] === true) {
        state.x -= moveDistance;
        changed = true;
    }
    // Re-render is triggered by reassigning state object
    // Only trigger re-rendering if the values have changed
    if (changed)
        return Object.assign({}, state);
    else 
        return state;
}

// Bridge between polling rate and cycle time
const shouldUpdate = (lastTime) => {
    let currentTime = Date.now();
    if (currentTime - lastTime > cycleTimeMs) {
        return currentTime;
    }
    return lastTime;
}

const handleKeyEvent = (event, setState, isAddAction) => {
    event.stopPropagation();
    // Extract values because event is pooled and will be recycled before async setState is finished
    const key = event.key;
    const repeat = event.repeat;
    // Update state through provided hook
    setState(keyState => {
        if (repeat === true) return keyState;
        keyState[key] = isAddAction;
        return keyState;
    });
}

export default Game;