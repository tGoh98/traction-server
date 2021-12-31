/**
 * Deck contains utility functions to deal with the deck
 */
 export default class Deck {
  static ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
  static suits = ['H', 'S', 'D', 'C'];
  
  /**
   * Creates 104 card traction deck
   * @returns 
   */
  static createDeck() {
    var deck = [];
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        deck.push(rank + suit);
        deck.push(rank + suit);
      }
    }
    return deck;
  }

  /**
   * Shuffles deck array using Durstenfeld shuffle 
   * @param deck 
   * @returns
   */
  static shuffleDeck(deck) {
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }
    return deck;
  }

  /**
   * Generates a full, shuffled deck
   * @returns 
   */
  static genDeck() {
    return this.shuffleDeck(this.createDeck());
  }
}