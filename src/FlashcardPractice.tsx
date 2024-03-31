import React, {ChangeEvent, Component, MouseEvent} from "react";
import {isRecord} from "./record";
import {FlashCardScore} from "./FlashCardScore";


type QnA = {
    question: string,
    answer: string
};

type PracticeProps = {
    name: string,
    onListClick: () => void,
};

type PracticeStates = {
    userName: string;         // Name after finishing
    setName: string;          // Name of the set
    setQnA: QnA[];            // Array of QnA(Front|Back)
    qna: QnA;                 // Record Type QnA
    index: number;            // Index of Where We Are in the FlashCard
    correct: number;          // Tracks the correctness
    incorrect: number;        // Tracks the incorrectness
    showQuestion: boolean;    // Utilized for Flipping
    isFinished: boolean;      // Checks if we are at the end of the set
};

/** Displays the UI of the FlashcardPractice Page. */
export class FlashcardPractice extends Component<PracticeProps, PracticeStates> {

    constructor(props: PracticeProps) {
        super(props);

        this.state = {setName: "", setQnA: [], index : 1, qna: {question: "", answer: ""}, correct: 0, incorrect: 0,
            showQuestion: true, isFinished: false, userName: ""};
    }
    componentDidMount = (): void => {
        this.doLoadClick();
    };

    render = (): JSX.Element => {
        if (this.state.isFinished) {
            return <FlashCardScore onListClick={this.doDoneClick}/>;
        } else if (this.state.index > this.state.setQnA.length) {
            return (
                <div style={{textAlign:'center'}}>
                    <h1 style={{fontFamily: 'Nunito Sans', fontSize: '50px'}}>{this.props.name}</h1>
                    <h2>Correct: {this.state.correct} | Incorrect: {this.state.incorrect}</h2>
                    <p>End of Quiz</p>
                    <div>
                        <label htmlFor="answer">Name: </label>
                        <input style={{backgroundColor: '#eee',
                            border: 'none',
                            padding: '0.5rem',
                            fontSize: '1rem',
                            width: '10em',
                            borderRadius: '1rem',
                            color: 'lightcoral',
                            boxShadow: '0 0.4rem #dfd9d9',
                            cursor: 'pointer'}} type="text" value={this.state.userName} onChange={this.doSetNameClick}/>
                        <button type={"button"} onClick={this.doFinishClick}>Finish</button>
                    </div>
                </div>);
        } else {
            return (
                <div style={{textAlign:'center'}}>
                    <div>
                        <h1 style={{fontFamily: 'Nunito Sans', fontSize: '50px'}}>{this.props.name}</h1>
                        <h2>Correct: {this.state.correct} | Incorrect: {this.state.incorrect}</h2>
                    </div>
                    <div>
                    <textarea id="textbox" readOnly value={this.state.showQuestion ? this.state.qna.question : this.state.qna.answer}
                        style={{padding: '50px', border: '1px solid', textAlign: 'center', fontSize: '30px', width: '50%',
                          fontFamily: 'Arial, sans-serif', borderRadius: '5px', resize: 'none', filter: 'drop-shadow(0 0 1.2em #29222d)'}}></textarea>
                    </div>
                    <div style={{padding: '10px'}}>
                        <button type={"button"} onClick={this.doFlipClick}>Flip</button>
                        <button type={"button"} onClick={this.doCorrectClick}>Correct</button>
                        <button type={"button"} onClick={this.doIncorrectClick}>Incorrect</button>
                        <button type={"button"} onClick={this.doDoneClick}>Done</button>
                    </div>
                </div>
            );
        }
    };

    /** Sets the username that practiced the Flashcard Set */
    doSetNameClick = (_evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({userName: _evt.target.value});
    };

    /** Handles request for /load by loading the Flashcard Set content */
    doLoadClick = (): void => {
        const url = "api/load?name=" + encodeURIComponent(this.props.name);

        fetch(url)
            .then(this.doLoadResp)
            .catch(this.doLoadError);
    };

