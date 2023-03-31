class clsDIOTable {
  Inputs
  Outputs
  constructor() {
    this.Inputs = [
      new clsRegister('X0000', 'name1'),
      new clsRegister('X0001', 'name2'),
    ]
    this.Outputs = [
      new clsRegister('Y0000', 'name1'),
      new clsRegister('Y0001', 'name2'),
    ]
  }
}

export class clsRegister {
  constructor(address_display, name) {
    this.address_display = address_display
    this.name = name
  }
  address = 0
  address_display = ''
  name = ''
  State = false
  DigitalType = 0
}

export default clsDIOTable
