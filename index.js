

var Service, Characteristic

module.exports = (homebridge) => {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-dummy-lock', 'DummyLock', DummyLock)
}

class DummyLock {
  constructor (log, config) {
    // get config values
    this.log = log;
    this.name = config['name'];
    this.lockService = new Service.LockMechanism(this.name);
    this.lockState = Characteristic.LockCurrentState.SECURED;
  }



  getServices () {
    const informationService = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, 'Acme')
        .setCharacteristic(Characteristic.Model, 'Dummy Lock 1.0')
        .setCharacteristic(Characteristic.SerialNumber, '1234');

    this.lockService.getCharacteristic(Characteristic.LockCurrentState)
      .on('get', this.getLockCharacteristicHandler.bind(this));

    this.lockService.getCharacteristic(Characteristic.LockTargetState)
      .on('get', this.getLockCharacteristicHandler.bind(this))
      .on('set', this.setLockCharacteristicHandler.bind(this));

    return [informationService, this.lockService]
  }


  actionCallback(err, result) {
    if(err) {
      this.updateCurrentState(Characteristic.LockCurrentState.JAMMED);
      return console.error(err);
    }
  }

  // Lock Handler
  setLockCharacteristicHandler (targetState, callback) {
    var lockh = this;

    if (targetState == Characteristic.LockCurrentState.SECURED) {
      this.log(`locking `+this.name, targetState)
      this.lockState = targetState
      this.updateCurrentState(this.lockState);
      this.log(this.lockState+" "+this.name);
    } else {
      this.log(`unlocking `+this.name, targetState)
      this.lockState = targetState
      this.updateCurrentState(this.lockState);
      this.log(this.lockState+" "+this.name);
    }
    callback();
  }

  updateCurrentState(toState) {
    this.lockService
      .getCharacteristic(Characteristic.LockCurrentState)
      .updateValue(toState);
  }

  getLockCharacteristicHandler (callback) {
    callback(null, this.lockState);
  }
}
