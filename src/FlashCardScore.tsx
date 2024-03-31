import React, { Component } from "react";
import {isRecord} from "./record";

type Score = {
    username: string;
    setName: string;
    percent: string;
};

type ScoreProps = {
    onListClick: () => void;
};

type ScoreState = {
    setListScore: Score[];
};

/** Displays the UI of the Flashcard Score application. */
export class FlashCardScore extends Component<ScoreProps, ScoreState> {
    constructor(props: ScoreProps) {
        super(props);

        this.state = {setListScore: []};
    }

    componentDidMount = (): void => {
        this.doRefreshTimeout();
    };

    render = (): JSX.Element => {
        return (
            <div style={{textAlign: 'center'}}>
                <h1 style={{fontFamily: 'Nunito Sans', fontSize: '50px'}}>Scores</h1>
                <div style={{border:'1px', borderRadius: '50px', background: '#ddcbec',
                    boxShadow: '37px 37px 73px #83a491 -37px -37px 73px #b1dec5', margin: 'auto', width: '50%'}}>
                    {this.renderSetListScores()}
                </div>
                <div style={{padding: '10px'}}>
                    <button type={"button"} onClick={this.doListClick}>Back</button>
                    <button type={"button"} onClick={this.doClearScoreClick}>Clear</button>
                </div>
            </div>
        );
    };

    renderSetListScores = (): JSX.Element[] => {
        const setListScoresHistory: JSX.Element[] = [];
        for (const [index, scores] of this.state.setListScore.entries()) {
            setListScoresHistory.push(
                <li key={index}>
                    User: {scores.username} | Flashcard Set: {scores.setName} | Score: {scores.percent}%
                </li>
            );
        }
        return setListScoresHistory;
    };

    /** Allow access for clients to return back to main page after done viewing score*/
    doListClick = (): void => {
        this.props.onListClick();
    };

    /** Called to send request to api/listScores */
    doRefreshTimeout = (): void => {
        fetch("/api/listScores")
            .then(this.doScoreResp)
            .catch(() => this.doScoreError("failed to connect to server"));
    };

    /** Called with the response from a request to /api/listScores */
    doScoreResp = (res: Response): void => {
        if (res.status === 200) {
            res.json().then(this.doScoreJson)
                .catch(() => this.doScoreError("200 response is not valid JSON"));
        } else if (res.status === 400) {
            res.text().then(this.doScoreError)
                .catch(() => this.doScoreError("400 response is not text"));
        } else {
            this.doScoreError(`bad status code ${res.status}`);
        }
    };

    /** Called with the JSON response from /api/listScores */
    doScoreJson = (val: unknown): void => {
        if (!isRecord(val)) {
            console.error("bad data from /listScores: not a record", val)
            return;
        }

        if (!Array.isArray(val.scores)) {
            throw new Error("Array is bad");
        }
        this.setState({setListScore: val.scores});
    };

    /** Called for listScores error */
    doScoreError = (msg: string): void => {
        console.error(`Error fetching /listScores: ${msg}`);
    };

    /** Called to send a request to api/clearScore */
    doClearScoreClick = (): void => {
        fetch("/api/clearScore")
            .then(this.doClearScoreResp)
            .catch(() => this.doClearScoreError("failed to connect to server"));
    };

    /** Called with the response from the request to /api/clearScores */
    doClearScoreResp = (res: Response): void => {
        if (res.status === 200) {
            res.json().then(this.doClearScoreJson)
                .catch(() => this.doClearScoreError("200 response is not valid JSON"));
        } else if (res.status === 400) {
            res.text().then(this.doClearScoreError)
                .catch(() => this.doClearScoreError("400 response is not text"));
        } else {
            this.doClearScoreError(`bad status code ${res.status}`);
        }
    };

    /** Called with the JSON response from /api/clearScores */
    doClearScoreJson = (data: unknown): void => {
        if (!isRecord(data)) {
            console.error("bad data from /save: not a record", data);
            return;
        }
        if (typeof data.cleared !== 'boolean') {
            console.error("bad data from /save: name is not a boolean", data);
            return;
        }

        console.log("Cleared");
        this.doRefreshTimeout();
    };

    /** Error Handling for ClearScores */
    doClearScoreError = (msg: string): void => {
        console.error(`Error fetching /load: ${msg}`)
    };
}