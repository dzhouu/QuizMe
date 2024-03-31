import React, { Component} from "react";
import { FlashcardCreate } from "./FlashcardCreate";
import { FlashcardPractice } from "./FlashcardPractice";
import { FlashcardList } from "./FlashcardList";
import {FlashCardScore} from "./FlashCardScore";


/** Type Page of different ways of rendering different pages*/
type Page = {kind: "create"} | {kind: "practice", name: string} | {kind: "list"} | {kind: "scorepage"};

type FlashcardAppState = {
  page: Page; // Page we want to be on
};

/** Displays the UI of the Flashcard application. */
export class FlashcardApp extends Component<{}, FlashcardAppState> {

  constructor(props: {}) {
    super(props);

    this.state = {page: {kind: "list"}};
  }

  render = (): JSX.Element => {
    if (this.state.page.kind === "list") {
      return <FlashcardList onCreateClick={this.doCreateClick} onListClick={this.doListClick} onPracticeClick={this.doPracticeClick} onScoreClick={this.doScoreClick}/>;
    } else if (this.state.page.kind === "create") {
      return <FlashcardCreate onListClick={this.doListClick}/>
    } else if (this.state.page.kind === "practice"){
      return <FlashcardPractice name={this.state.page.name} onListClick={this.doListClick}/>
    } else {
      return <FlashCardScore onListClick={this.doListClick}/>
    }
  };

  /** Clicks to open the create flashcard set page */
  doCreateClick = (): void => {
    this.setState({page: {kind: "create"}});
  };

  /** Clicks to open the flashcard set that was created to start practicing */
  doPracticeClick = (name: string): void => {
    this.setState({page: {kind: "practice", name}});
  };

  /** Clicks to return back to the list main page */
  doListClick = (): void => {
    this.setState({page: {kind: "list"}});
  };

  /** Clicks to open the history of Scores page */
  doScoreClick = (): void => {
    this.setState({page: {kind: "scorepage"}});
  };
}