    /** Called with the response from the request to /api/load */
    doLoadResp = (res: Response): void => {
        if (res.status === 200) {
            res.json().then(this.doLoadJson)
                .catch(() => this.doLoadError("200 response is not valid JSON"));
        } else if (res.status === 400) {
            res.text().then(this.doLoadError)
                .catch(() => this.doLoadError("400 response is not text"));
        } else {
            this.doLoadError(`bad status code ${res.status}`);
        }
    };

    /** Called with the JSON response from /api/load */
    doLoadJson = (val: unknown): void => {
        if (!isRecord(val)) {
            console.error("bad data from /load: not a record", val)
            return;
        }
        if (typeof val.name !== "string") {
            throw new Error(`val.name is not type string: ${typeof val.name}`);
        }
        if (!Array.isArray(val.content)) {
            throw new Error(`val.content is not type Array: ${typeof val.content}`);
        }

        if (val.content.length > 0) {
            this.setState({
                setName: val.name,
                setQnA: val.content,
                qna: val.content[0],
            });
        }
        this.setState({setName: val.name, setQnA: val.content})
    };

    /** Called for Load error */
    doLoadError = (msg: string): void => {
        console.error(`Error fetching /load: ${msg}`)
    };

    /** Click if correct and updates the correct count */
    doCorrectClick = (): void => {
        const index = this.state.index;
        const question: QnA = this.state.setQnA[index];
        this.setState({
            qna: question,
            correct: this.state.correct + 1,
            index: this.state.index + 1,
            showQuestion: true
        });
    };

    /** Click if incorrect and updates the incorrect count */
    doIncorrectClick = (): void => {
        const index = this.state.index;
        const question: QnA = this.state.setQnA[index];
        this.setState({
            qna: question,
            incorrect: this.state.incorrect + 1,
            index: this.state.index + 1,
            showQuestion: true
        });
    };

    /** Allows us to randomly exit the practice and return back to list */
    doDoneClick = (): void => {
        this.setState({qna: {question: "", answer: ""}, index: 0})
        this.props.onListClick();
    }

    /** Flips the card front|back */
    doFlipClick = (): void => {
        if (this.state.showQuestion) {
            this.setState({showQuestion: false})
        } else {
            this.setState({showQuestion: true});
        }
    };

    /** Called to send request for api/saveScore */
    doFinishClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        const percentage = Math.floor((this.state.correct / (this.state.correct + this.state.incorrect)) * 100);
        const url = "api/saveScore?name=" + encodeURIComponent(this.state.userName);

        if (this.state.userName.length === 0) {
            alert("Must Type Something In");
            return;
        }

        fetch(url, {
            method: "POST", body: JSON.stringify({username: this.state.userName, setName: this.state.setName, percent: percentage.toString()}),
            headers: {"Content-Type": "application/json"}
        })
            .then(this.doSaveScoreResp)
            .catch(this.doSaveScoreError);
    };

    /** Called with the response from the request to api/saveScore */
    doSaveScoreResp = (res: Response): void => {
        if (res.status === 200) {
            res.json().then(this.doSaveScoreJson)
                .catch(() => this.doSaveScoreError("200 response is not valid JSON"));
        } else if (res.status === 400) {
            res.text().then(this.doSaveScoreError)
                .catch(() => this.doSaveScoreError("400 response is not text"));
        } else {
            this.doSaveScoreError(`bad status code ${res.status}`);
        }
    };

    /**  Called with the JSON response from /api/saveScore */
    doSaveScoreJson = (data: unknown): void => {
        if (!isRecord(data)) {
            console.error("bad data from /saveScore: not a record", data);
            return;
        }

        if (typeof data.savedscore !== 'boolean') {
            console.error("bad data from /saveScore: name is not a boolean", data);
            return;
        }

        if (!data.savedscore) {
            alert("We Saved It");
        }

        if (this.state.setName === undefined) {
            throw new Error('impossible: set is undefined');
        }

        this.setState({isFinished: true});
    };

    /** Called when we fail trying to saveScore */
    doSaveScoreError = (msg: string): void => {
        console.error(`Error fetching /savedScore: ${msg}`);
    };
}