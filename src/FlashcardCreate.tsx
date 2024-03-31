import React, {ChangeEvent, Component, MouseEvent} from "react";
import {isRecord} from "./record";

type CreateProps = {
    onListClick: () => void
}

type CreateStates = {
    setName: string;
    flashcardSetQnA: string;
}

/** Displays the UI of the FlashcardCreate Page. */
export class FlashcardCreate extends Component<CreateProps, CreateStates> {

    constructor(props: CreateProps) {
        super(props);

        this.state = {setName: "", flashcardSetQnA: ""};
    }

    render = (): JSX.Element => {
        return (
            <div style={{textAlign: "center"}}>
                <div>
                    <h1 style={{fontFamily: 'Nunito Sans', fontSize: '50px'}}>Create New Study Set</h1>
                </div>
                <div>
                    <label style={{fontFamily:'monospace'}} htmlFor="answer">Study Set Name:</label>
                    <input type="text"  style={{backgroundColor: '#eee',
                        border: 'none',
                        padding: '0.5rem',
                        fontSize: '1rem',
                        width: '10em',
                        borderRadius: '1rem',
                        color: 'lightcoral',
                        boxShadow: '0 0.4rem #dfd9d9',
                        cursor: 'pointer'}} value={this.state.setName} onChange={this.doSetNameClick}/>
                </div>
                <div style={{padding: '20px'}}>
                    <label htmlFor="textbox">Directions (one per line, formatted as front|back)</label>
                    <br/>
                    <textarea id="textbox" rows={3} cols={40} value={this.state.flashcardSetQnA}
                              onChange={this.doFlashSetClick}></textarea>
                </div>
                <button type="button" onClick={this.doBackClick}>Back</button>
                <button type="button" onClick={this.doSaveClick}>Save</button>
            </div>);
    };

    /** Sets the name of the flash set */
    doSetNameClick = (_evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({setName: _evt.target.value});
    };

    /** Creates the questions and answers for the flashcards */
    doFlashSetClick = (_evt: ChangeEvent<HTMLTextAreaElement>): void => {
        this.setState({flashcardSetQnA: _evt.target.value});
    };

    /** Performs a return to main page after the set is created and saved */
    doBackClick = (): void => {
        this.props.onListClick();
    };

    /** Called to send request for api/save */
    doSaveClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        const name = this.state.setName
        const url = "api/save?name=" + encodeURIComponent(name);
        if (name.length === 0 || this.state.flashcardSetQnA.length === 0) {
            alert("Must Input a Name or Enter Some Card Values");
            return;
        }

        fetch(url, {
            method: "POST", body: JSON.stringify({name: name, value: this.state.flashcardSetQnA}),
            headers: {"Content-Type": "application/json"}
        })
            .then(this.doSaveResp)
            .catch(this.doSaveError);
    }

    /** Called with the response from the request to api/save */
    doSaveResp = (res: Response): void => {
        if (res.status === 200) {
            res.json().then(this.doSaveJson)
                .catch(() => this.doSaveError("200 response is not valid JSON"));
        } else if (res.status === 400) {
            res.text().then(this.doSaveError)
                .catch(() => this.doSaveError("400 response is not text"));
        } else {
            this.doSaveError(`bad status code ${res.status}`);
        }
    };

    /**  Called with the JSON response from api/save */
    doSaveJson = (data: unknown): void => {
        if (!isRecord(data)) {
            console.error("bad data from /save: not a record", data);
            return;
        }

        if (typeof data.check !== 'boolean') {
            console.error("bad data from /save: name is not a boolean", data);
            return;
        }

        if (!data.check) {
            console.log("We saved it");
        }

        if (this.state.setName === undefined) {
            throw new Error('impossible: set is undefined');
        }

        this.props.onListClick();
    };

    /** Called when we fail trying to save */
    doSaveError = (msg: string): void => {
        alert(msg);
    };
}