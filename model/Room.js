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
    this.order = [];
    this.state = {};
  }

  addMember(newMember) {
    this.members.push(newMember);
  }
  
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