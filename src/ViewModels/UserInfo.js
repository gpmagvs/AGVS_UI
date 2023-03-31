class UserInfo {
  constructor(Username, Role) {
    this.UserName = Username
    this.Role = Role
  }
  UserName = ''
  Role = 0
  GetRoleName() {
    if (this.Role == 0) {
      return 'Operator'
    } else if (this.Role == 1) {
      return 'ENG'
    } else if (this.Role == 2) {
      return 'Developer'
    } else if (this.Role == 3) {
      return 'GOD'
    } else {
      return 'Unknown'
    }
  }
}
export default UserInfo
