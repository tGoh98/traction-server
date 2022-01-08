import Deck from './Deck.js';
import Tile from './Tile.js';
import { removeElem } from './util.js';

/**
 * A State object holds the information for the game state
 */
 export default class State {
  constructor(isTurn, numPlayers) {
    this.isTurn = isTurn;
    
    const tempDeck = Deck.genDeck();
    [this.playerHands, this.deck] = this.deal(numPlayers, tempDeck);

    this.board = this.genBoard();
  }

  /**
   * Deal cards 
   * @param numPlayers 
   * @param deck 
   * @returns 
   */
  deal(numPlayers, deck) {
    let hands = [];
    let numCards = -1;

    // Determine number of cards to deal
    switch (numPlayers) {
      case 2:
        numCards = 7;
        break;
      case 3:
      case 4:
        numCards = 6;
        break;
      case 6:
        numCards = 5;
        break;
      case 8:
      case 9:
        numCards = 4;
        break;
      case 10:
      case 12:
        numCards = 3;
        break;
      default:
        numCards = -1;
    }

    // Deal
    for (var i=0; i<numPlayers; i++) {
      var hand = [];
      for (var j=0; j<numCards; j++) {
        hand.push(deck.pop());
      }
      hands.push(hand);
    }

    return [hands, deck];
  }

  /**
   * Randomly generates board
   * @returns
   */
  genBoard() {
    let cards = Deck.genDeck();
    cards = removeElem('JH', cards);
    cards = removeElem('JS', cards);
    cards = removeElem('JD', cards);
    cards = removeElem('JC', cards);

    let board = [];
    for (const card of cards) {
      board.push(new Tile(card));
    }

    // The 4 corners are free tiles
    board[0].marked = 'free';
    board[9].marked = 'free';
    board[90].marked = 'free';
    board[99].marked = 'free';

    return board;
  }

/**
 * Removes card from hand
 * @param {*} index 
 * @param {*} card 
 */
  removeFromHand(index, card) {
    this.playerHands[index] = removeElem(card, this.playerHands[index]);
  }

  /**
   * Places a tile
   * @param {*} teamName 
   * @param {*} pos 
   */
  placeTile(teamName, pos) {
    this.board[pos].marked = teamName;
  }

  /**
   * Removes a tile
   * @param {*} pos 
   */
  removeTile(pos) {
    this.board[pos].marked = '';
  }

  /**
   * Draws a card
   * @param {*} index 
   */
  drawCard(index) {
    const newCard = this.deck.pop();
    this.playerHands[index].push(newCard);
  }
}