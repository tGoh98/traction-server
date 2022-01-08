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
    const mod = Math.floor(Math.random() * this.getNumTeams());
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
   * Checks if the team that just went won
   * @param {*} teamName 
   * @returns 
   */
  gameWon(teamName) {
    const over = this.checkBoardWin(teamName);
    if (over) this.gameStage = 'over';
    return over;
  }

  /**
   * Checks if win condition has been satisfied
   * @param {*} teamName 
   * @returns 
   */
  checkBoardWin(teamName) {
    const needed = this.getNumTeams() === 2 ? 2 : 1;
    let accum = 0;

    const iters = this.state.board.length / 10;
    let horiz = this.buildArray((i, j) => i*10 + j, iters);
    let vert = this.buildArray((i, j) => i + j*10, iters);
    let diag = this.buildArrayDiag(this.state.board);
    let diagReverse = this.buildArrayDiag(this.flipMat(this.state.board, 10));

    accum += this.checkOneOrient(teamName, horiz);
    accum += this.checkOneOrient(teamName, vert);
    accum += this.checkOneOrient(teamName, diag);
    accum += this.checkOneOrient(teamName, diagReverse);

    return accum >= needed;
  }

  /**
   * Given offsetFunc, returns array built from board
   * @param {*} offsetFunc 
   * @returns 
   */
  buildArray(offsetFunc, iters) {
    let finalArr = [];
    for (let i=0; i<iters; i++) {
      let tempArr = [];
      for (let j=0; j<iters; j++) {
        tempArr.push(this.state.board[offsetFunc(i, j)]);
      }
      finalArr.push(tempArr);
    }
    return finalArr;
  }

  /**
   * Build diagonal arrays is harder
   * @returns 
   */
  buildArrayDiag(arr) {
    let finalArr = [];
    
    for (var k=0; k<20; k++) {
      let tempArr = [];
      for (var j=0; j<=k; j++) {
        const i = k - j;
        if (i < 10 && j < 10) {
          tempArr.push(arr[i*10 + j]);
        }
      }
      finalArr.push(tempArr);
    }
    return finalArr;
  }

  /**
   * Reverse 1d matrix for reverse diagonal iteration
   * @param {*} arr 
   * @param {*} axis 
   */
  flipMat(arr, axis) {
    let finalArr = [];
    for (var i=0; i<axis; i++) {
      let tempArr = [];
      for (var j=0; j<axis; j++) {
        tempArr.push(arr[i*axis+j]);
      }
      tempArr.reverse();
      finalArr = finalArr.concat(tempArr);
    }
    return finalArr;
  }

  /**
   * Gets number of completed sequences for a list of lists
   * @param {*} teamName 
   * @param {*} arrs 
   * @returns 
   */
  checkOneOrient(teamName, arrs) {
    let totalSequences = 0;
    for (const arr of arrs) {
      // Only need to check diags where length >= 5
      if (arr.length < 5) continue;

      let maxSeq = 0;
      let curSeq = 0;
      for (const tile of arr) {
        if (tile.marked === teamName || tile.marked === 'free') curSeq++;
        else curSeq = 0;
        maxSeq = Math.max(curSeq, maxSeq);
      }
      totalSequences += Math.floor(maxSeq / 5);
    }

    return totalSequences;
  }

  /**
   * Calculates the number of teams (there can be 2 or 3)
   * @returns 
   */
  getNumTeams() {
    let bound = Math.max(this.teams['red'].length, this.teams['green'].length);
    return this.members.length / bound;
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