import State from './State.js';

/**
 * A Room object holds the information for a room
 */
export default class Room {
  constructor(roomCode, firstMember) {
    this.roomCode = roomCode;
    this.members = [firstMember];
    this.teams = {
      'red' : [],
      'green' : [],
      'blue' : []
    };
    this.gameStage = 'team';
    this.state = {};
  }

  addMember(newMember) {
    this.members.push(newMember);
  }
  
  /**
   * Moves specified user to a new team
   * @param name 
   * @param teamName 
   */
  joinTeam(name, teamName) {
    // Delete from old team
    for (const team in this.teams) {
      if (this.teams[team].includes(name)) {
        let i = this.teams[team].indexOf(name);
        if (i > -1) {
          this.teams[team].splice(i, 1);
        }
        break;
      }
    }

    // Add to new team
    this.teams[teamName].push(name);
  }

  /**
   * Reorders members field by alternating teams
   */
  setOrder() {
    // Watch for the case where there are only two teams
    let bound = Math.max(this.teams['red'].length, this.teams['green'].length);
    var order = [];
    
    for (var i=0; i<bound; i++) {
      if (i<this.teams['red'].length) {
        order.push(this.teams['red'][i]);
      }
      if (i<this.teams['green'].length) {
        order.push(this.teams['green'][i]);
      }
      if (i<this.teams['blue'].length) {
        order.push(this.teams['blue'][i]);
      }
    }
    
    // Randomize which team goes first
    const numTeams = order.length / bound;
    const mod = Math.floor(Math.random() * numTeams);
    for (var i=0; i<mod; i++) {
      order.push(order.shift());
    }

    this.members = order;
  }

  /**
   * Initializes game state
   */
  setState() {
    this.state = new State(this.members[0], this.members.length);
  }

  /**
   * Removes card from hand
   * @param {*} name 
   * @param {*} card 
   */
  removeFromHand(name, card) {
    const i = this.members.indexOf(name);
    this.state.removeFromHand(i, card);
  }

  /**
   * Places a tile
   * @param {*} teamName 
   * @param {*} pos 
   */
  placeTile(teamName, pos) {
    this.state.placeTile(teamName, pos);
  }

  /**
   * Removes a tile
   * @param {*} pos 
   */
   removeTile(pos) {
    this.state.removeTile(pos);
  }

  /**
   * Draws card and updates turn√
   * @param {*} name 
   */
  drawCard(name) {
    const i = this.members.indexOf(name);
    this.state.drawCard(i);
    
    this.state.isTurn = this.members[[(i + 1) % this.members.length]];
  }

  /**
   * 
   * @param existingCodes list of existing room codes
   * @returns a new valid room code (4 capital letters)
   */
  static getNewCode(existingCodes) {
    var newCode = Room.genCode(4);
    while (existingCodes.includes(newCode)) newCode = genCode(4);
    return newCode;
  }

  /**
   * 
   * @param len length of new code to generate
   * @returns code of length len
   */
  static genCode(len) {
    var res = '';
    for (var i=0; i<len; i++) res += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    return res;
  }
}