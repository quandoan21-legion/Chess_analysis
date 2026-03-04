declare module 'chess-web-api' {
  export default class ChessWebAPI {
    constructor(options?: any)
    getPlayer(username: string, options?: any, callback?: any): Promise<any>
    getPlayerStats(username: string, options?: any, callback?: any): Promise<any>
    getPlayerMonthlyArchives(username: string, options?: any, callback?: any): Promise<any>
    getPlayerCompleteMonthlyArchives(username: string, year: number, month: number, options?: any, callback?: any): Promise<any>
  }
}
