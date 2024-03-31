import React, { Component, MouseEvent } from "react";
import {isRecord} from "./record";
import "./style.css"

type ListProps = {
    onCreateClick: () => void,
    onListClick: () => void,
    onPracticeClick: (name: string) => void,
    onScoreClick: () => void,
};

type ListStates = {
    setName: string;  // Name of the Flashcard Set
    setList: string[]; // List of Flashcard Sets Created
};

export class FlashcardList extends Component<ListProps, ListStates> {
    constructor(props: ListProps) {
        super(props);

        this.state = {setName: "", setList: []};
    }

    /** Mounts the list */
    componentDidMount = (): void => {
        this.doRefreshTimeout();
    };

    render = (): JSX.Element => {
        return (
            <div style={{textAlign: 'center'}}>
                <h1 style={{color: '#4CAF50', letterSpacing: '2px', marginBottom: '20px', fontSize: '80px', fontFamily: 'Baskerville'}}>
                    QuizMe</h1>
                <h2 style={{fontSize: '30px', fontFamily: 'Nunito Sans'}}>Current Lists of Active Sets</h2>
                <div style={{padding: '10px'}}>
                    {this.renderFiles()}
                </div>
                <button type={"button"} onClick={this.doCreateClick}>Create</button>
                <button type={"button"} onClick={this.doClearClick}>Clear</button>
                <button type={"button"} onClick={this.doScoreClick}>Scores</button>
            </div>
        );
    };

    renderFiles = (): JSX.Element[] => {
        const sets: JSX.Element[] = [];
        for (const set of this.state.setList) {
            sets.push(
                <li key={set}>
                    <a href="#" onClick={(evt) => this.doPracticeClick(evt, set)}>{set}</a>
                </li>
            )
        }
        return sets;
    };

    /** Opens the Create Page */
    doCreateClick = () : void => {
        this.props.onCreateClick();
    };

    /** Opens the Score Page */
    doScoreClick = ():  void => {
        this.props.onScoreClick();
    };

    /** Opens the Flashcard Set that is clicked on the list */
    doPracticeClick = (evt: MouseEvent<HTMLAnchorElement>, name: string): void => {
        evt.preventDefault();
        this.props.onPracticeClick(name);
    };

    /** Called to refresh our list of names from the server. */
    doRefreshTimeout = (): void => {
        fetch("/api/lists")
            .then(this.doFileResp)
            .catch(() => this.doFileError("failed to connect to server"));
    };

    /** Called with the response from a request to /api/list */
    doFileResp = (res: Response): void => {
        if (res.status === 200) {
            res.json().then(this.doFileJson)
                .catch(() => this.doFileError("200 response is not valid JSON"));
        } else if (res.status === 400) {
            res.text().then(this.doFileError)
                .catch(() => this.doFileError("400 response is not text"));
        } else {
            this.doFileError(`bad status code ${res.status}`);
        }
    };

    /** Called with the JSON response from /api/list */
    doFileJson = (val: unknown): void => {
        if (!isRecord(val)) {
            console.error("bad data from /list: not a record", val)
            return;
        }

        if (!Array.isArray(val.sets)) {
            throw new Error("Array is bad");
        }
        this.setState({setList: val.sets});
    };

    /** Called when we fail trying to refresh the list from the server. */
    doFileError = (msg: string): void => {
        console.error(`Error fetching /list: ${msg}`);
    };


    /** Called to send a request to /api/clear */
    doClearClick = (): void => {
        fetch("/api/clear")
            .then(this.doClearResp)
            .catch(() => this.doClearError("failed to connect to server"));
    };

    /** Called with the response from the request to /api/clear */
    doClearResp = (res: Response): void => {
        if (res.status === 200) {
            res.json().then(this.doClearJson)
                .catch(() => this.doClearError("200 response is not valid JSON"));
        } else if (res.status === 400) {
            res.text().then(this.doClearError)
                .catch(() => this.doClearError("400 response is not text"));
        } else {
            this.doClearError(`bad status code ${res.status}`);
        }
    };

    /** Called with the JSON response from /api/clear */
    doClearJson = (data: unknown): void => {
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

    /** Error Handling for Clear */
    doClearError = (msg: string): void => {
        console.error(`Error fetching /load: ${msg}`)
    };
}